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

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/', auth);
app.use('/auth', auth);
app.use('/operacoes/pedidos', pedidos);
app.use('/operacoes/itens', itens);
app.use('/operacoes/usuarios', usuarios);
app.use('/admin/pedidos', pedidos);
app.use('/admin/itens', itens);
app.use('/admin/usuarios', usuarios);

app.listen(port, ()=>{console.log("Listening to the server on http://localhost:3000")});