
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// REGISTRAR UNA ENTREGA CON ARCHIVOS
const crearEntrega = async (req, res) => {
    const archivosSubidos = req.files || [];

    try {
        const { id_actividad, respuesta } = req.body || {};
        const id_aprendiz = req.usuario.id;

        if (!id_actividad || (!respuesta?.trim() && archivosSubidos.length === 0)) {
            return res.status(400).json({
                mensaje: 'Escribe una respuesta o adjunta al menos un archivo'
            });
        }

        const [actividad] = await pool.query(
            'SELECT id FROM actividades WHERE id = ?',
            [id_actividad]
        );

        if (actividad.length === 0) {
            return res.status(404).json({
                mensaje: 'La actividad no existe'
            });
        }

        const conexion = await pool.getConnection();

        try {
            await conexion.beginTransaction();

            const [resultado] = await conexion.query(
                `INSERT INTO entregas (id_actividad, id_aprendiz, respuesta)
                 VALUES (?, ?, ?)`,
                [id_actividad, id_aprendiz, respuesta?.trim() || '']
            );

            const id_entrega = resultado.insertId;

            for (const archivo of archivosSubidos) {
                await conexion.query(
                    `INSERT INTO archivos_entrega
                    (id_entrega, nombre_original, nombre_archivo, tipo_mime, tamano)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        id_entrega,
                        archivo.originalname,
                        archivo.filename,
                        archivo.mimetype,
                        archivo.size
                    ]
                );
            }

            await conexion.commit();

            return res.status(201).json({
                mensaje: 'Entrega registrada correctamente',
                id_entrega,
                archivos: archivosSubidos.length
            });

        } catch (error) {
            await conexion.rollback();
            throw error;
        } finally {
            conexion.release();
        }

    } catch (error) {
        archivosSubidos.forEach((archivo) => {
            fs.unlink(
                archivo.path,
                (errorArchivo) => {
                    if (errorArchivo) console.error(errorArchivo);
                }
            );
        });

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensaje: 'Ya has enviado una respuesta para esta actividad'
            });
        }

        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al registrar la entrega'
        });
    }
};


// CONSULTAR TODAS LAS ENTREGAS DEL ADMINISTRADOR
const obtenerEntregas = async (req, res) => {
    try {
        const [entregas] = await pool.query(`
            SELECT
                e.id,
                e.id_actividad,
                a.titulo AS actividad,
                e.id_aprendiz,
                u.nombre,
                u.apellidos,
                e.respuesta,
                e.observacion,
                e.estado,
                e.fecha_entrega
            FROM entregas e
            INNER JOIN actividades a ON e.id_actividad = a.id
            INNER JOIN usuarios u ON e.id_aprendiz = u.id
            ORDER BY e.fecha_entrega DESC
        `);

        for (const entrega of entregas) {
            const [archivos] = await pool.query(
                `SELECT id, nombre_original, nombre_archivo, tipo_mime, tamano
                 FROM archivos_entrega
                 WHERE id_entrega = ?`,
                [entrega.id]
            );

            entrega.archivos = archivos;
        }

        return res.json(entregas);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al consultar las entregas'
        });
    }
};


// CALIFICAR UNA ENTREGA
const calificarEntrega = async (req, res) => {
    try {
        const { estado, observacion } = req.body;
        const { id } = req.params;

        const estadosPermitidos = [
            'pendiente',
            'aprobada',
            'rechazada'
        ];

        if (!estadosPermitidos.includes(estado)) {
            return res.status(400).json({
                mensaje: 'El estado seleccionado no es válido'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE entregas
             SET estado = ?, observacion = ?
             WHERE id = ?`,
            [estado, observacion || null, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró la entrega'
            });
        }

        return res.json({
            mensaje: 'Entrega calificada correctamente'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al calificar la entrega'
        });
    }
};


// CONSULTAR LAS ENTREGAS DEL APRENDIZ
const obtenerMisEntregas = async (req, res) => {
    try {
        const id_aprendiz = req.usuario.id;

        const [entregas] = await pool.query(`
            SELECT
                e.id,
                a.titulo AS actividad,
                e.respuesta,
                e.estado,
                e.observacion,
                e.fecha_entrega
            FROM entregas e
            INNER JOIN actividades a ON e.id_actividad = a.id
            WHERE e.id_aprendiz = ?
            ORDER BY e.fecha_entrega DESC
        `, [id_aprendiz]);

        for (const entrega of entregas) {
            const [archivos] = await pool.query(
                `SELECT id, nombre_original, nombre_archivo, tipo_mime, tamano
                 FROM archivos_entrega
                 WHERE id_entrega = ?`,
                [entrega.id]
            );

            entrega.archivos = archivos;
        }

        return res.json(entregas);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al consultar tus entregas'
        });
    }
};


// DESCARGAR ARCHIVO DE UNA ENTREGA
const descargarArchivo = async (req, res) => {
    try {
        const { id, archivoId } = req.params;

        const [archivos] = await pool.query(
            `SELECT ae.nombre_original, ae.nombre_archivo, e.id_aprendiz
             FROM archivos_entrega ae
             INNER JOIN entregas e ON ae.id_entrega = e.id
             WHERE ae.id = ? AND e.id = ?`,
            [archivoId, id]
        );

        if (archivos.length === 0) {
            return res.status(404).json({
                mensaje: 'No se encontró el archivo'
            });
        }

        const archivo = archivos[0];

        if (
            req.usuario.rol !== 'admin' &&
            Number(req.usuario.id) !== Number(archivo.id_aprendiz)
        ) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para descargar este archivo'
            });
        }

        const rutaArchivo = path.join(
            __dirname,
            '../../uploads/entregas',
            archivo.nombre_archivo
        );

        return res.download(rutaArchivo, archivo.nombre_original, (error) => {
            if (error && !res.headersSent) {
                console.error(error);
                res.status(404).json({
                    mensaje: 'El archivo no está disponible'
                });
            }
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            mensaje: 'Error al descargar el archivo'
        });
    }
};


// EXPORTAR FUNCIONES
module.exports = {
    crearEntrega,
    obtenerEntregas,
    calificarEntrega,
    obtenerMisEntregas,
    descargarArchivo
};
