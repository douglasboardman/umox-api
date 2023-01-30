const express = require('express');
const router = express.Router();
const { autorizarAcesso } = require('../middlewares/autorizador');
const Usuario = require('../classes/usuario');
const ResponseData = require('../classes/ResponseData');


router.get('', autorizarAcesso, async (req, res) => {
    const permissoes = req.usuario.permissoes;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    if(permissoes.gerenciar_usuarios) {
        const usuario = new Usuario;
        const result = (await usuario.listarTodos());
        const response = new ResponseData(
            dadosUsuario,
            result.dados,
            result.msg,
            !result.status
        )
        return res.status(200).send(response);
    } else {
        const response = new ResponseData()
        response.userInfo = dadosUsuario;
        response.error = true;
        response.message = 'Usuário não tem permissão para realizar esta ação.'
        return res.status(401).send(response);
    }
});

router.get('/editarUsuario/:uid', autorizarAcesso, async (req, res) => {
    const idUsuario = req.params.uid;
    const permissoes = req.usuario.permissoes;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    if(permissoes.gerenciar_usuarios) {
        const usuario = new Usuario;
        const result = (await usuario.carregarPorId(idUsuario));
        const listaPerfis = (await usuario.listarPerfis()).dados;
        const response = new ResponseData(
            dadosUsuario,
            {dadosUsuario: result.dados, perfis: listaPerfis},
            result.msg,
            !result.status
        )
        return res.status(200).send(response);
    } else {
        const response = new ResponseData()
        response.userInfo = dadosUsuario;
        response.error = true;
        response.message = 'Usuário não tem permissão para realizar esta ação.'
        return res.status(401).send(response);
    }
});


router.post('/editarUsuario', autorizarAcesso, async (req, res)=>{
    
    // coleta dados do usuário
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    const permissoes = req.usuario.permissoes;

    // coleta dados do usuario
    const { id_usuario, nome_usuario, email_usuario, perfil_usuario, acesso_permitido } = req.body;
    
    if(permissoes.gerenciar_usuarios) {
        const usuario = new Usuario;
        const result = await usuario.atualizar(id_usuario, nome_usuario, email_usuario, perfil_usuario, acesso_permitido);
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
    } else {
        const response = new ResponseData()
        response.userInfo = dadosUsuario;
        response.error = true;
        response.message = 'Usuário não tem permissão para realizar esta ação.'
        return res.status(401).send(response);
    }

});

module.exports = router