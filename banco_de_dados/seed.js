use alimentaplus_db;

// Limpando coleções para garantir que o script rode limpo todas as vezes
db.usuarios.drop();
db.doacoes.drop();

// Inserindo o Doador (Ricardo) - Representando o Estabelecimento
db.usuarios.insertOne({
    nome: "Ricardo",
    tipo_perfil: "DOADOR",
    empresa: "Supermercado de Bairro",
    aceitou_termo_juridico: true,
    reputacao: 5,
    endereco: { cep: "20000-000", bairro: "Centro" },
    data_cadastro: new Date()
});

let ricardo = db.usuarios.findOne({ nome: "Ricardo" });

// Inserindo a ONG (Sandra) - Representando o Receptor
db.usuarios.insertOne({
    nome: "Sandra",
    tipo_perfil: "ONG",
    empresa: "Cozinha Comunitária",
    aceitou_termo_juridico: true,
    reputacao: 5,
    endereco: { cep: "20010-000", bairro: "Lapa" },
    data_cadastro: new Date()
});

// Inserindo o Cadastro Expresso de Alimento feito pelo Ricardo
db.doacoes.insertOne({
    doador_id: ricardo._id,
    titulo: "Lote de Proteínas - Vencimento Próximo",
    categoria: "Proteínas",
    quantidade: "5kg",
    status_reserva: "DISPONIVEL",
    ong_reservou_id: null,
    data_criacao: new Date()
});

print("Banco populado com sucesso! Usuários (Ricardo e Sandra) e Doação criados.");
