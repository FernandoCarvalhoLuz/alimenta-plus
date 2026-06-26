const express = require('express');
const router = express.Router();
const Doacao = require('../models/Doacao');
const Usuario = require('../models/Usuario');
const Reserva = require('../models/Reserva');

// 1. CADASTRAR UMA NOVA DOAÇÃO (POST /api/doacoes)
router.post('/', async (req, res) => {
    try {
        const { doador_id, titulo, categoria, quantidade, instrucoes_retirada } = req.body;

        if (!doador_id || !titulo || !categoria || !quantidade || !instrucoes_retirada) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios." });
        }

        const doador = await Usuario.findById(doador_id);
        if (!doador || doador.tipo_perfil !== 'DOADOR') {
            return res.status(400).json({ error: "Apenas doadores registrados podem publicar alimentos." });
        }

        const novaDoacao = new Doacao({
            doador_id,
            titulo,
            categoria,
            quantidade,
            instrucoes_retirada,
            status_reserva: 'DISPONIVEL'
        });

        await novaDoacao.save();
        res.status(201).json({ message: "Doação publicada com sucesso!", doacao: novaDoacao });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar doação.", detalhes: error.message });
    }
});

// 2. LISTAR DOAÇÕES (GET /api/doacoes)
// Suporta filtros por doador_id ou por status_reserva
router.get('/', async (req, res) => {
    try {
        const { doador_id, status } = req.query;
        let query = {};

        if (doador_id) {
            query.doador_id = doador_id;
        }
        if (status) {
            query.status_reserva = status;
        } else if (!doador_id) {
            // Por padrão, se não for um doador filtrando suas próprias doações,
            // lista apenas as doações que estão ativas/disponíveis
            query.status_reserva = 'DISPONIVEL';
        }

        const doacoes = await Doacao.find(query)
                                    .populate('doador_id', 'nome empresa endereco reputacao foto_local_base64')
                                    .sort({ data_criacao: -1 });
        res.status(200).json(doacoes);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar doações.", detalhes: error.message });
    }
});

