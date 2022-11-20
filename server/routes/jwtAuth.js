const router = require("express").Router();
const { password } = require("pg/lib/defaults");
const pool = require("../db");
const bcrypt = require("bcrypt");

// registering

router.post("/register", async (req,res)=>{
    try {
        // 1. destructure do Login > req.body (nome, email, senha)

        const {nome, email, senha} = req.body;

        // 2. verificar se o usuário existe (se o usuário existe, retornar erro)

        const usuario = await pool.query("SELECT * FROM usuarios WHERE email_usuario = $1", [email]);

        if(usuario.rows.length !== 0) {
            return res.status(401).send("Usuário já cadastrado!");
        }

        // 3. encriptar senha do usuário com Bcrypt

        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);

        const bcryptSenha = await bcrypt.hash(senha, salt);

        // 4. inserir novo usuário na base de dados

        const novoUsuario = await pool.query(
            "INSERT INTO usuarios (nome_usuario, email_usuario, senha_usuario) VALUES ($1, $2, $3) RETURNING *",
            [nome, email, bcryptSenha]
        );

        res.json(novoUsuario.rows[0]);

        // 5. gerar token jwt

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no Servidor");
    }
});


module.exports = router;