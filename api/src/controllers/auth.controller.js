
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const db = require('../config/db');

// REGISTRO DE USUARIOS
const registrarUsuario = async (req, res) => {
    console.log(req.body);

    const {
        nombre,
        apellidos,
        fecha_nacimiento,
        correo,
        telefono,
        usuario,
        password
    } = req.body;

    if (!nombre || !apellidos || !fecha_nacimiento || !correo || !telefono || !usuario || !password) {
        return res.status(400).json({
            mensaje: 'Por favor, ingrese todos los datos'
        });
    }

    try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuarios WHERE usuario = ? OR correo = ?',
            [usuario, correo]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                mensaje: 'El usuario ya existe'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.execute(
            `INSERT INTO usuarios
            (nombre, apellidos, fecha_nacimiento, correo, telefono, usuario, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre,
                apellidos,
                fecha_nacimiento,
                correo,
                telefono,
                usuario,
                passwordHash
            ]
        );

        return res.status(201).json({
            mensaje: 'Usuario registrado correctamente'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

// INICIO DE SESIÓN
const login = async (req, res) => {
    console.log('DATOS RECIBIDOS:', req.body);

    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({
            mensaje: 'Por favor, ingrese usuario y contraseña'
        });
    }

    try {
        const [usuarios] = await db.execute(
            'SELECT * FROM usuarios WHERE usuario = ?',
            [usuario]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensaje: 'Error en la autenticacion'
            });
        }

        const usuarioEncontrado = usuarios[0];

        const passwordValida = await bcrypt.compare(
            password,
            usuarioEncontrado.password
        );

        if (!passwordValida) {
            return res.status(401).json({
                mensaje: 'Error en la autenticacion'
            });
        }

        // GENERAR TOKEN JWT
        const token = jwt.sign(
            {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                rol: usuarioEncontrado.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return res.status(200).json({
            mensaje: 'Autenticacion exitosa',
            token: token,
            usuario: {
                id: usuarioEncontrado.id,
                usuario: usuarioEncontrado.usuario,
                rol: usuarioEncontrado.rol
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
};

module.exports = {
    registrarUsuario,
    login
};
