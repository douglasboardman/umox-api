const nodemailer = require('nodemailer');
const {google} = require('googleapis');
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
            from: process.env.mailer_sender,
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

module.exports = Mailer;