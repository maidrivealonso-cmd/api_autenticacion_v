
const express = require('express');
const router = express.Router();

const db = require('../config/db');

router.post('/registro', async (req, res) => {
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

        await db.execute(
            'INSERT INTO usuarios (nombre, apellidos, fecha_nacimiento, correo, telefono, usuario, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nombre, apellidos, fecha_nacimiento, correo, telefono, usuario, password]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
});

router.post('/login', async (req, res) => {
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

        if (usuarioEncontrado.password !== password) {
            return res.status(401).json({
                mensaje: 'Error en la autenticacion'
            });
        }

        res.status(200).json({
            mensaje: 'Autenticacion exitosa'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
});

module.exports = router;
