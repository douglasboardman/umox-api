const express = require('express');
const router = express.Router();
const autorizar = require('../middlewares/autorizador');
const Usuario = require('../classes/usuario');
const { setBreadcrumbs } = require('../utils/comum');
const ResponseData = require('../classes/ResponseData');


router.get('', autorizar, async (req, res) => {
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
        const response = new ResponseData;
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não possui permissões para realizar esta ação.')
        return res.status(401).send(response);
    }
});


router.get('/editarUsuario/:uid', autorizar, async (req, res) => {
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
        const response = new ResponseData;
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não possui permissões para realizar esta ação.')
        return res.status(401).send(response);
    }
});


router.post('/editarUsuario', autorizar, async (req, res)=>{
    
    // coleta permissões do usuário
    const permissoes = req.usuario.permissoes;

    // coleta dados do usuario
    const { id, nome, email, perfil, acesso } = req.body;
    
    if(permissoes.gerenciar_usuarios) {
        const usuario = new Usuario;
        const result = await usuario.atualizar(id, nome, email, perfil, acesso);
        if(result.status) {
            return res.status(200).json(result);
        } else {
            return res.status(500).json(result);
        }
    } else {
        res.render('acessoNegado');
    }

});

module.exports = router