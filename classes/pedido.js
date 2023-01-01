const conn = require("../dbConnPool");
const { Left, Right, dateToBD } = require("../utils/comum");
const ItemPedido = require("./item_pedido");


class Pedido {
    constructor(idPedido, idUsuario, dtPedido, dtAtendimento, finalidade, status) {
        this.idPedido = idPedido;
        this.idUsuario = idUsuario;
        this.dtPedido = dtPedido;
        this.dtAtendimento = dtAtendimento;
        this.finalidade = finalidade;
        this.status = status;
    }

    async criarNovo(idUsuario, dtPedido, finalidade) {
        try {
            const db_result = await conn.query(
                'INSERT INTO pedidos (id_usuario, data_pedido, finalidade_pedido) VALUES ($1, $2, $3) RETURNING *',
                [idUsuario, dateToBD(dtPedido), finalidade]
            );

            if (typeof db_result.rows[0] != 'undefined') {
                this.idPedido = db_result.rows[0].id_pedido;
                this.idUsuario = db_result.rows[0].id_usuario;
                this.dtPedido = db_result.rows[0].data_pedido;
                this.dtAtendimento = db_result.rows[0].data_atendimento;
                this.descricao = db_result.rows[0].finalidade_pedido;
                this.status = db_result.rows[0].status_pedido;
                return {status: true, msg: 'Pedido criado com sucesso!', dados: db_result.rows[0]};
            }
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro};
        }
    }

    async pedidosDoUsuario(idUsuario) {
        try {
            const db_result = await conn.query(
                'SELECT * FROM view_itens_pedido WHERE id_usuario = $1',
                [idUsuario]
            );

            if (typeof db_result.rows[0] != 'undefined') {
                return {status: true, msg: `A consulta retornou ${db_result.rows.length} linhas`, dados: db_result.rows};
            } else {
                return {status: false, msg: 'Erro ao realizar a consulta no Banco'};
            }
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro};
        }
    }

    async listarTodos() {
        try {
            const db_result = await conn.query(
                'SELECT * FROM view_itens_pedido'
            );
            
            return {status: true, msg: `A consulta retornou ${db_result.rows.length} linhas`, dados: db_result.rows};
            
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro};
        }
    }

    async listarNaoAtendidos() {
        try {
            const db_result = await conn.query(
                "SELECT * FROM view_itens_pedido WHERE status_pedido = 'AGUARDANDO ATENDIMENTO'"
            );

            return {status: true, msg: `A consulta retornou ${db_result.rows.length} linhas`, dados: db_result.rows};
            
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro};
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
                objItens.forEach(async i => {
                    await item.atendimentoItemPedido(i.id_item, id_pedido, i.qtd_atendida);
                });
            }
            
            return {status: true, msg: 'Pedido finalizado com sucesso!'};

        } catch(erro) {
            console.log(erro);
            return {status: false, msg: erro};
        }
    }

}

module.exports = Pedido;