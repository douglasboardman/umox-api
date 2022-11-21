const router = require("express").Router();
const conn = require("../db");
const autorizar = require("../middleware/authorization");

router.get("/", autorizar, async (req, res)=> {
    try {
        // req.usuario carrega o payload
        // res.json(req.usuario);
        const usuario = await conn.query("SELECT nome_usuario FROM usuarios WHERE id_usuario = $1", [req.usuario.id]);
        res.json(usuario.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Erro no servidor");
    }
});

module.exports = router;