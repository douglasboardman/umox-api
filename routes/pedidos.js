const express = require('express');
const router = express.Router();
const autorizar = require('../middlewares/autorizador');
const Item = require('../classes/item');
const Pedido = require('../classes/pedido');
const { dateToView, setBreadcrumbs } = require('../utils/comum');
const ItemPedido = require('../classes/item_pedido');
const ResponseData = require('../classes/ResponseData');

// router de novo pedido

router.post('/novoPedido', autorizar, async (req, res)=> {
    
    // cria data de lançamento
    const dataPedido = new Date();

    // coleta finalidade do pedido
    const finalidade = req.body.finalidade;

    // coleta dados do usuario
    const idUsuario = req.usuario.id;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};

    // cria instância da classe Pedidos
    const pedido = new Pedido;

    try {
        // lança pedido no banco
        const result = await pedido.criarNovo(idUsuario, dataPedido, finalidade);
        if(result.status) {
            // coleta id do pedido
            let idPedido = result.dados.id_pedido;
        
            // coleta itens do pedido
            const itens = req.body.itens;
        
            // cria instância da classe Item Pedido
            const itemPedido = new ItemPedido;
        
            // lança itens do pedido no banco
            itens.forEach(async item => {
                await itemPedido.criarNovo(item.idItem, idPedido, item.qtdItem);
            });
            const response = new ResponseData(dadosUsuario, [], 'Pedido criado com sucesso!', false);
            
            return res.status(200).json(response);
        }

    } catch (erro) {
        const response = new ResponseData();
        response.error(true);
        response.userInfo(dadosUsuario);
        response.message('Erro ao criar novo pedido');
        return res.status(500).send(response);
    }

});

router.get('/meusPedidos', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;                                                   
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};

    if (permissoes.fazer_pedidos) {
        const pedido = new Pedido;                                                              
        const result = await pedido.pedidosDoUsuario(req.usuario.id);
        const response = new ResponseData(
            dadosUsuario,
            result.dados,
            result.msg,
            !result.status
        )
        if(result.status) {
            res.status(200).send(response);
        } else {
            res.status(500).send(response);
        }
    } else {
        const response = new ResponseData;
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não possui permissões para realizar esta ação.')
        return res.status(401).send(response);
    }
});

router.get('/consultarPedidos', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    if (permissoes.fazer_pedidos) {
        const pedido = new Pedido;
        const result = await pedido.listarTodos();
        const response = new ResponseData(
            dadosUsuario,
            result.dados,
            result.msg,
            !result.status
        )
        if(result.status) {
            res.status(200).send(response);
        } else {
            res.status(500).send(response);
        }
    } else {
        const response = new ResponseData;
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não possui permissões para realizar esta ação.')
        return res.status(401).send(response);
    }
});

router.get('/atendimento', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    if (permissoes.atender_pedidos) {
        const pedido = new Pedido;
        const result = await pedido.listarNaoAtendidos();
        const response = new ResponseData(
            dadosUsuario,
            result.dados,
            result.msg,
            !result.status
        )
        if(result.status){
            res.status(200).send(response);
        } else {
            res.status(500).send(response);
        }
    } else {
        const response = new ResponseData;
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não possui permissões para realizar esta ação.')
        return res.status(401).send(response);
    }
});

router.get('/atenderPedido/:pid', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;
    const dadosUsuario = {nome: req.usuario.nome, id: req.usuario.id};
    let idPedido = req.params.pid;
    if (permissoes.atender_pedidos && idPedido) {
        const itemPedido = new ItemPedido;
        const result = await itemPedido.listarPorPedido(idPedido);
        const response = new ResponseData(
            dadosUsuario,
            result.dados,
            result.msg,
            !result.status
        )
        if(result.status){
            res.status(200).send(response);
        } else {
            res.status(500).send(response);
        }
    } else {
        const response = new ResponseData;
        response.userInfo(dadosUsuario);
        response.error(true);
        response.message('Usuário não possui permissões para realizar esta ação.')
        return res.status(401).send(response);
    }
});

router.post('/atenderPedido', autorizar, async (req, res)=>{
    
    // coleta permissões do usuário
    const permissoes = req.usuario.permissoes;

    // cria data atendimento
    const dataAtendimento = new Date();

    // coleta dados do atendimento
    const idPedido = req.body.id_pedido;
    const observacao = req.body.observacao_atendimento;
    const statusPedido = req.body.status_pedido;
    const objItens = req.body.objItens;

    // finaliza atendimento do pedido
    const pedido = new Pedido;
    
    if(permissoes.atender_pedidos) {
        let result = await pedido.finalizarPedido(idPedido, observacao, statusPedido, dataAtendimento, objItens);
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

module.exports = router