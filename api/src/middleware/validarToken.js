
const jwt = require('jsonwebtoken');

const validarToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            mensaje: 'No se proporcionó un token de autenticación'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const usuario = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.usuario = usuario;

        next();

    } catch (error) {
        return res.status(401).json({
            mensaje: 'Token inválido o expirado'
        });
    }
};

module.exports = validarToken;
