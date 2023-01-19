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
            div {
                background-color: #f1f0f6;
            }
        </style>
        <h1 style="color: #1e65ae;">UMOX - Gestão de Almoxarifado</h1>
        <div style="color: #707070">
        <p>Prezado(a) servidor(a)</p>
        <p>Seu pedido de material nº ${this.idPedido} foi finalizado pelo atendente com o status: <b>${this.statusAtendimento}</b></p>
        <h2>Detalhes do pedido</h2>
        <table>
            <tbody>
                <tr>
                    <td style="width: 220px; background-color: #f1f0f6; font-weight: 500;">Nº Pedido:</td>
                    <td>${this.idPedido}</td>
                </tr>
                <tr>
                    <td style="width: 220px; background-color: #f1f0f6; font-weight: 500;">Data do pedido:</td>
                    <td>${this.dataPedido}</td>
                </tr>
                <tr>
                    <td style="width: 220px; background-color: #f1f0f6; font-weight: 500;">Data do atendimento:</td>
                    <td>${this.dataAtendimento}</td>
                </tr>
                <tr>
                    <td style="width: 220px; background-color: #f1f0f6; font-weight: 500;">Status do atendimento:</td>
                    <td>${this.statusAtendimento}</td>
                </tr>
                <tr>
                    <td style="width: 220px; background-color: #f1f0f6; font-weight: 500;">Despacho do atendimento:</td>
                    <td>${this.obsAtendimento}</td>
                </tr>
            </tbody>
        </table>
        <h3>Relação de itens do pedido:</h3>
        ${tabelaItens}
        </div>
        </body>
        </html>
        `
        return html;
    }

    geraListaItens() {
        let listaItens = '';
        this.objItensPedido.forEach(item => {
            let str = 
                `<tr>
                    <td>${item.id_item}</td>
                    <td>${item.descricao_item}</td>
                    <td>${item.marca_item}</td>
                    <td>${item.qtd_solicitada}</td>
                    <td>${item.qtd_atendida}</td>
                </tr>
                `
            listaItens += str; 
        });

        return listaItens;
    }

    geraTabelaItens() {
        const listaItens = this.geraListaItens();
        let html = 
        `<table>
            <thead style="width: 100%;">
                <tr style="background-color: #80a4dc; color: white;">
                    <th style="text-align: left; width: 10%">ID ITEM</th>
                    <th style="text-align: left; width: 50%">DESCRIÇÃO</th>
                    <th style="text-align: left; width: 20%">MARCA</th>
                    <th style="text-align: left; width: 10%">QTD. SOLICITADA</th>
                    <th style="text-align: left; width: 10%">QTD. ATENDIDA</th>
                </tr>
            </thead>
            <tbody>
                ${listaItens}
            </tbody>
        </table>`;
        
        return html;
    }


}

module.exports = {Mailer, MensagemPedidoFinalizado};