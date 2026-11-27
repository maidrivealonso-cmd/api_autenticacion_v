
const express = require('express');
const router = express.Router();

const {
    crearEntrega,
    obtenerEntregas,
    calificarEntrega,
    obtenerMisEntregas
} = require('../controllers/entrega.controller');

const validarToken = require('../middleware/validarToken');
const autorizarRol = require('../middleware/autorizarRol');

// El aprendiz registra una entrega
router.post(
    '/entregas',
    validarToken,
    autorizarRol('aprendiz'),
    crearEntrega
);

// El administrador consulta todas las entregas
router.get(
    '/entregas',
    validarToken,
    autorizarRol('admin'),
    obtenerEntregas
);

// El administrador califica una entrega
router.put(
    '/entregas/:id',
    validarToken,
    autorizarRol('admin'),
    calificarEntrega
);

// El aprendiz consulta sus propias entregas
router.get(
    '/mis-entregas',
    validarToken,
    autorizarRol('aprendiz'),
    obtenerMisEntregas
);

module.exports = router;