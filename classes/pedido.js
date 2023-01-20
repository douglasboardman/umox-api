const conn = require("../dbConnPool");
const { dateToBD, dateToView, Left } = require("../utils/comum");
const ItemPedido = require("./item_pedido");

class Pedido {
    constructor(idPedido, idUsuario, dtPedido, dtAtendimento, finalidade, status, observacaoAtendimento) {
        this.idPedido = idPedido;
        this.idUsuario = idUsuario;
        this.dtPedido = dtPedido;
        this.dtAtendimento = dtAtendimento;
        this.finalidade = finalidade;
        this.status = status;
        this.observacaoAtendimento = observacaoAtendimento;
    }

    async carregarPorId(idPedido) {
        try {
            const db_result = await conn.query(
                'SELECT * FROM pedidos WHERE id_pedido = $1',
                [idPedido]
            );

            if (typeof db_result.rows[0] != 'undefined') {
                this.idPedido = idPedido;
                this.idUsuario = db_result.rows[0].id_usuario;
                this.dtPedido = db_result.rows[0].data_pedido;
                this.dtAtendimento = db_result.rows[0].data_atendimento;
                this.finalidade = db_result.rows[0].finalidade_pedido;
                this.status = db_result.rows[0].status_pedido;
                this.observacaoAtendimento = db_result.rows[0].observacao_atendimento;
            }

        } catch(error) {
            console.log(error);
        }
    }

    async criarNovo(idUsuario, dtPedido, finalidade) {
        try {
            let novaId = await this.gerarId();
            const db_result = await conn.query(
                'INSERT INTO pedidos (id_pedido, id_usuario, data_pedido, finalidade_pedido) VALUES ($1, $2, $3, $4) RETURNING *',
                [novaId, idUsuario, dateToBD(dtPedido), finalidade]
            );

            if (typeof db_result.rows[0] != 'undefined') {
                this.idPedido = db_result.rows[0].id_pedido;
                this.idUsuario = db_result.rows[0].id_usuario;
                this.dtPedido = db_result.rows[0].data_pedido;
                this.dtAtendimento = db_result.rows[0].data_atendimento;
                this.finalidade = db_result.rows[0].finalidade_pedido;
                this.status = db_result.rows[0].status_pedido;
                return {status: true, msg: 'Pedido criado com sucesso!', dados: db_result.rows[0]};
            }
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async pedidosDoUsuario(idUsuario) {
        try {
            const db_result = await conn.query(
                'SELECT * FROM view_itens_pedido WHERE id_usuario = $1',
                [idUsuario]
            );

            if (typeof db_result.rows[0] != 'undefined') {
                const dados = this.#reduzirLista(db_result.rows);
                return {status: true, msg: `A consulta retornou ${dados.length} linhas`, dados: dados};
            } else {
                return {status: false, msg: 'Erro ao realizar a consulta no Banco', dados: []};
            }
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async listarTodos() {
        try {
            const db_result = await conn.query(
                'SELECT * FROM view_itens_pedido'
            );

            const dados = {data: db_result.rows, reduced_data: this.#reduzirLista(db_result.rows)}
            
            return {status: true, msg: `A consulta retornou ${dados.length} linhas`, dados: dados};
            
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async listarNaoAtendidos() {
        try {
            const db_result = await conn.query(
                "SELECT * FROM view_itens_pedido WHERE status_pedido = 'AGUARDANDO ATENDIMENTO'"
            );
            const dados = this.#reduzirLista(db_result.rows);

            return {status: true, msg: `A consulta retornou ${dados.length} linhas`, dados: dados};
            
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async finalizarPedido(id_pedido, observacao_atendimento, status_pedido, data_atendimento, objItens) {
        try {
                const db_result = await conn.query(
                    "UPDATE pedidos SET status_pedido = $1, observacao_atendimento = $2, data_atendimento = $3 WHERE id_pedido = $4 RETURNING *",
                    [status_pedido, observacao_atendimento, dateToBD(data_atendimento), id_pedido]
                );
                
                if(typeof db_result.rows[0] != 'undefined') {
                    let item = new ItemPedido;
                    const promises = objItens.map(async i => {
                        await item.atendimentoItemPedido(i.id_item, id_pedido, i.qtd_atendida);
                    });
                    await Promise.all(promises);
                };

                return {status: true, msg: 'Pedido finalizado com sucesso!', dados: []};

            } catch(erro) {

            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async gerarId() {
        const data = new Date();
        const ano = String(data.getFullYear());
        const db_result = await conn.query('SELECT id_pedido FROM pedidos ORDER BY id_pedido DESC');

        if(typeof db_result.rows[0] != 'undefined') {
            const lastId = String(db_result.rows[0].id_pedido);
            if(Left(lastId, 4) == ano){
                return parseInt(db_result.rows[0].id_pedido) + 1;
            } else {
                return parseInt(ano + '001');
            }
        } else {
            return parseInt(ano + '001');
        }
    }

    #reduzirLista(result) {

        let dados = result.reduce((acc, curr) => {
            const pedido = acc.find(p => p.id_pedido === curr.id_pedido);
            if (pedido) {
                pedido.itens.push({
                    id_item: curr.id_item,
                    descricao_item: curr.descricao_item,
                    marca_item: curr.marca_item,
                    un_medida_item: curr.un_medida_item,
                    estoque_item: curr.estoque_item,
                    qtd_solicitada: curr.qtd_solicitada,
                    qtd_atendida: curr.qtd_atendida
                });
            } else {
                acc.push({
                    id_pedido: curr.id_pedido,
                    nome_usuario: curr.nome_usuario,
                    finalidade_pedido: curr.finalidade_pedido,
                    data_pedido: dateToView(curr.data_pedido),
                    data_atendimento: curr.data_atendimento ? dateToView(curr.data_atendimento) : '-',
                    status_pedido: curr.status_pedido,
                    itens: [
                        {
                            id_item: curr.id_item,
                            descricao_item: curr.descricao_item,
                            marca_item: curr.marca_item,
                            un_medida_item: curr.un_medida_item,
                            estoque_item: curr.estoque_item,
                            qtd_solicitada: curr.qtd_solicitada,
                            qtd_atendida: curr.qtd_atendida
                        }
                    ]
                })
            }
            return acc;
        }, []);

        return dados;
    }

}

module.exports = Pedido;