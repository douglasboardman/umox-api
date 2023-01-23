const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const validaInfo = require("../middlewares/validaInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const autorizar = require('../middlewares/autorizador');
const Usuario = require('../classes/usuario');
const ResponseData = require('../classes/ResponseData');
const Dashboard = require('../classes/dashboard');

// router de login

router.post('/login', validaInfo, async (req, res)=>{
    try{
        // 1. destructure das informações do formulário de login > req.body (email, senha)
        const {email, senha} = req.body;
        // 2. confere se o usuário existe (se não existe dispara um erro)
        const usuario = new Usuario;
        const result = await usuario.carregarPorEmail(email);
        
        if(!result.status) {
            return res.status(401).json({message: "Usuário ou senha incorretos"});
        }
        // 3. checa se a senha informada é a mesma registrada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if(!senhaValida){
            return res.status(401).json({message: "Usuário ou senha incorretos"});
        }
        // 4. consulta autorização de acesso e permissões do usuario
        const acessoPermitido = usuario.acesso;

        if (!acessoPermitido){
            return res.status(403).json({message: 'Usuário não possui permissão para acessar o sistema'});
        }

        // carrega payload
        const permissoes = (await usuario.listarPermissoes()).dados;
        const payload = {id: usuario.id, nome: usuario.nome, permissoes: usuario.permissoes};

        // 5. atribui token jwt
        const token = jwtGenerator(usuario.id, usuario.nome, permissoes);
        
        //res.cookie('jwtToken', token, { maxAge: 1 * 60 * 60 * 1000, httpOnly: true });
        res.header('x-access-token', token);
        res.status(200).send(payload);
    } catch (err) {
        console.log(err);
        return res.sendStatus(500);
    }

});


router.post('/register', validaInfo, async (req, res)=>{
    try{
        // 1. destructure das informações do formulário de login > req.body (email, senha)
        const {nome, email, senha} = req.body;

        // 2. confere se o usuário não existe (se existe dispara um erro)
        const usuario = new Usuario;

        if(! (await usuario.carregarPorEmail(email)).status){
    
            // 3. encripta a senha informada para registro no banco
            const saltRound = 10;
            const salt = await bcrypt.genSalt(saltRound);
            const bcryptSenha = await bcrypt.hash(senha, salt);
    
            // 4. cadastra novo usuario
            const result = await usuario.cadastrar(nome, email, bcryptSenha);
            if(result.status) {
                return res.status(200).json({message: result.msg});
            } else {
                return res.status(400).json({message: result.msg});
            }
        } else {
            return res.status(401).json({message: "Email já cadastrado"});
        }

    } catch (erro) {
        console.log(erro);
        return res.status(500).json({message: erro});
    }

});

router.get('/permissoesUsuario', autorizar, async (req, res) => {
    const permissoes = req.usuario.permissoes;
    return res.status(200).send(permissoes);
});

// router para o dashboard
router.get('/dashboard', autorizar, async (req, res)=>{
    if(req.usuario){
        const dashboard = new Dashboard;
        await dashboard.carregaMetricasStatusPedidos();
        return res.status(200).send(dashboard.metricasStatusPedidos);
    } else {
        return res.status(403).send({message: 'Acesso não permitido'});
    }
});

// router de logout

router.get('/logout', (req, res)=>{
    try {
        res.header('x-access-token', '');
        req.usuario = {};
        res.json({message: 'Logout realizado com sucesso!'});
    } catch (erro) {
        res.status(500).json({message: erro});
    }
});

module.exports = router