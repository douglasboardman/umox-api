const nodemailer = require('nodemailer');
var inLineCss = require('nodemailer-juice');
const {google} = require('googleapis');
const ItemPedido = require('./item_pedido');
const { dateToView } = require('../utils/comum');
const Usuario = require('./usuario');
const clientId = process.env.oauth_client_id;
const clientSecret = process.env.oauth_client_secret;
const refreshToken = process.env.oauth_refresh_token;
const redirectUri = process.env.oauth_redirect_uri;
const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

oAuth2Client.setCredentials({refresh_token: refreshToken});
const accessToken = async () => {
    return await oAuth2Client.getAccessToken();
}

class Mailer {
    constructor(subject, toEmail, html) {
        this.subject = subject;
        this.toEmail = toEmail;
        this.html = html;
        
        this.mailOptions = {
            from: `UMOX - Gestão de Almoxarifado <${process.env.mailer_sender}>`,
            to: toEmail,
            subject: subject,
            html: html
        }

        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                clientId,
                clientSecret,
                refreshToken,
                accessToken,
                user: process.env.mailer_sender
            }
        });

        this.transporter.use('compile', inLineCss());
    }

    sendEmail() {
        this.transporter.sendMail(this.mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email enviado: ' + info.response);
            }
        });
    }
}

class MensagemPedidoFinalizado {
    
    pedido;
    idPedido = '';
    nomeUsuario = '';
    emailUsuario = '';
    statusAtendimento = '';
    obsAtendimento = '';
    dataPedido = '';
    dataAtendimento = '';
    objItensPedido = [];

    constructor(pedido) {
        this.pedido = pedido;
    }

    async enviar() {
        await this.carregaDadosMensagem();
        const html = this.gerarHtml();
        const subject = `Pedido de Material nº ${this.idPedido}`;
        const toEmail = this.emailUsuario;
        const mailer = new Mailer(subject, toEmail, html);
        try {
            mailer.sendEmail();
        } catch (error) {
            console.log(error);
        }
    }

    async carregaDadosMensagem() {
        this.idPedido = this.pedido.idPedido;
        this.statusAtendimento = this.pedido.status;
        this.obsAtendimento = this.pedido.observacaoAtendimento;
        this.dataPedido = dateToView(this.pedido.dtPedido);
        this.dataAtendimento = dateToView(this.pedido.dtAtendimento);
        
        const itemPedido = new ItemPedido;
        this.objItensPedido = (await itemPedido.listarPorPedido(this.idPedido)).dados;
        console.log(this.objItensPedido);

        const usuario = new Usuario;
        await usuario.carregarPorId(this.pedido.idUsuario);
        this.nomeUsuario = usuario.nome;
        this.emailUsuario = usuario.email;
    }

    gerarHtml() {
        const tabelaItens = this.geraTabelaItens();
        const html = `
        <style>
            ${this.style()}
        </style>
        <div id="email-container">
        <h1>UMOX - Gestão de Almoxarifado</h1>
        <div id="div-corpo-email">
        <p>Prezado(a) servidor(a)</p>
        <p>Seu pedido de material nº ${this.idPedido} foi finalizado pelo atendente com o status: <b>${this.statusAtendimento}</b></p>
        <h2>Detalhes do pedido</h2>
        <table id="tabela-detalhes-pedido">
            <tbody>
                <tr id="tr-label-detalhe-pedido">
                    <td>Nº Pedido:</td>
                    <td>Data do pedido:</td>
                    <td>Data do atendimento:</td>
                    <td>Status do atendimento:</td>
                </tr>
                <tr id="tr-info-detalhe-pedido">
                    <td>${this.idPedido}</td>
                    <td>${this.dataPedido}</td>
                    <td>${this.dataAtendimento}</td>
                    <td>${this.statusAtendimento}</td>
                </tr>
                <tr id="tr-label-detalhe-pedido">
                    <td colspan="4">Despacho do atendimento:</td>
                </tr>
                <tr id="tr-info-detalhe-pedido">
                    <td colspan="4">${this.obsAtendimento}</td>
                </tr>
            </tbody>
        </table>
        <h2>Itens do pedido:</h2>
        ${tabelaItens}
        </div>
        </div>
        `
        return html;
    }

