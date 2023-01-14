const express = require('express');
const router = express.Router();
const autorizar = require('../middlewares/autorizador');
const Item = require('../classes/item');
const { setBreadcrumbs } = require('../utils/comum');
const ResponseData = require('../classes/ResponseData');


// GET renderiza página de consulta de itens
router.get('/consultarEstoque', autorizar, async (req, res)=>{
    const permissoes = req.usuario.permissoes;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    if(permissoes.gerenciar_estoque){
        const item = new Item;
        const result = await item.listarTodos();
        const response = new ResponseData(
            dadosUsuario,
            result.dados,
            result.msg,
            !result.status
        );
        if(result.status){
            return res.status(200).send(response);
        } else {
            return res.status(500).send(response);
        }
    } else {
        const response = new ResponseData()
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não tem permissão para realizar esta ação.')
        return res.status(401).send(response);
    }
});

router.get('/cadastrarItem', autorizar, async (req, res) => {
    const permissoes = req.usuario.permissoes;
    if(permissoes.gerenciar_estoque) {
        const item = new Item;
        const listaNat = (await item.listarNaturezas()).dados;
        res.render(
            'cadastrarItem', 
            {
                usuario: req.usuario.nome, 
                tituloPagina: 'Cadastrar Item',
                breadcrumbs: setBreadcrumbs('Cadastrar Item'),
                listaNaturezas: listaNat
            }
        );
    }
});

router.post('/cadastrarItem', autorizar, async (req, res) => {
    const permissoes = req.usuario.permissoes;
    if(permissoes.gerenciar_estoque) {
        const item = new Item;
        const { descricao_item, id_natureza, marca_item, un_medida_item, estoque_item } = req.body;
        const result = await item.criarNovo(descricao_item, id_natureza, marca_item, un_medida_item, estoque_item);
        if(result.status) {
            return res.status(200).json(result);
        } else {
            console.log(result);
            return res.status(500).json(result);
        }
    } else {
        res.render('acessoNegado');
    }
});

router.get('/estoque', autorizar, async (req, res)=>{
    const permissoes = req.usuario.permissoes;
    if(permissoes.gerenciar_estoque){
        const item = new Item;
        const result = await item.listarTodos();
        if(result.status){
            return res.render(
                'itens', 
                {
                    usuario: req.usuario.nome, 
                    tituloPagina: 'Gestão de Estoque',
                    breadcrumbs: setBreadcrumbs('Estoque'), 
                    listaItens: result.dados
                }
            );
        } else {
            return res.status(500).json(result.msg);
        }
    } else {
        return res.render('acessoNegado');
    }
});

router.get('/editarItem/:id', autorizar, async (req, res)=>{
    const permissoes = req.usuario.permissoes;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    const idItem = req.params.id;
    if(permissoes.gerenciar_estoque){
        const item = new Item;
        const result = (await item.carregarPorId(idItem));
        const naturezas = (await item.listarNaturezas()).dados;
        const response = new ResponseData(
            dadosUsuario,
            {dadosItem: result.dados, listaNaturezas: naturezas},
            result.msg,
            !result.status
        )
        console.log(response);
        if(result.status) {
            return res.status(200).send(response);
        } else {
            return res.status(500).send(response);
        }
        
    } else {
        const response = new ResponseData;
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não possui permissões para realizar esta ação.')
        return res.status(401).send(response);
    }
});

router.post('/editarItem', autorizar, async (req, res)=>{
    const permissoes = req.usuario.permissoes;
    const {id, descricao, natureza, marca, unMedida, estoque} = req.body;
    if(permissoes.gerenciar_estoque){
        const item = new Item;
        const result = (await item.atualizarRegistro(id, descricao, natureza, marca, unMedida, estoque)).dados;
        if(result.status) {
            return res.status(200).json(result);
        } else {
            console.log(result);
            return res.status(500).json(result);
        }
    } else {
        return res.render('acessoNegado');
    }
});

module.exports = router