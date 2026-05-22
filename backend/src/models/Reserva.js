const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
    ong_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    doacao_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Doacao', required: true },
    data_reserva: { type: Date, default: Date.now },
    status: { type: String, enum: ['PENDENTE', 'CONFIRMADA', 'CONCLUIDA', 'CANCELADA'], default: 'PENDENTE' }
});

module.exports = mongoose.model('Reserva', reservaSchema);
