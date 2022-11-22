const jwt = require("jsonwebtoken");
require('dotenv').config();

function jwtGenerator(id_usuario, permissoes) {
    const payload = {
        usuario: {
            id: id_usuario,
            permissoes: permissoes
        }
    }

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "1hr"})
}

module.exports = jwtGenerator;