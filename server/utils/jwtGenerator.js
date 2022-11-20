const jwt = require("jsonwebtoken");
require('dotenv').config();

function jwtGenerator() {
    const payload = {
        usuario: id_usuario
    }

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "1hr"})
}

module.exports = jwtGenerator;