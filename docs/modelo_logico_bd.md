# Modelo Lógico do Banco de Dados (MongoDB / Mongoose)

Para o projeto Alimenta+, utilizando um banco de dados NoSQL orientado a documentos (MongoDB), o modelo lógico não utiliza tabelas rígidas, mas sim a estrutura de **Coleções (Collections)** e **Documentos (JSON/BSON)**.

Abaixo está o modelo lógico das duas coleções principais que suportam o MVP (Ondas 1, 2 e 3):

## 1. Coleção `usuarios`
Esta coleção armazena tanto os doadores (estabelecimentos) quanto os receptores (ONGs), diferenciados pelo campo `tipo_perfil`.

```json
{
  "_id": "ObjectId (Gerado automaticamente pelo MongoDB)",
  "nome": "String (Nome do usuário, ex: Ricardo ou Sandra)",
  "tipo_perfil": "String (Restrito a: 'DOADOR' ou 'ONG')",
  "empresa": "String (Nome do estabelecimento ou da ONG)",
  "aceitou_termo_juridico": "Boolean (Obrigatório: true) - [Requisito Onda 1]",
  "reputacao": "Number (De 1 a 5) - [Requisito Onda 2]",
  "endereco": {
    "cep": "String (Será preenchido integrado com a API ViaCEP)",
    "bairro": "String",
    "logradouro": "String",
    "numero": "String"
  },
  "data_cadastro": "Date"
}
```

## 2. Coleção `doacoes`
Esta coleção armazena os pacotes de alimentos disponibilizados pelos doadores através do "Cadastro Expresso" e controla o fluxo de reservas feitas pelas ONGs.

```json
{
  "_id": "ObjectId (Gerado automaticamente pelo MongoDB)",
  "doador_id": "ObjectId (Referência direta ao _id da coleção 'usuarios')",
  "titulo": "String (Ex: 'Lote de Proteínas - Vencimento Próximo') - [Cadastro Expresso Onda 2]",
  "categoria": "String (Ex: 'Proteínas', 'Hortifrúti') - [Filtros Inteligentes Onda 5]",
  "quantidade": "String (Ex: '5kg' ou '20 Marmitas')",
  "status_reserva": "String (Restrito a: 'DISPONIVEL', 'RESERVADA', 'COLETADA') - [Sistemas de Reservas Onda 3]",
  "data_criacao": "Date"
}
```

## 3. Coleção `reservas` (Tabela de Junção)
Esta coleção armazena o histórico e o status das transações de reservas de alimentos efetuadas pelas ONGs.

```json
{
  "_id": "ObjectId (Gerado automaticamente pelo MongoDB)",
  "ong_id": "ObjectId (Referência ao _id da ONG na coleção 'usuarios')",
  "doacao_id": "ObjectId (Referência ao _id da doação na coleção 'doacoes')",
  "data_reserva": "Date",
  "status": "String (Restrito a: 'PENDENTE', 'CONFIRMADA', 'CONCLUIDA', 'CANCELADA')"
}
```

## Relacionamentos (Referências)
Em nosso modelo NoSQL, aplicamos o padrão de **Referências (References)** de forma normalizada para interligar as coleções:
- O campo `doador_id` na coleção `doacoes` aponta para o documento criador do anúncio na coleção `usuarios`.
- O campo `ong_id` na coleção `reservas` aponta para a ONG (coleção `usuarios`) que iniciou a reserva.
- O campo `doacao_id` na coleção `reservas` aponta para o item alimentício reservado (coleção `doacoes`).
