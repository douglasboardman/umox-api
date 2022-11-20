const express = require('express');
const app = express();
const cors = require("cors");
const port = 3000;

//middleware

app.use(express.json()); //req.body
app.use(cors());

//ROUTES//

//register and login routes

app.use("/auth", require("./routes/jwtAuth"));

app.listen(port, ()=>{
    console.log('Servidor rodando');
});