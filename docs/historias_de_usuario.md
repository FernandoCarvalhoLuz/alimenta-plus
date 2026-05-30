# Histórias de Usuário (MVP) - Sprint 1

Baseado nas Personas (Ricardo e Sandra) e nas Ondas de priorização do Canvas MVP.

### Onda 1: Cadastro Integrado de Usuários e Segurança Jurídica
1. **COMO** Doador (Ricardo) ou Receptora de ONG (Sandra),
   **QUERO** me cadastrar na plataforma informando meus dados corporativos/pessoais e endereço,
   **PARA QUE** eu possa ter acesso à plataforma com responsabilidade legal resguardada.

   **Critérios de Aceite:**
   * **[Identificação]** É obrigatório fornecer um documento de identificação (CPF ou CNPJ). O campo de entrada deve aplicar uma máscara de digitação em tempo real (`000.000.000-00` ou `00.000.000/0000-00`).
   * **[Sanitização no Banco]** O documento de identificação deve ser limpo de caracteres especiais (sem traços, pontos ou barras) tanto no envio do frontend quanto na validação do backend antes de persistir no banco de dados.
   * **[Dupla Validação]** O backend deve verificar e recusar documentos que não contenham exatamente 11 (CPF) ou 14 (CNPJ) caracteres numéricos.
   * **[Termo Jurídico]** O cadastro só pode ser concluído se o usuário aceitar explicitamente o Termo de Segurança Jurídica e Responsabilidade (amparado pela Lei nº 14.016/2020), que deve ser exibido em um modal flutuante moderno na interface.
   * **[Integração ViaCEP]** O sistema deve buscar e preencher de forma automática a Rua (Logradouro) e o Bairro assim que um CEP válido de 8 dígitos for digitado e o campo perder o foco (evento blur).
   * **[Detalhamento de Endereço]** O formulário deve disponibilizar campos para número e complemento de endereço (opcional), assegurando precisão logística para coletas e entregas.

### Onda 2
2. **COMO** Doador (Ricardo), **POSSO** utilizar o "Cadastro Expresso" para registrar um pacote de alimentos em poucos cliques **PARA** disponibilizar a doação rapidamente antes do fechamento da loja.

### Onda 3
3. **COMO** Receptora de ONG (Sandra), **POSSO** usar o sistema de reservas **PARA** garantir o alimento e evitar que duas ONGs viagem para buscar a mesma doação.
4. **COMO** gestor da plataforma, **POSSO** visualizar relatórios simples de oferta e demanda **PARA** medir o volume de doações e o impacto do projeto na comunidade.

### Onda 5 (Filtros)
5. **COMO** Receptora de ONG (Sandra), **POSSO** usar filtros inteligentes de categoria (ex: proteína, hortifrúti) e proximidade no Feed **PARA** focar nas doações que realmente atendem ao meu cardápio diário.
