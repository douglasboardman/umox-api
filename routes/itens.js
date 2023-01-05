const express = require('express');
const router = express.Router();
const autorizar = require('../middlewares/autorizador');
const Item = require('../classes/item');
const { setBreadcrumbs } = require('../utils/comum');


// GET renderiza página de consulta de itens
router.get('/consultarEstoque', autorizar, async (req, res)=>{
    const permissoes = req.usuario.permissoes;
    if(permissoes.gerenciar_estoque){
        const item = new Item;
        const result = await item.listarTodos();
        if(result.status){
            return res.status(200).send(
                {
                    usuario: req.usuario.nome,
                    breadcrumbs: setBreadcrumbs('Consultar estoque'), 
                    listaItens: result.dados
                }
            );
        } else {
            return res.status(500).json(result.msg);
        }
    } else {
        return res.status(401).json({message: 'Acesso negado!'});
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

router.get('/editarItem', autorizar, async (req, res)=>{
    const permissoes = req.usuario.permissoes;
    const idItem = req.query['idItem'];
    if(permissoes.gerenciar_estoque){
        const item = new Item;
        const result = (await item.carregarPorId(idItem)).dados;
        const naturezas = (await item.listarNaturezas()).dados;
        return res.render(
            'editarItem',
            {
                usuario: req.usuario.nome,
                tituloPagina: 'Editar Item',
                breadcrumbs: setBreadcrumbs('Editar item'), 
                dados: result,
                listaNaturezas: naturezas
            }
        );
    } else {
        return res.render('acessoNegado');
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