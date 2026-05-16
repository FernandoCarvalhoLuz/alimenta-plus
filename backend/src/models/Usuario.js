const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    tipo_perfil: { type: String, enum: ['DOADOR', 'ONG'], required: true },
    empresa: { type: String, required: true },
    aceitou_termo_juridico: { type: Boolean, required: true },
    reputacao: { type: Number, default: 5 },
    endereco: {
        cep: String,
        bairro: String,
        logradouro: String,
        numero: String
    },
    data_cadastro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
