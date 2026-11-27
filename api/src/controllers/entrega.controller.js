
const pool = require('../config/db');

// REGISTRAR UNA ENTREGA DE UN APRENDIZ
const crearEntrega = async (req, res) => {
    try {
        const { id_actividad, respuesta } = req.body;
        const id_aprendiz = req.usuario.id;

        if (!id_actividad || !respuesta || !respuesta.trim()) {
            return res.status(400).json({
                mensaje: 'Debes indicar la actividad y escribir una respuesta'
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

        await pool.query(
            `INSERT INTO entregas (id_actividad, id_aprendiz, respuesta)
             VALUES (?, ?, ?)`,
            [id_actividad, id_aprendiz, respuesta]
        );

        res.status(201).json({
            mensaje: 'Entrega registrada correctamente'
        });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensaje: 'Ya has enviado una respuesta para esta actividad'
            });
        }

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al registrar la entrega'
        });
    }
};


// CONSULTAR LAS ENTREGAS DEL ADMINISTRADOR
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

        res.json(entregas);

    } catch (error) {
        console.error(error);

        res.status(500).json({
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

        res.json({
            mensaje: 'Entrega calificada correctamente'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
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

        res.json(entregas);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error al consultar tus entregas'
        });
    }
};


// EXPORTAR FUNCIONES
module.exports = {
    crearEntrega,
    obtenerEntregas,
    calificarEntrega,
    obtenerMisEntregas
};
