
const express = require('express');
const router = express.Router();

const {
    registrarUsuario,
    login
} = require('../controllers/auth.controller');

const validarToken = require('../middleware/validarToken');
const autorizarRol = require('../middleware/autorizarRol');

// Registrar usuario
router.post('/registro', registrarUsuario);

// Iniciar sesión
router.post('/login', login);

// Consultar perfil del usuario autenticado
router.get('/perfil', validarToken, (req, res) => {
    res.status(200).json({
        mensaje: 'Perfil consultado correctamente',
        usuario: req.usuario
    });
});

// Consultar aprendices (solo administrador)
router.get(
    '/usuarios',
    validarToken,
    autorizarRol('admin'),
    async (req, res) => {
        try {
            const db = require('../config/db');

            const [usuarios] = await db.execute(
                `SELECT id, nombre, apellidos, correo, telefono, usuario, rol
                 FROM usuarios
                 WHERE rol = ?`,
                ['aprendiz']
            );

            res.status(200).json({
                mensaje: 'Lista de aprendices',
                usuarios
            });

        } catch (error) {
            console.error(error);

            res.status(500).json({
                mensaje: 'Error al consultar los aprendices'
            });
        }
    }
);

module.exports = router;
