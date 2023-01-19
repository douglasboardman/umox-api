const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const ItemPedido = require('./item_pedido');
const { dateToView } = require('../utils/comum');
const Usuario = require('./usuario');
const Pedido = require('./pedido');
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
        this.dataPedido = dateToView(this.pedido.dataPedido);
        this.dataAtendimento = dateToView(this.pedido.dataAtendimento);
        
        const itemPedido = new ItemPedido;
        this.objItensPedido = (await itemPedido.listarPorPedido(this.idPedido)).dados;

        const usuario = new Usuario;
        await usuario.carregarPorId(this.pedido.idUsuario);
        this.nomeUsuario = usuario.nome;
        this.emailUsuario = usuario.email;
    }

    gerarHtml() {
        const tabelaItens = this.geraTabelaItens();
        const html = `
        <h1>UMOX - Gestão de Almoxarifado</h1>
        <p>Prezado(a) servidor(a)</p>
        <p>Seu pedido de material nº ${this.idPedido} foi finalizado pelo atendente com o status: <b>${this.statusAtendimento}</b></p>
        <h2>Detalhes do pedido</h2>
        <p><b><span style="width: 60px;">Nº Pedido:</span></b><span>${this.idPedido}</span></p>
        <p><b><span style="width: 60px;">Solicitante:</span></b><span>${this.nomeUsuario}</span></p>
        <p><b><span style="width: 60px;">Data do pedido:</span></b><span>${this.dataPedido}</span></p>
        <p><b><span style="width: 60px;">Data de Atendimento:</span></b><span>${this.dataAtendimento}</span></p>
        <p><b><span style="width: 60px;">Status do Atendimento:</span></b><span>${this.statusAtendimento}</span></p>
        <$><b><span style="width: 60px;">Despacho do Atendimento:</span></b>${this.obsAtendimento}</p>
        <h3>Relação de itens do pedido:</h3>
        ${tabelaItens}
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
            <thead>
                <tr>
                    <th>ID ITEM</th>
                    <th>DESCRIÇÃO</th>
                    <th>MARCA</th>
                    <th>QTD. SOLICITADA</th>
                    <th>QTD. ATENDIDA</th>
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