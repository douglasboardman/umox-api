module.exports = (req, res, next) => {
    const { email, nome, senha } = req.body;

    function emailValido(emailUsuario) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailUsuario);
    }

    if (req.path === "/register") {
        if (![email, nome, senha].every(Boolean)) {
            return res.status(401).json("Sem credenciais");
        } else if (!emailValido(email)) {
            return res.status(401).json("Email inválido");
        }
    } else if (req.path === "/login") {
        if (![email, senha].every(Boolean)) {
            return res.status(401).json("Sem credenciais");
        } else if (!emailValido(email)) {
            return res.status(401).json("Email inválido");
        }
    }
    next();
};