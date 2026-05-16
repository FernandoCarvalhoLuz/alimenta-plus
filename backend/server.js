const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.json({ message: 'API do Alimenta+ está rodando com sucesso!' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
