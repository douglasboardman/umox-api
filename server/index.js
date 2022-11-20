const express = require('express');
const app = express();
const cors = require("cors");
const port = 3000;

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