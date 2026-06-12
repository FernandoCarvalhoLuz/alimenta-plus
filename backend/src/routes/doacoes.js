// 1. Importações Necessárias
const express = require('express');
const router = express.Router();
const Doacao = require('../models/Doacao'); // Importa o modelo Mongoose de Doação
const Usuario = require('../models/Usuario'); // Importa o modelo Mongoose de Usuário para validação

// 2. Rota para Cadastrar uma nova Doação (POST /api/doacoes)
// Essa rota será chamada pelo frontend (Vue) quando o doador enviar o formulário expresso.
router.post('/', async (req, res) => {
    try {
        // Desestrutura os campos enviados no corpo (body) da requisição
        const { doador_id, titulo, categoria, quantidade, instrucoes_retirada } = req.body;

        // VALIDAÇÕES BÁSICAS
        if (!doador_id) {
            return res.status(400).json({ error: "É obrigatório fornecer o ID do doador." });
        }
        if (!titulo || !categoria || !quantidade || !instrucoes_retirada) {
            return res.status(400).json({ error: "Todos os campos (Título, Categoria, Quantidade e Instruções) são obrigatórios." });
        }

        // VALIDAÇÃO DE USUÁRIO
        // Verifica se o usuário (doador) realmente existe no banco de dados
        const doador = await Usuario.findById(doador_id);
        if (!doador) {
            return res.status(404).json({ error: "Doador não encontrado em nossa base de dados." });
        }

        // Verifica se o perfil do usuário é realmente de DOADOR
        if (doador.tipo_perfil !== 'DOADOR') {
            return res.status(403).json({ error: "Apenas usuários com perfil de DOADOR podem cadastrar alimentos." });
        }

        // 3. Criando o documento do Mongoose com as informações validadas
        const novaDoacao = new Doacao({
            doador_id,
            titulo,
            categoria,
            quantidade,
            instrucoes_retirada,
            status_reserva: 'DISPONIVEL' // Começa sempre como disponível para retirada
        });

        // 4. Salva a nova doação física no MongoDB Atlas
        await novaDoacao.save();

        // 5. Retorna status de sucesso 201 (Created) com os dados da doação criada
        res.status(201).json({
            message: "Doação cadastrada com sucesso!",
            doacao: novaDoacao
        });

    } catch (error) {
        // Captura falhas inesperadas (ex: ID malformado ou queda de conexão)
        res.status(500).json({
            error: "Erro interno ao processar o cadastro da doação.",
            detalhes: error.message
        });
    }
});

// 3. Rota para Listar todas as Doações Disponíveis (GET /api/doacoes)
// Esta rota será útil para listar o feed de doações na tela da ONG.
router.get('/', async (req, res) => {
    try {
        // Busca todas as doações com status DISPONIVEL e faz um "populate" para trazer
        // os dados do doador (nome, empresa, etc.) em vez de apenas o ID.
        const doacoes = await Doacao.find({ status_reserva: 'DISPONIVEL' })
                                    .populate('doador_id', 'nome empresa endereco');
        
        res.status(200).json(doacoes);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao listar doações disponíveis.",
            detalhes: error.message
        });
    }
});

module.exports = router;
