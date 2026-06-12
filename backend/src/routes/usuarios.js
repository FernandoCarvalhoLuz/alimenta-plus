// 1. Importações Necessárias
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Importa o esquema de dados do Usuário

// 2. Rota de Criação de Usuário (POST)
// O Express vai direcionar requisições POST para esta função.
// Usamos "async" porque salvar no banco de dados na nuvem é uma operação que demora (assíncrona).
router.post('/', async (req, res) => {
    try {
        // Desestrutura os dados enviados pela tela do Vue (que chegam no "body" da requisição)
        const { nome, tipo_perfil, empresa, documento, aceitou_termo_juridico, endereco } = req.body;

        // VALIDAÇÃO BÁSICA
        if (!documento) {
            return res.status(400).json({ error: "O CPF ou CNPJ (documento) é obrigatório para identificação." });
        }

        // Limpa o documento removendo qualquer caractere não numérico (pontos, traços, barras)
        const documentoLimpo = documento.toString().replace(/\D/g, '');

        if (documentoLimpo.length !== 11 && documentoLimpo.length !== 14) {
            return res.status(400).json({ error: "O documento deve possuir exatamente 11 dígitos (CPF) ou 14 dígitos (CNPJ)." });
        }

        // VALIDAÇÃO JURÍDICA (Requisito da Onda 1)
        // Se a pessoa desativou o checkbox burlado a tela, o servidor barra aqui
        if (!aceitou_termo_juridico) {
            return res.status(400).json({ error: "É obrigatório aceitar o Termo de Segurança Jurídica." });
        }

        // 3. Criando o documento do Mongoose com os dados validados
        const novoUsuario = new Usuario({
            nome,
            tipo_perfil,
            empresa,
            documento: documentoLimpo, // Salvamos o documento 100% limpo no banco
            aceitou_termo_juridico,
            endereco
        });

        // 4. Salvando fisicamente no MongoDB Atlas na nuvem
        // O "await" faz o Node esperar a nuvem confirmar que salvou para poder continuar
        await novoUsuario.save();

        // 5. Retorna sucesso para o Vue com o status 201 (Created / Criado com sucesso)
        res.status(201).json({ 
            message: "Usuário cadastrado com sucesso!", 
            usuario: novoUsuario 
        });

    } catch (error) {
        // Se houver qualquer falha (ex: campo obrigatório faltando ou sem internet), cai no catch
        res.status(500).json({ 
            error: "Erro interno ao cadastrar usuário.", 
            detalhes: error.message 
        });
    }
});

// 3. Rota para Listar todos os Usuários (GET /api/usuarios)
// Útil para selecionar doadores de teste no frontend e listar participantes.
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.find({});
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({
            error: "Erro ao listar usuários.",
            detalhes: error.message
        });
    }
});

// 4. Rota de Login por Documento (POST /api/usuarios/login)
router.post('/login', async (req, res) => {
    try {
        const { documento } = req.body;
        if (!documento) {
            return res.status(400).json({ error: "O CPF ou CNPJ é obrigatório para realizar login." });
        }
        
        // Remove caracteres especiais para buscar correspondência exata
        const documentoLimpo = documento.toString().replace(/\D/g, '');
        const usuario = await Usuario.findOne({ documento: documentoLimpo });
        
        if (!usuario) {
            return res.status(404).json({ error: "Nenhum usuário cadastrado encontrado com este documento." });
        }
        
        res.status(200).json({
            message: "Login realizado com sucesso!",
            usuario
        });
    } catch (error) {
        res.status(500).json({
            error: "Erro ao autenticar usuário.",
            detalhes: error.message
        });
    }
});

// 6. Exportação do Roteador
module.exports = router;
