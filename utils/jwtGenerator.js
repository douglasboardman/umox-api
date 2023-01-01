const jwt = require("jsonwebtoken");
require('dotenv').config();

function jwtGenerator(id_usuario, nome_usuario, permissoes) {
    const payload = {
        usuario: {
            id: id_usuario,
            nome: nome_usuario,
            permissoes: permissoes
        }
    }

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "1hr"});
}

module.exports = jwtGenerator;