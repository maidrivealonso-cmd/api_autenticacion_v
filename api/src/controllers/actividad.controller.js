
const pool = require('../config/db');

// Crear actividad
const crearActividad = async (req, res) => {
    try {
        const { titulo, descripcion, fecha_limite } = req.body;

        if (!titulo || !descripcion || !fecha_limite) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const id_administrador = req.usuario.id;

        const [resultado] = await pool.query(
            `INSERT INTO actividades
            (titulo, descripcion, fecha_limite, id_administrador)
            VALUES (?, ?, ?, ?)`,
            [titulo, descripcion, fecha_limite, id_administrador]
        );

        res.status(201).json({
            mensaje: 'Actividad creada correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear la actividad',
            error: error.message
        });
    }
};

// Consultar todas las actividades
const obtenerActividades = async (req, res) => {
    try {
        const [actividades] = await pool.query(
            `SELECT actividades.*, usuarios.nombre AS administrador
            FROM actividades
            INNER JOIN usuarios
            ON actividades.id_administrador = usuarios.id
            ORDER BY actividades.id DESC`
        );

        res.json(actividades);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar actividades',
            error: error.message
        });
    }
};

// Consultar una actividad por ID
const obtenerActividad = async (req, res) => {
    try {
        const { id } = req.params;

        const [actividades] = await pool.query(
            'SELECT * FROM actividades WHERE id = ?',
            [id]
        );

        if (actividades.length === 0) {
            return res.status(404).json({
                mensaje: 'Actividad no encontrada'
            });
        }

        res.json(actividades[0]);

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al consultar la actividad',
            error: error.message
        });
    }
};

// Actualizar actividad
const actualizarActividad = async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, fecha_limite } = req.body;

        if (!titulo || !descripcion || !fecha_limite) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const [resultado] = await pool.query(
            `UPDATE actividades
            SET titulo = ?, descripcion = ?, fecha_limite = ?
            WHERE id = ?`,
            [titulo, descripcion, fecha_limite, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Actividad no encontrada'
            });
        }

        res.json({
            mensaje: 'Actividad actualizada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar la actividad',
            error: error.message
        });
    }
};

// Eliminar actividad
const eliminarActividad = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await pool.query(
            'DELETE FROM actividades WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Actividad no encontrada'
            });
        }

        res.json({
            mensaje: 'Actividad eliminada correctamente'
        });

    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar la actividad',
            error: error.message
        });
    }
};

module.exports = {
    crearActividad,
    obtenerActividades,
    obtenerActividad,
    actualizarActividad,
    eliminarActividad
};
