const conn = require("../dbConnPool");

class Dashboard {
    constructor(metricasStatusPedidos, pedidosUlt12Meses, incidNaturezasPedidos, composicaoEstoque, itensMaisSolicitados, solicitantesMaisAtivos) {
        this.metricasStatusPedidos = metricasStatusPedidos;
        this.pedidosUlt12Meses = pedidosUlt12Meses;
        this.composicaoPedidos = incidNaturezasPedidos;
        this.composicaoEstoque = composicaoEstoque;
        this.itensMaisSolicitados = itensMaisSolicitados;
        this.solicitantesMaisAtivos = solicitantesMaisAtivos;
    }

    async carregaMetricasStatusPedidos() {
        try {
            const db_result = await conn.query('SELECT * FROM view_metricas_status_pedidos;');
            if(typeof db_result.rows[0] != 'undefined') {
                this.metricasStatusPedidos = db_result.rows;
                return {status: true, msg: `A consulta retornou ${this.metricasStatusPedidos.length} linhas`, dados: this.metricasStatusPedidos};
            } else {
                return {status: false, msg: `Erro ao realizar a consulta`, dados: []};
            }
        } catch (error) {
            return {status: false, msg: error, dados: []};
        }
    }

    async carregaPedidosUlt12Meses() {
        try {
            const db_result = await conn.query('SELECT * FROM view_pedidos_ult12meses;');
            if(typeof db_result.rows[0] != 'undefined') {
                this.pedidosUlt12Meses = db_result.rows;
                return {status: true, msg: `A consulta retornou ${this.pedidosUlt12Meses.length} linhas`, dados: this.pedidosUlt12Meses};
            } else {
                return {status: false, msg: `Erro ao realizar a consulta`, dados: []};
            }
        } catch (error) {
            return {status: false, msg: error, dados: []};
        }
    }

    async carregaComposicaoPedidos() {
        try {
            const db_result = await conn.query('SELECT * FROM view_composicao_pedidos;');
            if(typeof db_result.rows[0] != 'undefined') {
                this.composicaoPedidos = db_result.rows;
                return {status: true, msg: `A consulta retornou ${this.composicaoPedidos.length} linhas`, dados: this.composicaoPedidos};
            } else {
                return {status: false, msg: `Erro ao realizar a consulta`, dados: []};
            }
        } catch (error) {
            return {status: false, msg: error, dados: []};
        }
    }

    async carregaComposicaoEstoque() {
        try {
            const db_result = await conn.query('SELECT * FROM view_composicao_estoque;');
            if(typeof db_result.rows[0] != 'undefined') {
                this.composicaoEstoque = db_result.rows;
                return {status: true, msg: `A consulta retornou ${this.composicaoEstoque.length} linhas`, dados: this.composicaoEstoque};
            } else {
                return {status: false, msg: `Erro ao realizar a consulta`, dados: []};
            }
        } catch (error) {
            return {status: false, msg: error, dados: []};
        }
    }

    async carregaItensMaisSolicitados() {
        try {
            const db_result = await conn.query('SELECT * FROM view_itens_mais_solicitados;');
            if(typeof db_result.rows[0] != 'undefined') {
                this.itensMaisSolicitados = db_result.rows;
                return {status: true, msg: `A consulta retornou ${this.itensMaisSolicitados.length} linhas`, dados: this.itensMaisSolicitados};
            } else {
                return {status: false, msg: `Erro ao realizar a consulta`, dados: []};
            }
        } catch (error) {
            return {status: false, msg: error, dados: []};
        }
    }

    async carregaSolicitantesMaisAtivos() {
        try {
            const db_result = await conn.query('SELECT * FROM view_solicitantes_mais_ativos;');
            if(typeof db_result.rows[0] != 'undefined') {
                this.solicitantesMaisAtivos = db_result.rows;
                return {status: true, msg: `A consulta retornou ${this.solicitantesMaisAtivos.length} linhas`, dados: this.solicitantesMaisAtivos};
            } else {
                return {status: false, msg: `Erro ao realizar a consulta`, dados: []};
            }
        } catch (error) {
            return {status: false, msg: error, dados: []};
        }
    }

    async listarDadosDashboard() {
        await this.carregaMetricasStatusPedidos();
        await this.carregaPedidosUlt12Meses();
        await this.carregaComposicaoPedidos();
        await this.carregaComposicaoEstoque();
        await this.carregaItensMaisSolicitados();
        await this.carregaSolicitantesMaisAtivos();

        const dados = {
            metricasStatusPedidos: this.metricasStatusPedidos,
            pedidosUlt12Meses: this.pedidosUlt12Meses,
            composicaoPedidos: this.composicaoPedidos,
            composicaoEstoque: this.composicaoEstoque,
            itensMaisSolicitados: this.itensMaisSolicitados,
            solicitantesMaisAtivos: this.solicitantesMaisAtivos
        }
        return {status: true, msg: 'Dados listados com sucesso!', dados: dados};
    }

}

module.exports = Dashboard;