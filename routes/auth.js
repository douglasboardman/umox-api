const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const validaInfo = require("../middlewares/validaInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const autorizar = require('../middlewares/autorizador');
const Usuario = require('../classes/usuario');
const ClasseItem = require('../classes/item');
const Item = new ClasseItem;

// router de login

router.get('', (req, res)=>{
    return res.render('login', {title: "Umox | Login"});
});

router.post('/login', validaInfo, async (req, res)=>{
    try{
        // 1. destructure das informações do formulário de login > req.body (email, senha)
        const {email, senha} = req.body;
        // 2. confere se o usuário existe (se não existe dispara um erro)
        const usuario = new Usuario;
        const result = await usuario.carregarPorEmail(email);
        
        if(!result.status) {
            return res.send({message: "Usuário ou senha incorretos"});
        }
        // 3. checa se a senha informada é a mesma registrada no banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if(!senhaValida){
            return res.send({message: "Usuário ou senha incorretos"});
        }
        // 4. consulta autorização de acesso e permissões do usuario
        const acessoPermitido = usuario.acesso;

        if (!acessoPermitido){
            return res.render('acessoNegado');
        }

        const permissoes = (await usuario.listarPermissoes()).dados;
        // 5. atribui token jwt
        const token = jwtGenerator(usuario.id, usuario.nome, permissoes);
        
        res.cookie('jwtToken', token, { maxAge: 1 * 60 * 60 * 1000, httpOnly: true });
        res.redirect('/home');
    } catch (err) {
        console.log(err);
        return res.render('acessoNegado');
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
            
            return res.status(200).json(result);
        } else {
            return res.status(500).json({status: false, msg: "Email já cadastrado"});
        }

    } catch (erro) {
        console.log(erro);
        return res.status(500).json({status: false, msg: erro});
    }

});


// router para o dashboard
router.get('/home', autorizar, async (req, res)=>{
    if(req.usuario){
        return res.render(
            'home', 
            {
                usuario: req.usuario.nome, 
                tituloPagina: 'Home'
            }
        );
    } else {
        return res.render('acessoNegado');
    }
});

// router de logout

router.get('/logout', (req, res)=>{
    try {
        res.clearCookie('jwtToken');
        req.usuario = {};
        res.render('login', {title: 'Umox', logout: 'Logout realizado com sucesso!'});
    } catch (erro) {
        res.status(500).json(erro);
    }
});

module.exports = router