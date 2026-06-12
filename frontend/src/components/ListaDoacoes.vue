<script setup>
// 1. Importações do Vue
import { ref, onMounted } from 'vue';

// 2. Estado Reativo
const doacoes = ref([]);
const carregando = ref(true);

// Carrega as doações ativas do backend
const carregarDoacoes = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/doacoes');
    if (response.ok) {
      doacoes.value = await response.json();
    }
  } catch (error) {
    console.error("Erro ao carregar feed de doações:", error);
  } finally {
    carregando.value = false;
  }
};

onMounted(() => {
  carregarDoacoes();
});
</script>

<template>
  <div class="feed-wrapper">
    <div class="feed-container">
      <h2>Painel de Doações Disponíveis</h2>
      <p class="subtitle">Acompanhe os excedentes publicados pelos estabelecimentos parceiros</p>

      <button @click="carregarDoacoes" class="btn-refresh">Atualizar Painel 🔄</button>

      <!-- Feedback visual de Carregamento -->
      <div v-if="carregando" class="loading-text">Buscando doações na nuvem...</div>

      <!-- Se não houver doações cadastradas -->
      <div v-else-if="doacoes.length === 0" class="empty-feed">
        <p>Sem doações disponíveis no momento. 🌿</p>
        <small>Cadastre um alimento no Cadastro Expresso para vê-lo aparecer aqui!</small>
      </div>

      <!-- Feed Grid -->
      <div v-else class="feed-grid">
        <div v-for="item in doacoes" :key="item._id" class="feed-card">
          <div class="card-header">
            <span class="badge-status">{{ item.status_reserva }}</span>
            <span class="badge-category">{{ item.categoria }}</span>
          </div>

          <h3 class="card-title">{{ item.titulo }}</h3>
          
          <div class="card-details">
            <p><strong>Quantidade:</strong> {{ item.quantidade }}</p>
            <p v-if="item.doador_id">
              <strong>Doador:</strong> {{ item.doador_id.nome }} ({{ item.doador_id.empresa }})
            </p>
            <p v-if="item.doador_id && item.doador_id.endereco">
              <strong>Bairro de Retirada:</strong> {{ item.doador_id.endereco.bairro }}
            </p>
            <p class="logistics">
              <strong>Instruções de Retirada:</strong><br />
              <span class="instruction-text">{{ item.instrucoes_retirada }}</span>
            </p>
          </div>
          
          <div class="card-footer">
            <small class="timestamp">Publicado em: {{ new Date(item.data_criacao).toLocaleDateString() }} às {{ new Date(item.data_criacao).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-wrapper {
  display: flex;
  justify-content: center;
  min-height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
  padding: 40px 20px;
  font-family: sans-serif;
}

.feed-container {
  width: 100%;
  max-width: 900px;
}

h2 {
  color: #10b981;
  text-align: center;
  margin-bottom: 5px;
}

.subtitle {
  color: #94a3b8;
  text-align: center;
  margin-bottom: 25px;
  font-size: 0.95rem;
}

.btn-refresh {
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: block;
  margin: 0 auto 30px auto;
  transition: background 0.2s;
}

.btn-refresh:hover {
  background: #334155;
  color: #f8fafc;
}

.loading-text, .empty-feed {
  text-align: center;
  color: #94a3b8;
  padding: 40px;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  border: 1px dashed #334155;
}

.empty-feed p {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

/* Grid de Cards */
.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Card Individual */
.feed-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.badge-status {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

.badge-category {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

.card-title {
  font-size: 1.2rem;
  color: #f8fafc;
  margin: 0 0 15px 0;
}

.card-details {
  font-size: 0.85rem;
  color: #cbd5e1;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.logistics {
  background: rgba(15, 23, 42, 0.5);
  padding: 10px;
  border-radius: 6px;
  margin-top: 5px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.instruction-text {
  color: #94a3b8;
  font-style: italic;
  display: inline-block;
  margin-top: 4px;
}

.card-footer {
  margin-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 10px;
  font-size: 0.75rem;
  color: #64748b;
  text-align: right;
}
</style>
