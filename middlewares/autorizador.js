const jwt = require("jsonwebtoken");
require("dotenv").config();

async function autorizarAcesso (req, res, next) {
    try {
        const jwtToken = req.header('x-access-token');

        if (jwtToken == '') {
            return res.status(403).json({message: "Acesso não autorizado."});
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        req.usuario = payload.usuario;

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({message: err.message});
    }
    next();
};

async function confereAccessToken (req, res, next) {
    try {
        const jwtToken = req.header('x-access-token');

        if (jwtToken) {
            const payload = jwt.verify(jwtToken, process.env.jwtSecret);
            req.usuario = payload.usuario;
        }

    } catch (err) {
        console.error(err.message);
    }
    next();
}

async function autorizarAlteracaoSenha (req, res, next) {
    try {
        let token = '';
        
        if(req.params.token) {
            token = req.params.token;
        } else {
            token = req.body.token;
        }

        const payload = jwt.verify(token, process.env.jwtSecret);
        
        req.usuario = payload.usuario;

    } catch (err) {
        console.error(err.message);
        return res.status(500).json({message: err.message});
    }
    next();
}

module.exports = { autorizarAcesso, autorizarAlteracaoSenha, confereAccessToken }