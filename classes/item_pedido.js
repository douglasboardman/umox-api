const conn = require("../dbConnPool");
const Item = require("./item");

class ItemPedido {
    constructor(id_item, id_pedido, qtd_solicitada, qtd_atendida) {
        this.idItem = id_item;
        this.idPedido = id_pedido;
        this.qtdSolicitada = qtd_solicitada;
        this.qtdAtendida = qtd_atendida;
    }

    async criarNovo (id_item, id_pedido, qtd_solicitada) {
        
        try {
                const db_result = await conn.query(
                    'INSERT INTO itens_pedido (id_item, id_pedido, qtd_solicitada) VALUES ($1, $2, $3) RETURNING *',
                    [id_item, id_pedido, qtd_solicitada]
                );

                if (typeof db_result.rows[0] != 'undefined') {
                    this.idItem = id_item;
                    this.idPedido = id_pedido;
                    this.qtdSolicitada = qtd_solicitada;
                    this.qtdAtendida = 0;
                    return db_result.rows[0];
                } else {
                    return {};
                }
        } catch (erro) {
            console.log(erro);
            return {};
        }
    }

    async atendimentoItemPedido(id_item, id_pedido, qtd_atendida) {
        try {
            await conn.query(
                "UPDATE itens_pedido SET qtd_atendida = $1 WHERE id_item = $2 AND id_pedido = $3 RETURNING *",
                [qtd_atendida, id_item, id_pedido]
            );

            const item = new Item;
            const result = await item.baixaDeEstoque(id_item, qtd_atendida);

            if(result.status){
                return {status: true, msg: 'Item atendido com sucesso!'};
            } else {
                return {status: false, msg: result.msg};
            }
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro};
        }
    }

    async listarPorPedido(id_pedido) {
        try {
            const db_result = await conn.query(
                'SELECT * FROM view_itens_pedido WHERE id_pedido = $1',
                [id_pedido]
            );
            
            if (typeof db_result.rows[0] != 'undefined') {
                return {status: true, msg: `A consulta retornou ${db_result.rows.length} linhas`, dados: db_result.rows};
            } else {
                return {status: false, msg: 'Erro ao buscar dados no banco'};
            }

        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro};
        }
    }

}

module.exports = ItemPedido;