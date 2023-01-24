const conn = require("../dbConnPool");

class Dashboard {
    constructor(metricasStatusPedidos, pedidosUlt12Meses, incidNaturezasPedidos, composicaoEstoque) {
        this.metricasStatusPedidos = metricasStatusPedidos;
        this.pedidosUlt12Meses = pedidosUlt12Meses;
        this.incidNaturezasPedidos = incidNaturezasPedidos;
        this.composicaoEstoque = composicaoEstoque;
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

    async carregaIncidNaturezasPedidos() {
        try {
            const db_result = await conn.query('SELECT * FROM view_incidencia_naturezas_pedidos;');
            if(typeof db_result.rows[0] != 'undefined') {
                this.incidNaturezasPedidos = db_result.rows;
                return {status: true, msg: `A consulta retornou ${this.incidNaturezasPedidos.length} linhas`, dados: this.incidNaturezasPedidos};
            } else {
                return {status: false, msg: `Erro ao realizar a consulta`, dados: []};
            }
        } catch (error) {
            return {status: false, msg: error, dados: []};
        }
    }

    async carregaComposicaoEstoque() {
        try {
            const db_result = await conn.query('SELECT * FROM view_naturezas_itens;');
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

    async listarDadosDashboard() {
        await this.carregaMetricasStatusPedidos();
        await this.carregaPedidosUlt12Meses();
        await this.carregaIncidNaturezasPedidos();
        await this.carregaComposicaoEstoque();

        const dados = {
            metricasStatusPedidos: this.metricasStatusPedidos,
            pedidosUlt12Meses: this.pedidosUlt12Meses,
            incidNaturezasPedidos: this.incidNaturezasPedidos,
            composicaoEstoque: this.composicaoEstoque
        }
        return {status: true, msg: 'Dados listados com sucesso!', dados: dados};
    }

}

module.exports = Dashboard;