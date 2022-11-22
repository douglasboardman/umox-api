const router = require("express").Router();
const conn = require("../db");

router.get("/", async (req, res)=> {
    try {
        // req.usuario carrega o payload
        // res.json(req.usuario);
        const usuario = await conn.query("SELECT nome_usuario FROM usuarios WHERE id_usuario = $1", [req.usuario.id]);
        //res.json(usuario.rows[0]);
        
        res.render('index', usuario.rows[0]);
        
    } catch (err) {
        res.render('login');
    }
});

module.exports = router;