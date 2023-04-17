const conn = require("../dbConnPool");
const { Left } = require("../utils/comum");
require("../utils/comum").default;

class Item {
    constructor(id, descricao, idNatureza, marca, unMedida, estoque, natureza) {
        this.id = id;
        this.descricao = descricao;
        this.idNatureza = idNatureza;
        this.natureza = natureza;
        this.marca = marca;
        this.unMedida = unMedida;
        this.estoque = estoque;
    }

    async carregarPorId(id) {
        if (typeof id != 'undefined') {
            try {
                const db_result = await conn.query(
                    'SELECT * FROM view_itens WHERE id_item = $1',
                    [id]
                );
                
                if (typeof db_result.rows[0] != 'undefined') {
                    this.id = id;
                    this.descricao = db_result.rows[0].descricao_item;
                    this.idNatureza = db_result.rows[0].id_natureza;
                    this.natureza = db_result.rows[0].natureza_item;
                    this.marca = db_result.rows[0].marca_item;
                    this.unMedida = db_result.rows[0].un_medida_item;
                    this.estoque = db_result.rows[0].estoque_item;

                    return {status: true, msg: 'Item carregado com sucesso!', dados: db_result.rows[0]};
                } else {
                    return {status: false, msg: 'Item não encontrado!', dados: []};
                }

            } catch (erro) {
                console.log(erro);
                return {status: false, msg: erro, dados: []};
            }
            
        } else {
            return {status: false, msg: 'ID do item não informada', dados: []};
        }
    }

    async listarTodos() {
        try {
            const db_result = await conn.query('SELECT * FROM view_itens');
            return {status: true, msg: `A consulta retornou ${db_result.rows.length} linhas`, dados: db_result.rows}
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async listarNaturezas() {
        try {
            const db_result = await conn.query('SELECT * FROM naturezas ORDER BY naturezas ASC');
            return {status: true, msg: `A consulta retornou ${db_result.rowCount} linhas`, dados: db_result.rows}
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async listarControleRegNaturezas(){
        try {
            const db_result = await conn.query('SELECT * FROM view_controle_reg_naturezas');
            return {status: true, msg: `A consulta retornou ${db_result.rowCount} linhas`, dados: db_result.rows}
        } catch (erro) {
            console.log(erro);
            return {status: false, msg: erro, dados: []};
        }
    }

    async criarNovo(descricao, idNatureza, marca, unMedida, estoque) {
        let id = await criaIdItem(idNatureza);
        
        try {

            const db_result = await conn.query(
                'INSERT INTO itens (id_item, descricao_item, id_natureza, marca_item, un_medida_item, estoque_item) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [id, descricao, idNatureza, marca, unMedida, estoque]
            );

            if (typeof db_result != 'undefined') {
                let res = await conn.query('SELECT natureza FROM naturezas WHERE id_natureza = $1', [db_result.rows[0].id_natureza]);
                this.id = id;
                this.descricao = db_result.rows[0].descricao_item;
                this.natureza = res.rows[0].natureza;
                this.idNatureza = db_result.rows[0].id_natureza;
                this.marca = db_result.rows[0].marca_item;
                this.unMedida = db_result.rows[0].un_medida_item;
                this.estoque = db_result.rows[0].estoque_item;
            }
            return {status: true, msg: 'Item criado com sucesso!', dados: db_result.rows[0]};
        } catch (erro) {
            let msg = '';
            
            if(String(erro).search('duplicate key')){
                msg = 'Já existe um registro com descrição e marca idênticos';
            } else {
                msg = erro.detail
            }

            return {status: false, msg: msg, dados: erro};
        }
    }

    async atualizarRegistro(id, descricao, idNatureza, marca, unMedida, estoque) {
        // confere alteração da natureza
        try {
            if (Left(String(id), 4) == idNatureza) {
            
                const db_result = await conn.query(
                    'UPDATE itens SET descricao_item = $1, marca_item = $2, un_medida_item = $3, estoque_item = $4 WHERE id_item = $5 RETURNING *',
                    [descricao, marca, unMedida, estoque, id]
                );
    
                if (typeof db_result.rows[0] != 'undefined') {
                    let res = await conn.query('SELECT natureza FROM naturezas WHERE id_natureza = $1', [db_result.rows[0].id_natureza]);
                    this.id = id;
                    this.descricao = db_result.rows[0].descricao_item;
                    this.natureza = res.rows[0].natureza;
                    this.idNatureza = db_result.rows[0].id_natureza;
                    this.marca = db_result.rows[0].marca_item;
                    this.unMedida = db_result.rows[0].un_medida_item;
                    this.estoque = db_result.rows[0].estoque_item;
    
                    return {status: true, msg: 'Registro atualizado com sucesso!', dados: db_result.rows[0]};
                }
                
            } else {
                let novaId = await criaIdItem(idNatureza);

                const db_result = await conn.query(
                    'UPDATE itens SET id_item = $1, descricao_item = $2, id_natureza = $3, marca_item = $4, un_medida_item = $5, estoque_item = $6 WHERE id_item = $7 RETURNING *',
                    [novaId, descricao, idNatureza, marca, unMedida, estoque, id]
                );

                if (typeof db_result.rows[0] != 'undefined') {
                    let res = await conn.query('SELECT natureza FROM naturezas WHERE id_natureza = $1', [idNatureza]);
                    this.id = novaId;
                    this.descricao = db_result.rows[0].descricao_item;
                    this.natureza = res.rows[0].natureza;
                    this.idNatureza = db_result.rows[0].id_natureza;
                    this.marca = db_result.rows[0].marca_item;
                    this.unMedida = db_result.rows[0].un_medida_item;
                    this.estoque = db_result.rows[0].estoque_item;
                    
                    return {status: true, msg: 'Registro atualizado com sucesso!', dados: db_result.rows[0]};
                }
            }
        } catch (erro) {
            let msg = '';
            if(String(erro).search('duplicate key')){
                msg = 'Já existe um registro com descrição e marca idênticos';
            } else {
                msg = erro.detail
            }

            return {status: false, msg: msg, dados: erro};
        }

    }

    async baixaDeEstoque(id, qtd) {
        
        const db_result = await conn.query(
            'UPDATE itens SET estoque_item = (estoque_item - $1) WHERE id_item = $2 RETURNING *',
            [qtd, id]
        );

        if (typeof db_result.rows[0] != 'undefined') {
            return {status: true, msg: 'Estoque atualizado com sucesso!'};
        } else {
            return {status: false, msg: 'Erro ao atualizar o estoque.'};
        }

    }

}

async function criaIdItem(idNatureza) {
   try {
        const db_result = await conn.query(
            'SELECT ultimo_registro FROM view_composicao_estoque WHERE id_natureza = $1',
            [idNatureza]
        );
        
        if(typeof db_result.rows[0] == 'undefined') {
            return idNatureza + '00001';
        } else {
            return db_result.rows[0].ultimo_registro + 1;
        }
    } catch (erro) {
        console.log(erro);
        return 0;
    }
}

module.exports = Item;