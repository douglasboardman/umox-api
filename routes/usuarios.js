const express = require('express');
const router = express.Router();
const autorizar = require('../middlewares/autorizador');
const Usuario = require('../classes/usuario');
const { setBreadcrumbs } = require('../utils/comum');


router.get('', autorizar, async (req, res) => {
    const permissoes = req.usuario.permissoes;
    if(permissoes.gerenciar_usuarios) {
        const usuario = new Usuario;
        const listaUsuarios = (await usuario.listarTodos()).dados;
        res.render(
            'usuarios', 
            {
                usuario: req.usuario.nome, 
                tituloPagina: 'Gerenciar Usuários',
                breadcrumbs: setBreadcrumbs('Usuários'),
                dados: listaUsuarios
            }
        );
    }
});


router.get('/editarUsuario', autorizar, async (req, res) => {
    const permissoes = req.usuario.permissoes;
    const idUsuario = req.query['uid'];
    if(permissoes.gerenciar_usuarios) {
        const usuario = new Usuario;
        const dadosUsuario = (await usuario.carregarPorId(idUsuario)).dados;
        const listaPerfis = (await usuario.listarPerfis()).dados;
        res.render(
            'editarUsuario', 
            {
                usuario: req.usuario.nome, 
                tituloPagina: 'Editar Usuário',
                breadcrumbs: setBreadcrumbs('Editar usuário'),
                dados: dadosUsuario,
                listaPerfis: listaPerfis
            }
        );
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