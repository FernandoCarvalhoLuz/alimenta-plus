# Roteiro de Apresentação Acadêmica - Sprint 1 (Alimenta+)

Este documento serve como um guia rápido para conduzir a explicação do projeto Alimenta+ em sala de aula, demonstrar a estrutura de arquivos e o banco de dados, além de fornecer o passo a passo exato para executar o projeto nos computadores da faculdade.

---

## 🧭 PARTE 1: Roteiro da Explicação (O que falar para a turma)

### 1. Abertura e ODS (O Contexto)
*   **O que falar:** *"O Alimenta+ é uma plataforma voltada para solucionar o desperdício de alimentos de estabelecimentos comerciais (doadores) conectando-os a ONGs que distribuem refeições para pessoas em vulnerabilidade social. O projeto está diretamente ligado aos Objetivos de Desenvolvimento Sustentável da ONU: **ODS 2 (Fome Zero)** e **ODS 12 (Consumo e Produção Responsáveis)**."*

### 2. A Escolha da Stack MEVN (A Engenharia)
*   **O que falar:** *"Para dar vida ao MVP, optamos pela arquitetura **MEVN** (MongoDB, Express, Vue.js e Node.js). A grande vantagem é que usamos JavaScript de ponta a ponta (tanto nas telas quanto no servidor), o que acelera o desenvolvimento e facilita a manutenção do código."*

### 3. Modelagem de Dados Normalizada
*   **O que falar:** *"Apesar de utilizarmos o MongoDB (um banco NoSQL orientado a documentos), desenhamos um **Modelo Entidade-Relacionamento lógico em Pé de Galinha**. Nele, criamos a tabela de junção `RESERVA` que conecta `USUARIO` e `DOACAO` por meio de referências (ponteiros/Chaves Estrangeiras), garantindo um controle transacional seguro das coletas de comida."*

---

## 📂 PARTE 2: Como Mostrar a Estrutura (A Anatomia do Projeto)

Abra o **VS Code** na máquina da faculdade e siga esta sequência de demonstração visual:

```
AlimentaPlus/
├── backend/            <-- Explique: "Aqui roda nossa API Express.js. Gerencia as rotas e regras de negócio."
│   ├── src/
│   │   ├── models/     <-- Destaque: "Aqui definimos os esquemas de dados (Doacao, Usuario, Reserva) usando Mongoose."
│   │   └── server.js   <-- Destaque: "O arquivo principal que inicia nossa API na porta 3000."
│   └── package.json    <-- Explique: "Lista as dependências do servidor (express, mongoose)."
│
├── frontend/           <-- Explique: "Aqui roda a interface web em Vue.js para o Doador e a ONG."
│   └── package.json    <-- Explique: "Lista as dependências da interface."
│
├── banco_de_dados/     <-- Explique: "Nossos scripts de carga inicial de banco."
│   └── seed.js         <-- Destaque: "Script de seed que popula automaticamente o banco na nuvem com dados de teste."
│
└── docs/               <-- Explique: "Toda a documentação exigida."
    ├── apresentacao_sprint1.html
    ├── diagrama_arquitetura_mevn_alimenta_plus.html
    └── diagrama_er_pe_de_galinha.html
```

### O que mostrar no MongoDB Atlas (Web)
*   Abra o navegador no site do Atlas e mostre a coleção de `usuarios` (com o Ricardo e a Sandra criados) e a de `doacoes`. 
*   **Argumento de peso:** Diga ao professor que o banco de dados está rodando **totalmente na nuvem (Atlas Serverless)**, o que dispensa a necessidade de instalar instâncias locais de bancos de dados nas máquinas dos desenvolvedores e da própria faculdade.

---

## 💻 PARTE 3: Guia de Execução (Passo a Passo na Faculdade)

Se o professor pedir para rodar o projeto na hora, execute estes passos exatamente nesta ordem:

### Pré-requisitos Rápidos
> [!NOTE]
> Certifique-se de que a máquina da faculdade tenha o **Node.js** instalado (digite `node -v` no terminal para verificar).

### Passo 1: Abrir o Terminal no VS Code
Abra a pasta do projeto no VS Code e abra o terminal (Atalho: `Ctrl + '` ou vá em *Terminal -> New Terminal*).

### Passo 2: Inicializar o Servidor (Backend)
No terminal do VS Code, execute:
```powershell
# 1. Navegue até a pasta do backend
cd AlimentaPlus/backend

# 2. Instale as dependências (baixa as bibliotecas da internet)
npm install

# 3. Inicie o servidor em modo de desenvolvimento
npm run dev
```
*(Você verá a mensagem informando que o servidor está rodando na porta 3000).*

### Passo 3: Inicializar a Interface (Frontend)
Abra um **segundo terminal** no VS Code (clique no ícone de `+` no painel do terminal) e execute:
```powershell
# 1. Navegue até a pasta do frontend
cd AlimentaPlus/frontend

# 2. Instale as dependências da interface
npm install

# 3. Inicie o servidor do Vue.js
npm run serve
```
*(O Vite iniciará o frontend e fornecerá um link local, geralmente `http://localhost:8080` ou `http://localhost:5173`. Clique no link com `Ctrl + Clique` para abrir a aplicação no navegador).*

### Passo 4: Atualizar/Seed o Banco (Se necessário)
Caso queira demonstrar o banco limpando e populando na hora para o professor:
1. Abra um terminal do sistema (PowerShell) e execute a conexão:
   ```bash
   mongosh "mongodb+srv://cluster0.gjuql2v.mongodb.net/" --apiVersion 1 --username fernando_db_user
   ```
2. Digite a senha quando solicitada.
3. Dentro do mongosh, execute:
   ```javascript
   load("AlimentaPlus/banco_de_dados/seed.js")
   ```
