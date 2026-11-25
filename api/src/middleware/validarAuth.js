const validarAuth = (req, res, next) => {
    const { usuario, password } = req.body;

    if(typeof usuario != 'string' || typeof password !='string' || 
        !usuario.trim() || !password.trim()){
            return res.status(400).json({
                mensaje: 'debe enviar un usuario y contraseña válidos'
            });
        
        };
        next();
    }



module.exports = validarAuth;