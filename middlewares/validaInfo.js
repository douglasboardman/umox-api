module.exports = (req, res, next) => {
    const { email, nome, senha } = req.body;

    function emailValido(emailUsuario) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailUsuario);
    }

    if (req.path === "/register") {
        if (![email, nome, senha].every(Boolean)) {
            return res.status(403).json({message: "Usuário não possui credenciais"});
        } else if (!emailValido(email)) {
            return res.status(400).json({message: "Email inválido"});
        }
    } else if (req.path === "/login") {
        if (![email, senha].every(Boolean)) {
            return res.status(400).json({message: "Credenciais não informadas"});
        } else if (!emailValido(email)) {
            return res.status(400).json({message: "Email inválido"});
        }
    }
    next();
};