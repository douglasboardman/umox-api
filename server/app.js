const url = require('url');
const fs = require('fs');

function renderHTML(path, res) {
    
    fs.readFile(path, null, (erro, dados) => {
        if(erro) {
            res.writeHead(404);
            res.write('Página não encontrada!')
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(dados);
        }
        res.end();
    });
}

module.exports = {
    handleRequest: function(req, res) {
        let path = url.parse(req.url).pathname;
        switch (path) {
            case '/': 
                renderHTML('./client/views/index.html', res);
                break;
            case '/auth/login': 
                renderHTML('./client/views/login.html', res);
                break;
            default:
                res.writeHead(404);
                res.write('Página não encontrada');
                res.end();
        }
    }
}