// 3. OBTER RELATÓRIO GLOBAL (GET /api/doacoes/relatorio)
// Onda 3 - Relatório de Oferta e Demanda e Onda 5 - Mapa de Calor
router.get('/relatorio', async (req, res) => {
    try {
        const totalDoacoes = await Doacao.countDocuments();
        const disponiveis = await Doacao.countDocuments({ status_reserva: 'DISPONIVEL' });
        const reservadas = await Doacao.countDocuments({ status_reserva: 'RESERVADA' });
        const coletadas = await Doacao.countDocuments({ status_reserva: 'COLETADA' });

        const totalDoadores = await Usuario.countDocuments({ tipo_perfil: 'DOADOR' });
        const totalONGS = await Usuario.countDocuments({ tipo_perfil: 'ONG' });

        // Cálculos para o Mapa de Calor (Onda 5)
        const doacoesAtivas = await Doacao.find({ status_reserva: 'DISPONIVEL' }).populate('doador_id', 'endereco');
        const heatmapRaw = {};
        doacoesAtivas.forEach(d => {
            if (d.doador_id && d.doador_id.endereco && d.doador_id.endereco.bairro) {
                const bairro = d.doador_id.endereco.bairro;
                heatmapRaw[bairro] = (heatmapRaw[bairro] || 0) + 1;
            }
        });
        const heatmapData = Object.keys(heatmapRaw).map(bairro => ({
            bairro,
            count: heatmapRaw[bairro]
        })).sort((a, b) => b.count - a.count); // decrescente (mais quentes primeiro)

        res.status(200).json({
            totalDoacoes,
            disponiveis,
            reservadas,
            coletadas,
            totalDoadores,
            totalONGS,
            heatmapData
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao gerar relatório.", detalhes: error.message });
    }
});

// 3.5. OBTER RESERVAS ATIVAS DE UMA ONG (GET /api/doacoes/reservas/ong/:ongId)
// Retorna a lista de reservas pendentes daquela ONG para possibilitar cancelamentos
router.get('/reservas/ong/:ongId', async (req, res) => {
    try {
        const { ongId } = req.params;
        const reservas = await Reserva.find({ ong_id: ongId, status: 'PENDENTE' })
                                      .populate({
                                          path: 'doacao_id',
                                          populate: { path: 'doador_id', select: 'nome empresa endereco reputacao foto_local_base64' }
                                      });
        res.status(200).json(reservas);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar reservas da ONG.", detalhes: error.message });
    }
});

// 4. RESERVAR UMA DOAÇÃO (POST /api/doacoes/:id/reservar)
// Onda 3 - Sistema de Reservas
router.post('/:id/reservar', async (req, res) => {
    try {
        const { ong_id } = req.body;
        const doacaoId = req.params.id;

        if (!ong_id) {
            return res.status(400).json({ error: "É obrigatório fornecer o ID da ONG." });
        }

        // Verifica se a ONG existe e possui o perfil correto
        const ong = await Usuario.findById(ong_id);
        if (!ong || ong.tipo_perfil !== 'ONG') {
            return res.status(400).json({ error: "Apenas ONGs cadastradas podem reservar alimentos." });
        }

        // Verifica a doação
        const doacao = await Doacao.findById(doacaoId);
        if (!doacao) {
            return res.status(404).json({ error: "Alimento não encontrado." });
        }

        if (doacao.status_reserva !== 'DISPONIVEL') {
            return res.status(400).json({ error: "Este alimento já foi reservado ou coletado por outra instituição." });
        }

        // Atualiza a doação
        doacao.status_reserva = 'RESERVADA';
        await doacao.save();

        // Cria a reserva
        const novaReserva = new Reserva({
            ong_id,
            doacao_id: doacaoId,
            status: 'PENDENTE'
        });
        await novaReserva.save();

        res.status(201).json({ message: "Reserva realizada com sucesso!", reserva: novaReserva });
    } catch (error) {
        res.status(500).json({ error: "Erro ao realizar reserva.", detalhes: error.message });
    }
});

// 5. CONFIRMAR COLETA (POST /api/doacoes/:id/coletar)
// Onda 2 - Reputação + Onda 3 - Reserva Concluída
router.post('/:id/coletar', async (req, res) => {
    try {
        const doacaoId = req.params.id;

        const doacao = await Doacao.findById(doacaoId);
        if (!doacao) {
            return res.status(404).json({ error: "Doação não encontrada." });
        }

        if (doacao.status_reserva !== 'RESERVADA') {
            return res.status(400).json({ error: "A doação precisa estar reservada para ser marcada como coletada." });
        }

        // Busca a reserva correspondente
        const reserva = await Reserva.findOne({ doacao_id: doacaoId, status: 'PENDENTE' });
        if (!reserva) {
            return res.status(404).json({ error: "Reserva correspondente não encontrada." });
        }

        // Atualiza status
        doacao.status_reserva = 'COLETADA';
        await doacao.save();

        reserva.status = 'CONFIRMADA'; // ou CONCLUIDA
        await reserva.save();

        // Aumenta a reputação da ONG receptora por concluir a coleta com sucesso
        const ong = await Usuario.findById(reserva.ong_id);
        if (ong) {
            // Incrementa de 0.2 em 0.2 até o limite máximo de 5 estrelas
            ong.reputacao = Math.min(5, ong.reputacao + 0.2);
            await ong.save();
        }

        // Aumenta a reputação do Doador por completar a ação
        const doador = await Usuario.findById(doacao.doador_id);
        if (doador) {
            doador.reputacao = Math.min(5, doador.reputacao + 0.1);
            await doador.save();
        }

        res.status(200).json({ message: "Coleta confirmada com sucesso! Reputações atualizadas." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao confirmar coleta.", detalhes: error.message });
    }
});

// 6. CANCELAR RESERVA (POST /api/doacoes/:id/cancelar)
// Onda 2 - Reputação + Onda 3 - Liberação de Item
router.post('/:id/cancelar', async (req, res) => {
    try {
        const doacaoId = req.params.id;

        const doacao = await Doacao.findById(doacaoId);
        if (!doacao) {
            return res.status(404).json({ error: "Doação não encontrada." });
        }

        if (doacao.status_reserva !== 'RESERVADA') {
            return res.status(400).json({ error: "Esta doação não está sob reserva." });
        }

        // Busca a reserva pendente
        const reserva = await Reserva.findOne({ doacao_id: doacaoId, status: 'PENDENTE' });
        if (!reserva) {
            return res.status(404).json({ error: "Reserva correspondente não encontrada." });
        }

        // Restaura a doação para disponível
        doacao.status_reserva = 'DISPONIVEL';
        await doacao.save();

        reserva.status = 'CANCELADA';
        await reserva.save();

        // Penalidade: Reduz reputação da ONG por cancelamento/desistência (limite mínimo de 1 estrela)
        const ong = await Usuario.findById(reserva.ong_id);
        if (ong) {
            ong.reputacao = Math.max(1, ong.reputacao - 0.5);
            await ong.save();
        }

        res.status(200).json({ message: "Reserva cancelada. O alimento está disponível novamente." });
    } catch (error) {
        res.status(500).json({ error: "Erro ao cancelar reserva.", detalhes: error.message });
    }
});

module.exports = router;
