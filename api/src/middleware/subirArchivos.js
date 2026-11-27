
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const almacenamiento = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.join(__dirname, '../../uploads/entregas'));
    },

    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const nombreUnico = `${crypto.randomUUID()}${extension}`;
        callback(null, nombreUnico);
    }
});

const tiposPermitidos = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.txt'
];

const filtroArchivos = (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (tiposPermitidos.includes(extension)) {
        callback(null, true);
    } else {
        callback(new Error('Tipo de archivo no permitido'));
    }
};

const subirArchivos = multer({
    storage: almacenamiento,
    fileFilter: filtroArchivos,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 5
    }
});

module.exports = subirArchivos;
