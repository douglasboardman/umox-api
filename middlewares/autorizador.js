const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = async (req, res, next) => {
    try {
        const jwtToken = req.cookies['jwtToken'];

        if (jwtToken == '') {
            return res.status(403).json("Acesso não autorizado.");
        }

        const payload = jwt.verify(jwtToken, process.env.jwtSecret);

        req.usuario = payload.usuario;

    } catch (err) {
        console.error(err.message);
        return res.render('acessoNegado');
    }
    next();
};