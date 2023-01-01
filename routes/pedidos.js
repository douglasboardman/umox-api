const express = require('express');
const router = express.Router();
const autorizar = require('../middlewares/autorizador');
const Item = require('../classes/item');
const Pedido = require('../classes/pedido');
const { dateToView, setBreadcrumbs } = require('../utils/comum');
const ItemPedido = require('../classes/item_pedido');

// router de novo pedido

router.get('/novoPedido', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;                                                  
    if (permissoes.fazer_pedidos) {                                                           
        const item = new Item;                                                            
        const result = await item.listarTodos();
        if(result.status){
            res.render(                                                                           
                'cadastrarPedido',                                                                    
                {
                    usuario: req.usuario.nome, 
                    tituloPagina: 'Novo Pedido',
                    breadcrumbs: setBreadcrumbs('Cadastrar Pedido'),
                    listaItens: result.dados
                }  
            );
        } else {
            res.status(500).json(result.msg);
        }                                                                                
    } else {
        res.render('acessoNegado');
    }
});

router.post('/novoPedido', autorizar, async (req, res)=> {
    
    // cria data de lançamento
    const dataPedido = new Date();

    // coleta finalidade do pedido
    const finalidade = req.body.finalidade;

    // coleta id do usuario
    const idUsuario = req.usuario.id;

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
                await itemPedido.criarNovo(item.id, idPedido, item.qtd);
            });
            
            return res.status(200).json({status: true, msg: "Pedido criado com sucesso!"});
        }

    } catch (erro) {
        console.log(erro);
        return res.status(500).json({status: false, msg: "Erro ao criar novo pedido"});
    }

});

router.get('/meusPedidos', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;                                                   
    if (permissoes.fazer_pedidos) {                                                            
        const pedido = new Pedido;                                                              
        const result = await pedido.pedidosDoUsuario(req.usuario.id);                            
        if(result.status) {
            res.render(
                'meusPedidos', 
                {
                    usuario: req.usuario.nome, 
                    tituloPagina: 'Meus Pedidos',
                    breadcrumbs: setBreadcrumbs('Meus Pedidos'), 
                    listaItensPedido: result.dados, 
                    dateToView: dateToView
                }
            );
        } else {
            res.status(500).json(result.msg);
        }
    } else {
        res.render('acessoNegado');
    }
});

router.get('/consultarPedidos', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;
    if (permissoes.fazer_pedidos) {
        const pedido = new Pedido;
        const result = await pedido.listarTodos();
        if(result.status) {
            res.render(
                'consultarPedidos', 
                {
                    usuario: req.usuario.nome, 
                    tituloPagina: 'Consultar Pedidos', 
                    breadcrumbs: setBreadcrumbs('Consultar Pedidos'),
                    listaItensPedido: result.dados, 
                    dateToView: dateToView
                }
            );
        } else {
            res.status(500).json(result.msg);
        }
    } else {
        res.render('acessoNegado');
    }
});

router.get('/atendimento', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;
    if (permissoes.atender_pedidos) {
        const pedido = new Pedido;
        const result = await pedido.listarNaoAtendidos();
        if(result.status){
            res.render(
                'atendimento', 
                {
                    usuario: req.usuario.nome, 
                    tituloPagina: 'Atender Pedidos',
                    breadcrumbs: setBreadcrumbs('Atendimento'),
                    listaItensPedido: result.dados, 
                    dateToView: dateToView
                }
            );
        } else {
            res.status(500).json(result.msg);
        }
    } else {
        res.render('acessoNegado');
    }
});

router.get('/atenderPedido', autorizar, async (req, res)=>{
    let permissoes = req.usuario.permissoes;
    let idPedido = req.query['pid'];
    if (permissoes.atender_pedidos && idPedido) {
        const itemPedido = new ItemPedido;
        const result = await itemPedido.listarPorPedido(idPedido);
        if(result.status) {
            res.render(
                'atenderPedido', 
                {
                    usuario: req.usuario.nome, 
                    tituloPagina: 'Atender Pedido',
                    breadcrumbs: setBreadcrumbs('Atender Pedido'),
                    dados: result.dados, 
                    dateToView: dateToView
                }
            );
        } else {
            res.status(500).json(result.msg);
        }
    } else {
        res.render('acessoNegado');
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