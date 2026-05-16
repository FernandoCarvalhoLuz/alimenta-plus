# Alimenta+ (ODS 2 - Fome Zero)
Repositório oficial do MVP do Alimenta+, plataforma que conecta estabelecimentos com excedentes a ONGs.

## 🗂️ Estrutura do Projeto
- `/frontend` - Interface Vue.js (SPA)
- `/backend` - API Node.js/Express
- `/banco_de_dados` - Scripts de Inicialização do MongoDB
- `/docs` - Diagramas, Histórias de Usuário e Lean Inception

## 🚀 Como rodar a aplicação

### 1. Banco de Dados (MongoDB Atlas - Cloud)
Nosso banco de dados está hospedado na nuvem (Serverless) utilizando o **MongoDB Atlas**. 
Essa decisão arquitetural permite que qualquer membro da equipe rode o projeto sem precisar instalar bancos de dados localmente.

Para popular ou resetar os dados iniciais do MVP, conecte-se ao nosso cluster e rode o script:
```bash
# 1. Conecte-se ao Cluster remotamente
mongosh "mongodb+srv://cluster0.gjuql2v.mongodb.net/" --apiVersion 1 --username fernando_db_user

# 2. Quando estiver no terminal do Atlas, execute:
load("banco_de_dados/seed.js")
```
*(Nota: A senha do banco de dados deve ser solicitada à equipe ou configurada via arquivo `.env` na próxima Sprint).*

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
