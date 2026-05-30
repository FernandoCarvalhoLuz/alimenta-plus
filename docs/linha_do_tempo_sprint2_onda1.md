# Linha do Tempo e Guia Didático: Sprint 2 - Onda 1 (Cadastro de Usuário)

Este documento foi criado para ajudar você a entender **tudo** o que construímos nesta etapa do projeto **Alimenta+**. Aqui você encontrará a ordem cronológica do que foi feito, onde estão os arquivos, o que cada linha de código faz e como os dados viajam da tela do computador até o banco de dados na nuvem.

---

## 🍽️ A Metáfora do Restaurante (Como a Web Funciona)
Para facilitar, imagine o sistema como um restaurante:
*   **O Frontend (Tela do Vue):** É o **Garçom**. Ele recolhe o pedido do cliente (dados do formulário) e leva até a cozinha.
*   **O Backend (Servidor Node/Express):** É o **Chef de Cozinha**. Ele recebe o pedido, confere as regras de higiene e segurança (validações) e prepara o prato.
*   **O Banco de Dados (MongoDB Atlas):** É a **Despensa**. Onde os ingredientes (dados) são guardados de forma organizada para não estragarem.

---

## 📅 Linha do Tempo da Construção (O Passo a Passo)

### 1. Modelagem do Banco (A Despensa)
*   **O que fizemos:** Criamos o arquivo `backend/src/models/Usuario.js`.
*   **O que ele faz:** Define a estrutura do usuário no banco (Nome, Perfil, Empresa, Aceite do Termo Jurídico e Endereço).

### 2. Criação do Formulário Moderno (O Garçom)
*   **O que fizemos:** Criamos o componente `frontend/src/components/CadastroUsuario.vue`.
*   **O que ele faz:** Desenha a tela bonita em Dark Mode com Glassmorphism, conecta com a API pública do ViaCEP para preencher a rua pelo CEP automaticamente e gerencia o clique de cadastro.

### 3. Criação do Modal de Termos Jurídicos (O Contrato)
*   **O que fizemos:** Adicionamos um popup interativo baseado na **Lei nº 14.016/2020** (a lei brasileira de doação de alimentos) dentro da tela de cadastro.
*   **O que ele faz:** O usuário clica e abre uma janela elegante por cima da tela explicando quem é responsável pelo que (Ricardo Doador ou Sandra ONG).

### 4. Criação da Rota do Servidor (A Receita do Chef)
*   **O que fizemos:** Criamos o arquivo `backend/src/routes/usuarios.js`.
*   **O que ele faz:** Cria o canal de comunicação (`POST /api/usuarios`) que o Vue usa para enviar os dados. Ele verifica se o usuário aceitou os termos e salva no banco se tudo estiver correto.

### 5. Ajustes de Conectividade e DNS (Os Canos da Cozinha)
*   **O que fizemos:** Configuramos o arquivo `.env` para esconder a senha do banco de dados e adicionamos um resolvedor de DNS no `backend/server.js`.
*   **O que ele faz:** Garante que o Node consiga se conectar ao MongoDB Atlas na nuvem sem travar por problemas de operadora de internet (IPv6 vs IPv4).

---

## 📂 Mapa de Pastas e Arquivos

Aqui está onde cada peça do que criamos está guardada:

```text
Projeto A4/
└── AlimentaPlus/
    ├── docs/
    │   └── linha_do_tempo_sprint2_onda1.md    <-- Este guia didático!
    ├── backend/
    │   ├── .env                               <-- Guarda sua senha secreta do MongoDB
    │   ├── server.js                          <-- Arquivo principal que liga o servidor Node
    │   └── src/
    │       ├── models/
    │       │   └── Usuario.js                 <-- Define como o usuário é salvo no banco (Schema)
    │       └── routes/
    │           └── usuarios.js                <-- Rota que recebe os dados do Vue e os valida
    └── frontend/
        └── src/
            ├── App.vue                        <-- Junta todas as telas do Vue
            └── components/
                └── CadastroUsuario.vue        <-- O formulário de cadastro e modal de termos
```

---

## 🔄 Fluxo de Dados Ponta a Ponta: Como o Dado Viaja?

