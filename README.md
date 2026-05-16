# Alimenta+ (ODS 2 - Fome Zero)
Repositório oficial do MVP do Alimenta+, plataforma que conecta estabelecimentos com excedentes a ONGs.

## 🗂️ Estrutura do Projeto
- `/frontend` - Interface Vue.js (SPA)
- `/backend` - API Node.js/Express
- `/banco_de_dados` - Scripts de Inicialização do MongoDB
- `/docs` - Diagramas, Histórias de Usuário e Lean Inception

## 🚀 Como rodar a aplicação

### 1. Banco de Dados (MongoDB)
Certifique-se de ter o MongoDB rodando localmente na porta `27017`.
Para popular os dados iniciais do MVP, execute o script:
```bash
mongosh < banco_de_dados/seed.js
```

### 2. Rodando a API (Backend)
```bash
cd backend
npm install
npm run dev
```
A API rodará em `http://localhost:3000`

### 3. Rodando o Frontend
```bash
cd frontend
npm install
npm run serve
```
Acesse em `http://localhost:8080`
