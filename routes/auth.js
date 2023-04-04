const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const validaInfo = require("../middlewares/validaInfo");
const { gerarTokenSessao, gerarTokenRecuperacaoSenha } = require("../utils/jwtGenerator");
const { autorizarAcesso, autorizarAlteracaoSenha, confereAccessToken } = require('../middlewares/autorizador');
const { MensagemRecuperacaoSenha } = require("../classes/mailer");
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
            return res.status(401).send({message: "Usuário ou senha incorretos"});
        }
        // 3. checa se a senha informada é a mesma registrada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if(!senhaValida){
            return res.status(401).send({message: "Usuário ou senha incorretos"});
        }
        // 4. consulta autorização de acesso e permissões do usuario
        const acessoPermitido = usuario.acesso;

        if (!acessoPermitido){
            return res.status(403).send({message: 'Usuário não possui permissão para acessar o sistema'});
        }

        // carrega payload
        const permissoes = (await usuario.listarPermissoes()).dados;
        const payload = {id: usuario.id, nome: usuario.nome, permissoes: usuario.permissoes};

        // 5. atribui token jwt
        const token = gerarTokenSessao(usuario.id, usuario.nome, permissoes);
        
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
    
            // 4. cadastra novo usuario
            const result = await usuario.cadastrar(nome, email, senha);
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

router.get('/permissoesUsuario', autorizarAcesso, async (req, res) => {
    const permissoes = req.usuario.permissoes;
    return res.status(200).send(permissoes);
});

router.get('/confereSessao', confereAccessToken, async (req, res) => {
    if(typeof req.usuario != 'undefined') {
        res.status(200).send({sessaoAtiva: true});
    } else {
        res.status(200).send({sessaoAtiva: false});
    }
})

router.get('/dadosUsuario', autorizarAcesso, async (req, res) => {
    const usuario = new Usuario;
    await usuario.carregarPorId(req.usuario.id);
    const dadosUsuario = {id: req.usuario.id, nome: usuario.nome, email: usuario.email};
    return res.status(200).send(dadosUsuario);
});

router.post('/alteraDadosUsuario', autorizarAcesso, async (req, res) => {
    // compila dados do usuário
    const id = req.usuario.id;
    const nome = req.body.nome_usuario;
    const email = req.body.email_usuario;
    const dadosUsuario = {id: id, nome: nome, email: email};
    const usuario = new Usuario;
    await usuario.carregarPorId(id);
    const result = await usuario.atualizar(id, nome, email, usuario.perfil, usuario.acesso);
    const response = new ResponseData(
        dadosUsuario,
        result.dados,
        result.msg,
        !result.status
    )

    if(result.status) {
        return res.status(200).send(response);
    } else {
        return res.status(500).send(response);
    }
    
});

router.patch('/alteraSenhaUsuario', autorizarAlteracaoSenha, async (req, res) => {
    const usuario = new Usuario;
    const id = req.usuario.id;
    await usuario.carregarPorId(id);
    console.log(usuario);
    const result = await usuario.atualizarSenha(req.body.senha_usuario);
    console.log(result);
    const response = new ResponseData(
        req.usuario,
        result.dados,
        result.msg,
        !result.status
    )

    if(result.status) {
        return res.status(200).send(response);
    } else {
        return res.status(500).send(response);
    }
});

router.get('/alterarSenha/:token', autorizarAlteracaoSenha, async (req, res) => {
    const response = new ResponseData(req.usuario, [], '', false);
    if(typeof req.usuario != 'undefined') {
        response.setMessage('Token de alteração de senha válido!');
        //console.log(response);
        res.status(200).send(response);
    } else {
        response.setMessage('Token de alteração de senha inválido!');
        response.setError(true);
        res.status(401).send(response);
    }
});

router.get('/gerarTokenAltSenha/:email', async (req, res) => {
    const email = req.params.email;
    const usuario = new Usuario;
    await usuario.carregarPorEmail(email);
    const token = gerarTokenRecuperacaoSenha(usuario.id);
    return res.status(200).send({token: token});
});

router.get('/recuperarSenha/:email', async (req,res) => {
    const email = req.params.email;
    const usuario = new Usuario;
    await usuario.carregarPorEmail(email);
    const token = gerarTokenRecuperacaoSenha(usuario.id);
    try {
        let msg = new MensagemRecuperacaoSenha(usuario, token);
        await msg.enviar();
        const response = new ResponseData([], [], 'Email enviado com sucesso!', false);
        res.status(200).send(response);
    } catch (error) {
        const response = new ResponseData([], [], error, true);
        res.status(500).send(response);
    }
});

// router para o dashboard
router.get('/dashboard', autorizarAcesso, async (req, res)=>{
    if(req.usuario){
        const dashboard = new Dashboard;
        const dadosDashboard = (await dashboard.listarDadosDashboard()).dados;
        return res.status(200).send(dadosDashboard);
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