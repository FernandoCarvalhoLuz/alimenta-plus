# Histórias de Usuário e Critérios de Aceite (Roadmap) - Alimenta+

Este documento consolida as Histórias de Usuário e Critérios de Aceite para o Alimenta+ mapeados através da Inception Ágil, divididos em **5 Ondas de Desenvolvimento**.

---

### 🌊 Onda 1: Fundação e Conformidade
Focada em estabelecer a base segura de usuários e a conformidade jurídica exigida.

#### 1. Cadastro e Validação Jurídica de Usuários
* **COMO** Doador (Estabelecimento) ou Receptor (ONG),  
  **QUERO** me cadastrar no sistema informando meus dados de identificação e endereço,  
  **PARA QUE** eu possa operar com total segurança jurídica e conformidade regulatória.
* **Critérios de Aceite:**
  * **[Identificação com Máscara]** Campo obrigatório para CPF (11 dígitos) ou CNPJ (14 dígitos), com máscara dinâmica na interface (`000.000.000-00` ou `00.000.000/0000-00`).
  * **[Sanitização no Backend]** Toda pontuação e traço de CPF/CNPJ devem ser removidos e persistidos como caracteres numéricos puros no MongoDB.
  * **[Validação de Tamanho]** Recusa e aviso de erro se a entrada for diferente de 11 ou 14 dígitos brutos.
  * **[Segurança Jurídica]** O cadastro exige aceite obrigatório do Termo de Segurança Jurídica e Responsabilidade (amparado pela Lei nº 14.016/2020), exibido em um modal flutuante.
  * **[Integração ViaCEP]** O sistema preenche automaticamente Logradouro e Bairro ao digitar um CEP de 8 dígitos válido (evento *blur*).
  * **[Complemento de Endereço]** Fornecimento opcional de número e complemento para precisão logística.

---

### 🌊 Onda 2: Core Business e Acessibilidade
Implementação da funcionalidade principal de publicação de excedentes e inclusão social.

#### 2. Cadastro Expresso de Alimentos (Core)
* **COMO** Doador (Marcos/Ricardo),  
  **QUERO** registrar um pacote de alimentos excedentes com pouquíssimos cliques,  
  **PARA QUE** eu possa disponibilizar os itens rapidamente antes do encerramento do expediente.
* **Critérios de Aceite:**
  * **[Campos Essenciais]** Cadastro contendo apenas: Título da doação, Categoria (ex: Panificação, Hortifrúti), Quantidade (ex: "5 pacotes", "10 kg") e Instruções de Retirada (ex: "garagem nos fundos").
  * **[Status Padrão]** O item publicado entra automaticamente com o status `DISPONIVEL` no banco de dados.
  * **[Rapidez de Envio]** A ação deve ser otimizada para dispositivos móveis para ser concluída em menos de 2 minutos.

#### 3. Acessibilidade Visual e Auditiva (Inclusão)
* **COMO** Usuário com limitações visuais ou motoras,  
  **QUERO** navegar e operar a aplicação utilizando recursos de acessibilidade,  
  **PARA QUE** eu possa doar ou solicitar alimentos sem barreiras tecnológicas.
* **Critérios de Aceite:**
  * **[Tags Semânticas]** Toda a estrutura deve utilizar HTML5 semântico e atributos ARIA para leitores de tela.
  * **[Navegação por Teclado]** Foco de seleção de inputs e botões deve ser visível e controlável por teclado.
  * **[Alto Contraste]** Implementar um seletor visual na barra de navegação para alternar para modo de alto contraste.

#### 4. Sistema de Reputação (Confiabilidade)
* **COMO** Doador ou Receptor,  
  **QUERO** ver a taxa de confiabilidade e pontuação de outros usuários no perfil,  
  **PARA QUE** eu possa realizar acordos de coleta seguros e reduzir ausências nas retiradas.
