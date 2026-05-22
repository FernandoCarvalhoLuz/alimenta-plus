# Relatório de Extensão: Alimenta+ e os Objetivos de Desenvolvimento Sustentável (ODS)

**Disciplina:** Desenvolvimento FullStack
**Projeto de Extensão:** Plataforma Alimenta+
**Etapa:** 2 (Desafio 2)

---

## 🌍 1. Os ODS Relacionados ao Projeto

O projeto **Alimenta+** foi concebido desde a sua "Lean Inception" com um forte viés de impacto social. Nossa arquitetura de software e regras de negócio estão intimamente ligadas a dois Objetivos de Desenvolvimento Sustentável (ODS) da ONU:

*   **ODS 2 - Fome Zero e Agricultura Sustentável:** Acabar com a fome, alcançar a segurança alimentar e melhoria da nutrição.
*   **ODS 12 - Consumo e Produção Responsáveis:** Reduzir pela metade o desperdício de alimentos per capita mundial, em níveis de varejo e consumidor (Metas 12.3).

---

## 💻 2. A Proposta: O que construímos até aqui

Para atacar este problema global de forma local e tecnológica, desenvolvemos o MVP (Produto Mínimo Viável) da plataforma **Alimenta+**, utilizando arquitetura moderna de software (Stack MEVN: MongoDB, Express, Vue.js, Node.js). 

Até o momento, a estrutura construída engloba:
1. **Modelagem de Dados Eficiente:** Criação de um banco de dados NoSQL na nuvem (MongoDB Atlas) capaz de armazenar perfis de *Doadores* (Restaurantes/Mercados) e *Receptores* (ONGs), conectados por meio de relacionamentos estruturais rigorosos.
2. **Termos Jurídicos Integrados:** Uma das maiores barreiras à doação de alimentos é o medo legal. Nossa plataforma já prevê o aceite de termos de segurança jurídica no ato do cadastro, incentivando os comerciantes.
3. **Sistemas de Fluxo (APIs):** Estruturação do backend para suportar um "Cadastro Expresso" de alimentos próximos ao vencimento, garantindo que a informação chegue em tempo real às ONGs.

---

## 🚀 3. O Impacto Prático (Como a Tecnologia atende aos ODS)

O software construído não é apenas uma vitrine, ele resolve problemas logísticos críticos que causam a fome e o desperdício:

*   **Combate ao Desperdício (Atendendo ao ODS 12):** Restaurantes, Padarias e Supermercados (como a nossa Persona "Ricardo") frequentemente jogam comida fora no fim do expediente por não terem como direcionar esses alimentos de forma rápida. O **Cadastro Expresso** do Alimenta+ permite anunciar a disponibilidade em segundos, transformando o que seria "lixo orgânico" em "recurso valioso".
*   **Segurança Alimentar (Atendendo ao ODS 2):** ONGs comunitárias (como a nossa Persona "Sandra") não possuem recursos para ficar circulando pela cidade em busca de doações incertas. O **Feed de Alimentos e o Sistema de Reservas** permitem que a ONG saiba exatamente onde ir e o que buscar, otimizando o transporte e garantindo que o alimento chegue à mesa de quem tem fome antes que estrague.

---

## 🎯 4. Conclusão da Etapa

O **Alimenta+** demonstra na prática como as disciplinas de Engenharia de Software e Desenvolvimento FullStack podem transpor o mundo corporativo para atuar como ferramentas reais de impacto social. A tecnologia empregada (aplicações SPA responsivas e bancos de dados em tempo real) foi escolhida cirurgicamente para que a barreira tecnológica não seja um empecilho na luta contra a fome.