    geraListaItens() {
        let listaItens = '';
        this.objItensPedido.forEach(item => {
            let str = 
                `<tr>
                    <td style="text-align:center;">${item.id_item}</td>
                    <td>${item.descricao_item}</td>
                    <td>${item.marca_item}</td>
                    <td style="text-align:center;">${item.qtd_solicitada}</td>
                    <td style="text-align:center;">${item.qtd_atendida}</td>
                </tr>
                `
            listaItens += str; 
        });

        return listaItens;
    }

    geraTabelaItens() {
        const listaItens = this.geraListaItens();
        let html = 
        `<table id="tabela-itens-pedido">
            <thead>
                <tr>
                    <th style="text-align: center; width: 10%">ID ITEM</th>
                    <th style="text-align: left; width: 50%">DESCRIÇÃO</th>
                    <th style="text-align: left; width: 20%">MARCA</th>
                    <th style="text-align: center; width: 10%">QTD. SOLIC.</th>
                    <th style="text-align: center; width: 10%">QTD. ATEND.</th>
                </tr>
            </thead>
            <tbody>
                ${listaItens}
            </tbody>
        </table>`;
        
        return html;
    }

    style = () => {
        return `
            * {
                font-family: tahoma;
            }

            h1 {
                color: #1e65ae;
            }

            h2 {
                margin-bottom: 10px;
                margin-top: 20px;
            }

            #div-corpo-email {
                color:#707070;
            }

            #tr-label-detalhe-pedido {
                font-size: 10px;
                font-weight: bold;
            }

            #tr-info-detalhe-pedido {
                font-size: 12px;
                vertical-align: top;
                height: 40px;
            }

            #email-container {
                width: 80%;
            }

            #tabela-detalhes-pedido {
                width: 100%;
            }

            #tabela-detalhes-pedido td {
                width: 25%;
                padding: 0 5px;
            }

            #tabela-itens-pedido {
                width: 100%;
                font-size: 10px;
            }

            #tabela-itens-pedido td {
                background-color: #f1f0f6;
            }

            #tabela-itens-pedido thead tr {
                background-color:#80a4dc;
                color:white;
            }

            #tabela-itens-pedido thead {
                width:100%;
            }
        `
    }
}

class MensagemPedidoGerado {
    
    pedido;
    idPedido = '';
    nomeSolicitante = '';
    emailSolicitante = '';
    statusPedido = '';
    dataPedido = '';
    objItensPedido = [];
    atendentes = [];
    msgAtendente = `
    <p>Prezado(a) atendente.</p>
    <p>Um novo pedido de material foi criado e aguarda atendimento</p>
    `;
    msgSolicitante = `
    <p>Prezado(a) servidor.</p>
    <p>Recebemos seu pedido de material. Assim que for processado enviaremos um email com detalhes sobre o atendimento.</br>
    É possível acompanhar o andamento de seus pedidos na área 'Meus pedidos' do Umox.</p>
    `;

    constructor(pedido) {
        this.pedido = pedido;
    }

    async enviar() {
        await this.carregaDadosMensagem();
        let htmlSolicitante = this.gerarHtml(this.msgSolicitante);
        let htmlAtendente = this.gerarHtml(this.msgAtendente);
        const subject = `Pedido de Material nº ${this.idPedido}`;

        // Envia email para solicitante
        this.introMsg = this.msgSolicitante;
        let toEmail = this.emailSolicitante;
        let mailer = new Mailer(subject, toEmail, htmlSolicitante);
        try {
            await mailer.sendEmail();
        } catch (error) {
            console.log(error);
        }

        // Envia email para atendentes
        this.introMsg = this.msgAtendente;
        this.atendentes.forEach(async (atendente) => {
            let toEmail = atendente.email_usuario;
            let mailer = new Mailer(subject, toEmail, htmlAtendente);
            try {
                await mailer.sendEmail();
            } catch (error) {
                console.log(error);
            }
        });
    }