Aqui está a sequência exata de eventos quando você clica em cadastrar:

1. **Digitar o CEP:** Você digita o CEP no formulário e clica fora (ou dá Tab).
2. **ViaCEP busca endereço:** O Vue faz um pedido para a API do ViaCEP na internet. Se encontrar o endereço, preenche as caixas de texto "Rua" e "Bairro" automaticamente.
3. **Aceitar os Termos:** Você clica nos "Termos de Segurança Jurídica", lê no popup as leis de responsabilidade (Lei nº 14.016/2020) e fecha o modal. Depois, marca o checkbox.
4. **Enviar os dados:** Você clica em "Criar Minha Conta". O Vue pega todos os dados digitados e envia um pacote no formato JSON para a internet com destino ao endereço do seu backend (`http://localhost:3000/api/usuarios`).
5. **Servidor recebe e valida:** O backend (Node/Express) recebe o pacote. Ele confere: *"O usuário marcou o Termo Jurídico?"*. Se sim, ele monta uma estrutura Mongoose e fala para o banco: *"Banco, salve esse novo usuário para mim"*.
6. **Banco Atlas salva na Nuvem:** O banco de dados grava as informações de forma permanente no cluster que está na nuvem (MongoDB Atlas).
7. **Feedback visual:** O banco confirma o sucesso para o backend. O backend responde com o status `201` para o Vue. O Vue, ao ver o sucesso, solta o alerta na sua tela: **`Conta criada com sucesso!`** e limpa todas as caixas de texto do formulário.

---

## 🔎 Entendendo o Código Didaticamente

### 1. O Banco de Dados (`backend/src/models/Usuario.js`)
Pense nesse arquivo como o **formulário de papel** que o banco de dados exige. Se o dado não seguir essa estrutura, o banco joga fora:

```javascript
const mongoose = require('mongoose');

// Criamos uma regra de validação chamada "Schema"
const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true }, // Tem que ser texto e é obrigatório
    tipo_perfil: { type: String, enum: ['DOADOR', 'ONG'], required: true }, // Só aceita essas duas opções
    empresa: { type: String, required: true },
    documento: { type: String, required: true }, // CPF ou CNPJ para identificação do usuário
    aceitou_termo_juridico: { type: Boolean, required: true }, // Obrigatório ser True ou False (aceitou ou não)
    reputacao: { type: Number, default: 5 }, // Se ninguém definir, começa com nota 5
    endereco: {
        cep: String,
        bairro: String,
        logradouro: String,
        numero: String,
        complemento: String // Campo opcional de complemento
    },
    data_cadastro: { type: Date, default: Date.now } // Grava a data e hora do momento exato do clique
});

// Transforma esse papel em um "Modelo" ativo do banco e exporta
module.exports = mongoose.model('Usuario', usuarioSchema);
```

### 2. A Rota do Servidor (`backend/src/routes/usuarios.js`)
O roteador funciona como os atendentes de um guichê. Cada guichê atende uma coisa diferente:

```javascript
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario'); // Puxa o formulário de papel que criamos acima

// Quando alguém chamar esse arquivo enviando dados via POST (ou seja, criando algo):
router.post('/', async (req, res) => {
    try {
        // Pega as informações empacotadas enviadas pela tela do Vue
        const { nome, tipo_perfil, empresa, documento, aceitou_termo_juridico, endereco } = req.body;

        // VALIDAÇÃO BÁSICA
        if (!documento) {
            return res.status(400).json({ error: "O CPF ou CNPJ (documento) é obrigatório." });
        }

        // Limpa o documento removendo qualquer caractere não numérico (pontos, traços, barras)
        const documentoLimpo = documento.toString().replace(/\D/g, '');

        if (documentoLimpo.length !== 11 && documentoLimpo.length !== 14) {
            return res.status(400).json({ error: "O documento deve possuir exatamente 11 dígitos (CPF) ou 14 dígitos (CNPJ)." });
        }

        // VALIDAÇÃO JURÍDICA JÁ NO SERVIDOR
        if (!aceitou_termo_juridico) {
            return res.status(400).json({ error: "É obrigatório aceitar o Termo de Segurança Jurídica." });
        }

        // Cria o registro baseado na regra do Schema do banco
        const novoUsuario = new Usuario({
            nome,
            tipo_perfil,
            empresa,
            documento: documentoLimpo, // Salva o documento limpo (somente números)
            aceitou_termo_juridico,
            endereco
        });

        // Grava no MongoDB Atlas na nuvem e espera concluir (await)
        await novoUsuario.save();

        // Responde de volta para o Vue: "Deu tudo certo! Aqui está o usuário cadastrado"
        res.status(201).json({ 
            message: "Usuário cadastrado com sucesso!", 
            usuario: novoUsuario 
        });

    } catch (error) {
        // Se houver qualquer pane, responde para a tela o erro formatado
        res.status(500).json({ 
            error: "Erro interno ao cadastrar usuário.", 
            detalhes: error.message 
        });
    }
});

module.exports = router;
```

