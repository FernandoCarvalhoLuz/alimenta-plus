<script setup>
// 1. Importações do Vue
import { ref, onMounted } from 'vue';

// Estado Reativo
const stats = ref({
  totalDoacoes: 0,
  disponiveis: 0,
  reservadas: 0,
  coletadas: 0,
  totalDoadores: 0,
  totalONGS: 0
});
const carregando = ref(true);

// Carrega as estatísticas do backend
const carregarStats = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/doacoes/relatorio');
    if (response.ok) {
      stats.value = await response.json();
    }
  } catch (error) {
    console.error("Erro ao carregar estatísticas:", error);
  } finally {
    carregando.value = false;
  }
};

onMounted(() => {
  carregarStats();
});
</script>

<template>
  <div class="relatorio-wrapper">
    <div class="relatorio-container">
      <h2>Métricas Globais e Impacto Social</h2>
      <p class="subtitle">Como a tecnologia está ajudando a mitigar a fome e o desperdício de alimentos</p>

      <button @click="carregarStats" class="btn-refresh">Atualizar Métricas 🔄</button>

      <div v-if="carregando" class="loading">Sincronizando painel ESG...</div>

      <div v-else class="stats-flow">
        
        <!-- Grid de Números de Usuários -->
        <div class="users-grid">
          <div class="stat-card blue">
            <span class="icon">🏢</span>
            <h4>Doadores Ativos</h4>
            <div class="number">{{ stats.totalDoadores }}</div>
            <p class="desc">Estabelecimentos comerciais cadastrados</p>
          </div>
          
          <div class="stat-card green">
            <span class="icon">🤝</span>
            <h4>ONGs Receptoras</h4>
            <div class="number">{{ stats.totalONGS }}</div>
            <p class="desc">Instituições filantrópicas ativas</p>
          </div>
        </div>

        <!-- Grid de Status dos Alimentos -->
        <div class="food-grid">
          <div class="food-card">
            <h4>Total de Doações Lançadas</h4>
            <div class="number green-gradient-text">{{ stats.totalDoacoes }}</div>
            <p class="desc">Alimentos resgatados do desperdício</p>
          </div>

          <div class="food-stats-details">
            <div class="detail-row">
              <span class="label">🟢 Disponíveis para Coleta</span>
              <span class="value">{{ stats.disponiveis }}</span>
            </div>
            <div class="detail-row">
              <span class="label">🔵 Reservados (Logística Pendente)</span>
              <span class="value">{{ stats.reservadas }}</span>
            </div>
            <div class="detail-row">
              <span class="label">⚪ Coletas Concluídas (Impacto Real)</span>
              <span class="value">{{ stats.coletadas }}</span>
            </div>
          </div>
        </div>

        <!-- Gráfico Visual Simulado em CSS para dar o tom tecnológico/premium -->
        <div class="impact-meter">
          <h3>Progresso da Rede Solidária (ODS 2)</h3>
          <p class="desc">O objetivo global é fome zero e agricultura sustentável</p>
          
          <div class="progress-bar-container">
            <div 
              class="progress-bar" 
              :style="{ width: stats.totalDoacoes > 0 ? (stats.coletadas / stats.totalDoacoes * 100) + '%' : '0%' }">
            </div>
          </div>
          
          <div class="progress-labels">
            <span>0% de Coletas</span>
            <span><strong>{{ stats.totalDoacoes > 0 ? Math.round(stats.coletadas / stats.totalDoacoes * 100) : 0 }}% Efetuados</strong></span>
            <span>100% Eficácia</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.relatorio-wrapper {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: sans-serif;
  color: #f8fafc;
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

.loading {
  text-align: center;
  color: #94a3b8;
  padding: 40px;
}

.stats-flow {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* Grids */
.users-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 600px) {
  .users-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  background: rgba(20, 28, 48, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  position: relative;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.stat-card.blue {
  border-left: 4px solid #3b82f6;
}

.stat-card.green {
  border-left: 4px solid #10b981;
}

.icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 10px;
}

h4 {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.number {
  font-size: 2.2rem;
  font-weight: bold;
  color: #f8fafc;
  margin-bottom: 5px;
}

.green-gradient-text {
  background: linear-gradient(135deg, #10b981, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.desc {
  font-size: 0.75rem;
  color: #64748b;
}

/* Bloco de doações */
.food-grid {
  background: rgba(20, 28, 48, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 30px;
  align-items: center;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .food-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.food-stats-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #0b111e;
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.detail-row .label {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.detail-row .value {
  font-size: 1rem;
  font-weight: bold;
}

/* Impact meter */
.impact-meter {
  background: rgba(20, 28, 48, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 25px 30px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.impact-meter h3 {
  color: #10b981;
  font-size: 1.1rem;
  margin-bottom: 5px;
}

.impact-meter .desc {
  margin-bottom: 15px;
}

.progress-bar-container {
  background: #0b111e;
  height: 12px;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
  border: 1px solid #1e293b;
}

.progress-bar {
  background: linear-gradient(90deg, #10b981, #3b82f6);
  height: 100%;
  border-radius: 10px;
  transition: width 0.5s ease-in-out;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #64748b;
}
</style>