    async carregaDadosMensagem() {
        this.idPedido = this.pedido.idPedido;
        this.statusPedido = this.pedido.status;
        this.dataPedido = dateToView(this.pedido.dtPedido);
        
        const itemPedido = new ItemPedido;
        this.objItensPedido = (await itemPedido.listarPorPedido(this.idPedido)).dados;
        console.log(this.objItensPedido);

        const usuario = new Usuario;
        await usuario.carregarPorId(this.pedido.idUsuario);
        this.nomeSolicitante = usuario.nome;
        this.emailSolicitante = usuario.email;
        this.atendentes = (await usuario.listarPorPerfil('Atendente')).dados
    }

    gerarHtml(introMsg) {
        const tabelaItens = this.geraTabelaItens();
        const html = `
        <style>
            ${this.style()}
        </style>
        <div id="email-container">
        <h1>UMOX - Gestão de Almoxarifado</h1>
        <div id="div-corpo-email">
        ${introMsg}
        <h2>Detalhes do pedido</h2>
        <table id="tabela-detalhes-pedido">
            <tbody>
                <tr id="tr-label-detalhe-pedido">
                    <td>Nº Pedido:</td>
                    <td>Data do pedido:</td>
                    <td>Solicitante:</td>
                    <td>Status do Pedido:</td>
                </tr>
                <tr id="tr-info-detalhe-pedido">
                    <td>${this.idPedido}</td>
                    <td>${this.dataPedido}</td>
                    <td>${this.nomeSolicitante}</td>
                    <td>${this.statusPedido}</td>
                </tr>
            </tbody>
        </table>
        <h2>Itens do pedido:</h2>
        ${tabelaItens}
        </div>
        </div>
        `
        return html;
    }

    geraListaItens() {
        let listaItens = '';
        this.objItensPedido.forEach(item => {
            let str = 
                `<tr>
                    <td style="text-align:center;">${item.id_item}</td>
                    <td>${item.descricao_item}</td>
                    <td>${item.marca_item}</td>
                    <td style="text-align:center;">${item.qtd_solicitada}</td>
                    <td style="text-align:center;">${item.estoque_item}</td>
                </tr>
                `
            listaItens += str; 
        });

        return listaItens;
    }

    geraTabelaItens() {
        const listaItens = this.geraListaItens();
        let html = 
        `<table id="tabela-itens-pedido">
            <thead>
                <tr>
                    <th style="text-align: center; width: 10%">ID ITEM</th>
                    <th style="text-align: left; width: 50%">DESCRIÇÃO</th>
                    <th style="text-align: left; width: 20%">MARCA</th>
                    <th style="text-align: center; width: 10%">QTD. SOLICITADA</th>
                    <th style="text-align: center; width: 10%">ESTOQUE</th>
                </tr>
            </thead>
            <tbody>
                ${listaItens}
            </tbody>
        </table>`;
        
        return html;
    }

    style = () => {
        return `
        
        * {
            font-family: tahoma;
        }
    
        h1 {
            color: #1e65ae;
        }
    
        h2 {
            margin-bottom: 10px;
            margin-top: 20px;
        }
    
        #div-corpo-email {
            color:#707070;
        }
    
        #tr-label-detalhe-pedido {
            font-size: 10px;
            font-weight: bold;
        }
    
        #tr-info-detalhe-pedido {
            font-size: 12px;
            vertical-align: top;
        }
    
        #email-container {
            width: 80%;
        }
    
        #tabela-detalhes-pedido {
            width: 100%;
        }
    
        #tabela-detalhes-pedido td {
            width: 25%;
            padding: 0 5px;
        }
    
        #tabela-itens-pedido {
            width: 100%;
            font-size: 10px;
        }
    
        #tabela-itens-pedido td {
            background-color: #f1f0f6;
        }
    
        #tabela-itens-pedido thead tr {
            background-color:#80a4dc;
            color:white;
        }
    
        #tabela-itens-pedido thead {
            width:100%;
        }
        `
    }
}

module.exports = {Mailer, MensagemPedidoFinalizado, MensagemPedidoGerado};