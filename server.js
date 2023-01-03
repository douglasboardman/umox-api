const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const auth = require('./routes/auth');
const pedidos = require('./routes/pedidos');
const itens = require('./routes/itens');
const usuarios = require('./routes/usuarios');

const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token'
    );

    next();
});

app.use('/', auth);
app.use('/auth', auth);
app.use('/operacoes/pedidos', pedidos);
app.use('/operacoes/itens', itens);
app.use('/operacoes/usuarios', usuarios);
app.use('/admin/pedidos', pedidos);
app.use('/admin/itens', itens);
app.use('/admin/usuarios', usuarios);

app.listen(port, ()=>{console.log("Listening to the server on http://localhost:3000")});
