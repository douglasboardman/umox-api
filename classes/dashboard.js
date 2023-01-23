const conn = require("../dbConnPool");

class Dashboard {
    constructor(metricasStatusPedidos) {
        this.metricasStatusPedidos = metricasStatusPedidos
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
}

module.exports = Dashboard;