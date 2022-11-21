const router = require("express").Router();
const pool = require("../db");
const authorization = require("../middleware/authorization");

router.get("/", authorization, async (req, res)=> {
    try {
        // req.usuario carrega o payload
        // res.json(req.usuario);
        const usuario = await pool.query("SELECT nome_usuario FROM usuarios WHERE id_usuario = $1", [req.usuario]);
        res.json(usuario.rows[0]);

    } catch (err) {
        console.error(err.message);
        res.status(500).json("Erro no servidor");
    }
});

module.exports = router;