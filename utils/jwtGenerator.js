const jwt = require("jsonwebtoken");
require('dotenv').config();

function gerarTokenSessao(id_usuario, nome_usuario, permissoes) {
    const payload = {
        usuario: {
            id: id_usuario,
            nome: nome_usuario,
            permissoes: permissoes
        }
    }

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "1hr"});
}

function gerarTokenRecuperacaoSenha(idUsuario) {
    const payload = {
        usuario: {
            id: idUsuario
        }
    }

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "24hr"});
}

module.exports = { gerarTokenSessao, gerarTokenRecuperacaoSenha };