
const autorizarRol = (...rolesPermitidos) => {
    return (req, res, next) => {

        if (!req.usuario) {
            return res.status(401).json({
                mensaje: 'No se ha autenticado el usuario'
            });
        }

        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para acceder a esta función'
            });
        }

        next();
    };
};

module.exports = autorizarRol;
