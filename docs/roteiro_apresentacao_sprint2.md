# Roteiro de Apresentação: Review da Sprint 2 (Onda 1)

Este roteiro foi elaborado para ajudar você a apresentar o projeto **Alimenta+** de forma clara, profissional e alinhada aos conceitos de **Clean Code** e **Design Patterns** (Padrões de Projeto).

---

## 🎤 Introdução (Abertura)
> *"Boa tarde, professor e colegas. Hoje vou apresentar a entrega da Sprint 2 - Onda 1 do Alimenta+, que consistiu na implementação do fluxo de cadastro integrado do usuário (Doador ou ONG) com preenchimento automático por CEP, identificação de usuários por CPF/CNPJ para autenticidade do perfil, validação de termos de segurança jurídica de acordo com a Lei 14.016/2020 e a persistência dos dados em nuvem no MongoDB Atlas."*

---

## 📂 1. Estruturação do Projeto (Organização e Responsabilidades)
> *"Para começar, estruturamos o projeto separando fisicamente o Frontend do Backend. Essa separação garante o acoplamento fraco (onde as partes não dependem diretamente uma da outra) e alta coesão."*

*   **Mostre as pastas no VS Code ou slide:**
    *   **`/frontend`:** Focado na interface com o usuário (Vue.js 3).
    *   **`/backend`:** Focado nas regras de negócio, validações e comunicação com o banco (Node.js e Express).
    *   **`/backend/src/models`:** Contém o arquivo `Usuario.js` que modela o banco.
    *   **`/backend/src/routes`:** Contém o arquivo `usuarios.js` que define os endpoints (rotas da API).

---

## 🖥️ 2. O Frontend (Interface e Integração)
> *"No Frontend, criamos o componente `CadastroUsuario.vue` utilizando Vue 3. Nele, destaco três pontos principais:"*

1.  **Reatividade com Composition API (`ref`):** 
    > *"Usamos o `ref` do Vue para criar um formulário inteligente. A tela e as variáveis do JavaScript estão conectadas em tempo real. Se o usuário digita, a variável muda automaticamente. Isso inclui a adição do campo de CPF/CNPJ (documento) e complemento de endereço no estado do formulário."*
2.  **Consumo de API Externa (ViaCEP):**
    > *"Implementamos a função `buscarCep` que faz uma chamada assíncrona à API pública do ViaCEP. Quando o usuário digita 8 números e sai do campo (evento blur), preenchemos os campos 'Bairro' e 'Rua' automaticamente, melhorando a experiência do usuário e evitando digitação incorreta."*
3.  **Segurança Jurídica (Modal de Termos):**
    > *"Criamos um Modal elegante com Glassmorphism que exibe as responsabilidades de doadores e ONGs sob a **Lei 14.016/2020**. Resolvemos um desafio importante aqui: o link que abre o modal está dentro da frase do checkbox, mas programamos para que o clique no link apenas abra a janela e não desmarque o checkbox acidentalmente."*

---

## ⚙️ 3. O Backend (Regras de Negócio e Banco de Dados)
> *"No Backend, criamos uma API RESTful utilizando Node.js e Express. Aqui a segurança e a validação acontecem:"*

1.  **O Modelo Mongoose (`Usuario.js`):**
    > *"Criamos o Schema que define o que é aceito no MongoDB. Campos cruciais como `nome`, `documento` (CPF ou CNPJ para fins de identificação e autenticidade), `tipo_perfil` (que só aceita 'DOADOR' ou 'ONG') e `aceitou_termo_juridico` são obrigatórios. O banco rejeita qualquer cadastro que não siga essa regra. O endereço agora também conta com o campo de complemento."*
2.  **A Rota de Cadastro (`usuarios.js`):**
    > *"Criamos a rota `POST /api/usuarios`. Nela, fazemos a dupla validação jurídica: mesmo que um usuário mal-intencionado desative o checkbox no frontend através do inspecionar elemento, o nosso backend verifica o campo `aceitou_termo_juridico`. Se for falso, o servidor responde com código `400 Bad Request` e barra o cadastro."*
3.  **O Pulo do Gato - Conectividade de Rede:**
    > *"Durante os testes de integração, enfrentamos erros de DNS ao conectar no MongoDB Atlas. Resolvemos isso inserindo servidores DNS externos estáveis da Cloudflare e Google (1.1.1.1 e 8.8.8.8) diretamente no `server.js` do Node, garantindo que o servidor conecte ao banco mesmo em redes instáveis de faculdade."*

---

## 🔄 4. Demonstração de Fluxo (Do clique ao Banco)
*   **Faça um cadastro de teste na tela:**
    > *"Vou demonstrar agora. Preencho com o nome 'Supermercado Exemplo', seleciono 'Doador', digito o CNPJ no novo campo de identificação, coloco o CEP '20020-010', e o endereço é preenchido automaticamente, restando apenas preencher o número e o complemento opcional. Clico em ler os termos, fecho, marco a caixinha e clico em cadastrar."*
    > *"Nesse instante, o Vue fez um POST enviando um JSON com as informações. O backend validou o documento e o aceite dos termos jurídicos, acionou o Mongoose e salvou na nuvem do MongoDB Atlas. A API retornou status `201 Created` e a tela exibiu o alerta de sucesso limpando todos os campos."*

---

## 🛠️ 5. Conexão com o Tema da Aula: Clean Code e Design Patterns
> *"Como o tema da nossa aula hoje é Clean Code e Padrões de Projeto, destaco como aplicamos esses conceitos na nossa entrega:"*

### Padrões de Projeto (Design Patterns) aplicados:
1.  **Singleton Pattern (Instância do Mongoose):** 
    > *"A conexão com o banco de dados MongoDB Atlas é estabelecida uma única vez no `server.js` pelo Mongoose. Todas as operações de salvamento reutilizam essa mesma conexão aberta, poupando memória e banda de rede."*
2.  **Router Pattern (Roteador do Express):**
    > *"Em vez de colocar todas as URLs do site no mesmo arquivo `server.js`, separamos as rotas de usuários em `src/routes/usuarios.js`. O `server.js` apenas delega as chamadas da rota `/api/usuarios` para o roteador específico, organizando o código."*

### Boas Práticas de Clean Code aplicadas:
*   **Separação de Responsabilidades (SRP - Single Responsibility Principle):**
    > *"O componente Vue só cuida da interface; a rota Express só trata as requisições web; e o model do Mongoose cuida exclusivamente da validação do banco."*
*   **Funções Assíncronas Limpas (`Async/Await`):**
    > *"Substituímos o modelo antigo de 'callbacks' (que gerava o temido callback hell) por funções assíncronas usando `async/await` com blocos `try/catch`. Isso deixa o código legível, parecendo sequencial, facilitando a manutenção futura."*
*   **Nomes Autoexplicativos:**
    > *"As variáveis reativas (`exibirModalTermos`, `form`) e os campos do banco de dados possuem nomes explícitos, eliminando a necessidade de comentários redundantes para explicar o óbvio."*

---

## 🏁 Conclusão
> *"Com isso, fechamos a Onda 1 da Sprint 2 com um código limpo, padronizado, seguro juridicamente e 100% integrado. Estamos prontos para iniciar o planejamento da Sprint 3. Fico à disposição para dúvidas."*
