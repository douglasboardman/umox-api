const conn = require("../dbConnPool");
const bcrypt = require('bcrypt');

class Usuario {
    constructor(email, senha, nome, perfil, acesso, id) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil;
        this.acesso = acesso;
        this.status = '';
    }

    async cadastrar (nome, email, senha, perfil, acesso) {
        
        if (typeof perfil == 'undefined'){
            perfil = 'Solicitante';
        }

        if (typeof acesso == 'undefined') {
            acesso = false;
        }

        try {
            senha = await criptografarSenha(senha);
            const db_return = await conn.query(
                'INSERT INTO usuarios (nome_usuario, email_usuario, senha_usuario, perfil_usuario, acesso_permitido) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [nome, email, senha, perfil, acesso]
            );

            let dados = db_return.rows[0];

            if (typeof dados != 'undefined') {
                this.id = dados.id_usuario;
                this.nome = dados.nome_usuario;
                this.email = dados.email_usuario;
                this.senha = dados.senha_usuario;
                this.perfil = dados.perfil_usuario;
                this.acesso = dados.acesso_permitido;
                this.status = 'Usuário cadastrado';
            }

            return {status: true, msg: "Usuário cadastrado com sucesso!"};

        } catch (erro){
            console.log(erro);
            this.status = 'Usuário não cadastrado';
            return {status: false, msg: erro};
        }
    }

    async atualizar (id, nome, email, perfil, acesso, senha) {
        if(typeof senha == 'undefined') {
            try {
                const db_return = await conn.query(
                    'UPDATE usuarios SET nome_usuario = $1, email_usuario = $2, perfil_usuario = $3, acesso_permitido = $4 WHERE id_usuario = $5 RETURNING *',
                    [nome, email, perfil, acesso, id]
                );
                return {status: true, msg: 'Usuário atualizado com sucesso!', dados: db_return.rows[0]}
            } catch (erro) {
                return {status: false, msg: erro, dados: []}
            }
        } else {
            try {
                const db_return = await conn.query(
                    'UPDATE usuarios SET nome_usuario = $1, email_usuario = $2, senha_usuario = $3, perfil_usuario = $4, acesso_permitido = $5 WHERE id_usuario = $6 RETURNING *',
                    [nome, email, senha, perfil, acesso, id]
                );
                return {status: true, msg: 'Usuário atualizado com sucesso!', dados: db_return.rows[0]}
            } catch (erro) {
                return {status: false, msg: erro, dados: []}
            }
        }
    }

    async listarPermissoes () {
        if (typeof this.id == 'undefined') {
            return {status: false, msg: 'Não é possível listar permissões de um usuário ainda não cadastrado'};
        } else {
            const db_return = await conn.query(
                'SELECT permissoes FROM perfis WHERE perfil = $1',
                [this.perfil]
            );
            return {status: true, dados: db_return.rows[0].permissoes};
        }
    }

    async carregarPorEmail(email) {
        if (typeof email != 'undefined' && emailValido(email)) {
            
            const db_return = await conn.query(
                'SELECT * FROM usuarios WHERE email_usuario = $1',
                [email]
            );

            if (typeof db_return.rows[0] != 'undefined') {
                this.id = db_return.rows[0].id_usuario;
                this.nome = db_return.rows[0].nome_usuario;
                this.email = db_return.rows[0].email_usuario;
                this.senha = db_return.rows[0].senha_usuario;
                this.perfil = db_return.rows[0].perfil_usuario;
                this.acesso = db_return.rows[0].acesso_permitido;
                this.status = 'Usuário cadastrado';
                return {status: true, msg: 'Usuário carregado com sucesso!'};
            } else {
                return {status: false, msg: 'Nenhum usuário localizado a partir do email: ' + email};
            }
        } else {
            return {status: false, msg: 'Email inválido ou não informado'};
        }
    }

    async carregarPorId(id) {
        if (typeof id != 'undefined') {
            
            const db_return = await conn.query(
                'SELECT * FROM usuarios WHERE id_usuario = $1',
                [id]
            );

            if (typeof db_return.rows[0] != 'undefined') {
                this.id = db_return.rows[0].id_usuario;
                this.nome = db_return.rows[0].nome_usuario;
                this.email = db_return.rows[0].email_usuario;
                this.senha = db_return.rows[0].senha_usuario;
                this.perfil = db_return.rows[0].perfil_usuario;
                this.acesso = db_return.rows[0].acesso_permitido;
                this.status = 'Usuário cadastrado';
                return {status: true, msg: 'Usuário carregado com sucesso!', dados: db_return.rows[0]};
            } else {
                return {status: false, msg: 'Nenhum usuário localizado a partir do email: ' + email, dados: []};
            }
        } else {
            return {status: false, msg: 'Email inválido ou não informado', dados: []};
        }
    }

    async listarTodos() {
        try{
            const db_return = await conn.query('SELECT * FROM usuarios ORDER BY perfil_usuario, nome_usuario');
            return {
                status: true, 
                msg: `A consulta retornou ${db_return.rowCount} linhas`, 
                dados: db_return.rows
            };
        } catch (erro) {
            return {status: false, msg: 'Email inválido ou não informado', dados: []};
        }
    }

    async listarPorPerfil(perfil) {
        if (typeof perfil != 'undefined') {
            
            const db_return = await conn.query(
                'SELECT * FROM usuarios WHERE perfil_usuario = $1',
                [perfil]
            );

            if (typeof db_return.rows[0] != 'undefined') {
                return {status: true, msg: `A consulta retornou ${db_return.rowCount} linhas`, dados: db_return.rows};
            } else {
                return {status: false, msg: `Não há usuários cadastrados com o perfil '${perfil}'`, dados: []};
            }
        } else {
            return {status: false, msg: 'Perfil inválido ou não informado', dados: []};
        }
    }
    
    async listarPerfis () {
        const db_return = await conn.query('SELECT perfil FROM perfis');
        return {status: true, dados: db_return.rows}
    }

    async criarRecuperacaoSenha() {
        
    }
}

async function criptografarSenha(senha) {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptSenha = await bcrypt.hash(senha, salt);
    return bcryptSenha;
}

function emailValido(emailUsuario) {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailUsuario);
}




module.exports = Usuario;