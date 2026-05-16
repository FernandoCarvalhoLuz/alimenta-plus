const mongoose = require('mongoose');

const doacaoSchema = new mongoose.Schema({
    doador_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    titulo: { type: String, required: true },
    categoria: { type: String, required: true },
    quantidade: { type: String, required: true },
    status_reserva: { type: String, enum: ['DISPONIVEL', 'RESERVADA', 'COLETADA'], default: 'DISPONIVEL' },
    ong_reservou_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null },
    data_criacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doacao', doacaoSchema);