* **Critérios de Aceite:**
  * **[Pontuação de Coleta]** ONGs que concluem coletas de itens reservados ganham pontos de reputação.
  * **[Sinalização de Cancelamentos]** A reputação diminui se houver cancelamentos frequentes de reservas sem aviso prévio.
  * **[Exibição de Confiabilidade]** O perfil deve exibir estrelas ou insígnias de reputação (ex: "Doador Fiel").

---

### 🌊 Onda 3: Operação e Controle
Ativação das dinâmicas de conexão, reserva e medição de impacto.

#### 5. Sistema de Reservas de Alimentos
* **COMO** Receptora de ONG (Sandra),  
  **QUERO** reservar um alimento publicado por um estabelecimento parceiro,  
  **PARA QUE** eu garanta o item para minha instituição e evite deslocamentos perdidos.
* **Critérios de Aceite:**
  * **[Garantia de Exclusividade]** Um alimento com reserva pendente não pode ser reservado por outra ONG (controle de concorrência).
  * **[Status Transicional]** Ao reservar, o status do alimento é alterado para `RESERVADA` e uma reserva pendente vinculando o `ong_id` é registrada.
  * **[Confirmação de Coleta]** A doação é finalizada e o status muda para `COLETADA` após confirmação do receptor no ato da retirada física.

#### 6. Relatório de Oferta e Demanda
* **COMO** Gestor do Sistema ou Doador,  
  **QUERO** visualizar métricas agregadas sobre alimentos doados e coletados,  
  **PARA QUE** possamos analisar a efetividade social da plataforma e o volume de desperdício mitigado.
* **Critérios de Aceite:**
  * **[Volume de Doações]** Exibição simples do total de quilos ou pacotes de alimentos reaproveitados.
  * **[Status das Operações]** Gráfico ou tabela resumindo doações ativas, pendentes e coletadas.

---

### 🌊 Onda 4: Identificação e Gestão
Melhorias no monitoramento e facilitação logística da coleta física.

#### 7. Dashboard para Doadores e Usuários
* **COMO** Doador (Estabelecimento),  
  **QUERO** um painel personalizado mostrando meu histórico de doações e impacto social gerado,  
  **PARA QUE** eu possa usar esses dados em relatórios corporativos ESG.
* **Critérios de Aceite:**
  * **[Painel Individual]** Histórico de todos os pacotes de alimentos cadastrados pelo usuário.
  * **[Indicadores de Impacto]** Total de refeições providenciadas e selos de sustentabilidade obtidos.

#### 8. Upload de Fotos do Local de Retirada
* **COMO** Doador,  
  **QUERO** anexar fotos da área de retirada/entrada de serviço do estabelecimento no perfil,  
  **PARA QUE** os voluntários da ONG localizem o ponto de coleta física com facilidade.
* **Critérios de Aceite:**
  * **[Visualização Logística]** Exibição da foto do local na tela de detalhes da reserva para o voluntário.
  * **[Segurança Física]** Fotos salvas de forma otimizada para não onerar o armazenamento do sistema.

---

### 🌊 Onda 5: Inteligência e Refinamento
Funcionalidades avançadas para otimização espacial e busca segmentada.

#### 9. Filtros Inteligentes de Feed
* **COMO** Receptora de ONG (Sandra),  
  **QUERO** filtrar o feed por proximidade (distância) e categoria de alimentos,  
  **PARA QUE** eu priorize itens compatíveis com o cardápio da instituição e reduza custos de deslocamento.
* **Critérios de Aceite:**
  * **[Busca por Categoria]** Filtros rápidos por tipo (ex: Proteínas, Carboidratos, Hortifrúti).
  * **[Proximidade de Raio]** Filtro de distância aproximada com base no CEP cadastrado dos usuários.

#### 10. Mapa de Calor com Proximidade de Interesse
* **COMO** Gestor ou Voluntário,  
  **QUERO** visualizar um mapa gráfico que aponte as regiões com maior volume de alimentos disponíveis,  
  **PARA QUE** possamos criar campanhas em áreas de alta escassez ou alto excedente.
* **Critérios de Aceite:**
  * **[Representação Visual]** Mapa exibindo densidade de doações ativas por meio de gradientes de cor.