### 3. A Tela do Frontend (`frontend/src/components/CadastroUsuario.vue`)
Aqui a mágica acontece na tela do usuário. O Vue.js brilha usando variáveis reativas (que mudam de valor em tempo real na tela):

```javascript
// Usamos "ref" para criar variáveis inteligentes que a tela consegue monitorar
const form = ref({
  nome: '',
  tipo_perfil: 'DOADOR',
  empresa: '',
  documento: '', // Novo campo para CPF ou CNPJ
  aceitou_termo_juridico: false,
  endereco: { cep: '', bairro: '', logradouro: '', numero: '', complemento: '' }
});

const exibirModalTermos = ref(false); // Quando vira true, o CSS e HTML fazem o modal pular na tela!

// FUNÇÃO DO CEP AUTOMÁTICO
const buscarCep = async () => {
  const cep = form.value.endereco.cep.replace(/\D/g, ''); // Limpa traços e espaços, deixa só número
  if (cep.length !== 8) return; // Se não tiver 8 números, nem tenta buscar

  try {
    // Faz uma requisição para o serviço público gratuito da ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (!data.erro) {
      // Se achou, injeta a rua e bairro direto nas nossas variáveis reativas
      form.value.endereco.bairro = data.bairro;
      form.value.endereco.logradouro = data.logradouro;
    }
  } catch (e) {
    console.error("Erro ao buscar CEP");
  }
};

// FUNÇÃO DE CADASTRO
const cadastrar = async () => {
  try {
    // Cria uma cópia limpa removendo pontos/traços do documento antes do envio
    const payloadEnvio = {
      ...form.value,
      documento: form.value.documento.replace(/\D/g, '')
    };

    // Dispara as informações do formulário para o nosso servidor na porta 3000
    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadEnvio) // Converte as variáveis do Vue em texto puro (JSON)
    });

    const data = await response.json();

    if (response.ok) {
      // Se o backend retornou sucesso (201):
      alert("Conta criada com sucesso! " + data.message);
      
      // Reseta o formulário para limpar todos os campos da tela
      form.value = {
        nome: '',
        tipo_perfil: 'DOADOR',
        empresa: '',
        documento: '',
        aceitou_termo_juridico: false,
        endereco: { cep: '', bairro: '', logradouro: '', numero: '', complemento: '' }
      };
    } else {
      // Se o backend barrou o cadastro (ex: não aceitou o termo):
      alert("Erro ao cadastrar: " + (data.error || "Dados inválidos."));
    }
  } catch (error) {
    alert("Erro de conexão: Verifique se o servidor backend está ligado!");
  }
};
```

---

## 🏆 O Que Entregamos Nessa Aula/Sprint?
Você agora tem um **sistema funcional de Cadastro de Usuários integrado com a nuvem**:
1. O **Garçom** (Vue) coleta as informações validadas por CEP e exige o aceite do Termo Jurídico legal.
2. O **Chef** (Express) recebe as informações, inspeciona a segurança dos dados e se conecta à **Despensa** na Nuvem.
3. A **Despensa** (MongoDB Atlas) grava as credenciais de forma permanente na nuvem, prontas para as próximas sprints (como fazer login ou registrar doações!).
