
const express = require('express');
const router = express.Router();

const {
    crearEntrega,
    obtenerEntregas,
    calificarEntrega,
    obtenerMisEntregas,
    descargarArchivo
} = require('../controllers/entrega.controller');

const validarToken = require('../middleware/validarToken');
const autorizarRol = require('../middleware/autorizarRol');
const subirArchivos = require('../middleware/subirArchivos');

// El aprendiz registra una entrega con archivos
router.post(
    '/entregas',
    validarToken,
    autorizarRol('aprendiz'),
    subirArchivos.array('archivos', 5),
    crearEntrega
);

// El administrador consulta todas las entregas
router.get(
    '/entregas',
    validarToken,
    autorizarRol('admin'),
    obtenerEntregas
);

// El aprendiz consulta sus entregas
router.get(
    '/mis-entregas',
    validarToken,
    autorizarRol('aprendiz'),
    obtenerMisEntregas
);

// Descargar un archivo de una entrega
router.get(
    '/entregas/:id/archivos/:archivoId',
    validarToken,
    descargarArchivo
);

// El administrador califica una entrega
router.put(
    '/entregas/:id',
    validarToken,
    autorizarRol('admin'),
    calificarEntrega
);

module.exports = router;
