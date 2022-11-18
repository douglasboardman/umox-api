const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');

const port = 3000;
var path = require('path');
const app = express();

var email = 'douglas.boardman@gmail.com';
var senha = '123456';

app.use(session({secret: 'kdhe74jfollsd8kefjsiudf34jd'}));
app.use(bodyParser.urlencoded({extended: true}));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/views'));

app.post('/', (req, res)=>{
    if(req.body.email == email && req.body.senha == senha) {
        //logado com sucesso!!!
        console.log(req.body.email + " | " + req.body.senha);
        req.session.login = email;
        res.render('home');
    } else {
        res.render('index');
    }
});

app.get('/', (req, res)=>{
    if(req.session.login){
        res.render('home');
    } else {
        res.render('index');
    }
});

app.listen(port, ()=>{
    console.log('Servidor rodando');
});