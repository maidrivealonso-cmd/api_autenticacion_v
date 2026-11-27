
const express = require('express');
const router = express.Router();

const {
    crearActividad,
    obtenerActividades,
    obtenerActividad,
    actualizarActividad,
    eliminarActividad
} = require('../controllers/actividad.controller');

const validarToken = require('../middleware/validarToken');
const autorizarRol = require('../middleware/autorizarRol');

// Consultar actividades (administrador y aprendiz)
router.get('/actividades', validarToken, obtenerActividades);

// Consultar una actividad
router.get('/actividades/:id', validarToken, obtenerActividad);

// Crear actividad (solo administrador)
router.post(
    '/actividades',
    validarToken,
    autorizarRol('admin'),
    crearActividad
);

// Actualizar actividad (solo administrador)
router.put(
    '/actividades/:id',
    validarToken,
    autorizarRol('admin'),
    actualizarActividad
);

// Eliminar actividad (solo administrador)
router.delete(
    '/actividades/:id',
    validarToken,
    autorizarRol('admin'),
    eliminarActividad
);

module.exports = router;
