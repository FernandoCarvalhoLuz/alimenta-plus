// 1. Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config();

// Força o Node.js a priorizar a resolução de DNS IPv4 (corrige o erro querySrv ECONNREFUSED do MongoDB Atlas)
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
    console.warn('Não foi possível definir os servidores DNS personalizados, usando os do sistema.');
}

// 2. Importações de dependências
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Importa o Mongoose para conexão com o BD

const app = express();

// 3. Middlewares Globais
app.use(cors()); // Permite que a tela do Vue (porta 8080) se comunique com este servidor (porta 3000)
app.use(express.json({ limit: '10mb' })); // Configura o Express para entender dados enviados em formato JSON e aceitar payloads maiores (Base64)

// 4. Conexão com o MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('Conexão estabelecida com o MongoDB Atlas com sucesso!'))
    .catch((error) => console.error('Falha ao conectar com o MongoDB Atlas:', error.message));

// 5. Registro das Rotas da API
const usuariosRouter = require('./src/routes/usuarios'); // Importa o roteador que criamos há pouco
const doacoesRouter = require('./src/routes/doacoes'); // Importa o roteador de doações
app.use('/api/usuarios', usuariosRouter); // Diz que todo endpoint de usuários começa com /api/usuarios
app.use('/api/doacoes', doacoesRouter); // Diz que todo endpoint de doações começa com /api/doacoes

// 6. Rota Base para Testes
app.get('/', (req, res) => {
    res.json({ message: 'API do Alimenta+ está rodando com sucesso!' });
});

// 7. Inicialização do Servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
