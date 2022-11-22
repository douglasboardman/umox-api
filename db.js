const Pool = require("pg").Pool;

const pool = new Pool({
    user: "pgadmin",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "umox_db"
});

module.exports = pool;