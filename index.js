const express = require('express');
const app = express();
const cors = require("cors");
const port = 3000;


//middleware

app.use(express.json()); //req.body
app.use(cors());

//ROUTES//

// routes de registro e login

app.use("/auth", require("./routes/jwtAuth"));

// route para dashboard

app.use("/dashboard", require("./routes/dashboard"));

app.listen(port, ()=>{
    console.log('Servidor rodando');
});