
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const actividadRoutes = require('./routes/actividad.routes');
const entregaRoutes = require('./routes/entrega.routes');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Api funcionando correctamente'
    });
});

app.use('/api', authRoutes);
app.use('/api', actividadRoutes);
app.use('/api', entregaRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});
