<script setup>
// 1. Importações do Vue
import { ref, onMounted } from 'vue';

// 2. Propriedades Recebidas (Dados da ONG Logada)
const props = defineProps({
  usuario: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['notify', 'update-user']);

// Estado Reativo
const doacoesDisponiveis = ref([]);
const minhasReservas = ref([]);
const carregandoFeed = ref(true);
const carregandoReservas = ref(true);

// Carrega as doações ativas (disponíveis para reserva)
const carregarFeed = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/doacoes?status=DISPONIVEL');
    if (response.ok) {
      doacoesDisponiveis.value = await response.json();
    }
  } catch (error) {
    console.error("Erro ao carregar feed:", error);
  } finally {
    carregandoFeed.value = false;
  }
};

// Carrega as reservas que esta ONG possui atualmente
const carregarMinhasReservas = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/doacoes/reservas/ong/${props.usuario._id}`);
    if (response.ok) {
      minhasReservas.value = await response.json();
    }
  } catch (error) {
    console.error("Erro ao carregar reservas:", error);
  } finally {
    carregandoReservas.value = false;
  }
};

// Função para recarregar tudo na tela
const recarregarDados = () => {
  carregarFeed();
  carregarMinhasReservas();
};

onMounted(() => {
  recarregarDados();
});

// Faz a reserva de um alimento (Onda 3)
const reservarAlimento = async (doacaoId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/doacoes/${doacaoId}/reservar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ong_id: props.usuario._id })
    });

    const data = await response.json();

    if (response.ok) {
      emit('notify', { message: "Alimento reservado com sucesso! Veja em suas reservas.", type: 'success' });
      recarregarDados();
    } else {
      emit('notify', { message: data.error || "Erro ao reservar alimento.", type: 'error' });
    }
  } catch (error) {
    emit('notify', { message: "Erro de conexão ao reservar item.", type: 'error' });
  }
};

// Cancela a reserva (Onda 3 - libera alimento e penaliza reputação)
const cancelarReserva = async (doacaoId) => {
  if (!confirm("Tem certeza que deseja cancelar? Desistências reduzem sua reputação na plataforma.")) {
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/doacoes/${doacaoId}/cancelar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok) {
      emit('notify', { message: "Reserva cancelada. Reputação atualizada.", type: 'warning' });
      
      // Sincroniza reputação local da ONG
      atualizarDadosUsuario();
      
      recarregarDados();
    } else {
      emit('notify', { message: data.error || "Erro ao cancelar reserva.", type: 'error' });
    }
  } catch (error) {
    emit('notify', { message: "Erro de conexão ao cancelar reserva.", type: 'error' });
  }
};

// Busca os dados atualizados da ONG na base (sincronizar reputação)
const atualizarDadosUsuario = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/usuarios');
    if (response.ok) {
      const usuarios = await response.json();
      const usuarioAtualizado = usuarios.find(u => u._id === props.usuario._id);
      if (usuarioAtualizado) {
        emit('update-user', usuarioAtualizado);
      }
    }
  } catch (e) {
    console.error("Erro ao sincronizar reputação:", e);
  }
};

// Helper para desenhar as estrelas
const obterEstrelas = (num) => {
  const nota = Math.round(num || 5);
  return '⭐'.repeat(nota) + '☆'.repeat(5 - nota);
};
</script>

<template>
  <div class="dashboard-ong">
    
    <!-- Perfil da ONG e Reputação -->
    <section class="summary-section">
      <div class="welcome-card">
        <span class="user-badge">ONG RECEPTORA</span>
        <h2>Olá, {{ props.usuario.nome }}</h2>
        <p class="institution-name">🤝 {{ props.usuario.empresa }}</p>
        
        <div class="reputation-bar">
          <span class="stars">{{ obterEstrelas(props.usuario.reputacao) }}</span>
          <span class="rating-text">Reputação: <strong>{{ props.usuario.reputacao.toFixed(1) }}</strong> / 5.0</span>
        </div>
      </div>
    </section>

    <!-- Grid: Reservas Ativas vs Feed Geral -->
    <div class="dashboard-grid">
      
      <!-- Feed de Alimentos Disponíveis (Esquerda) -->
      <section class="feed-section">
        <div class="card-box">
          <div class="card-header-main">
            <h3>Alimentos Disponíveis no Feed</h3>
            <button @click="recarregarDados" class="btn-refresh-inline">Atualizar 🔄</button>
          </div>
          <p class="section-desc">Reserve alimentos que atendam à demanda de sua instituição</p>

          <div v-if="carregandoFeed" class="loading">Buscando feed...</div>
          
          <div v-else-if="doacoesDisponiveis.length === 0" class="empty-state">
            Nenhum alimento disponível para coleta no momento. 🌿
          </div>

          <div v-else class="feed-list">
            <div v-for="item in doacoesDisponiveis" :key="item._id" class="feed-item">
              <div class="feed-item-header">
                <span class="cat-badge">{{ item.categoria }}</span>
                <span class="badge-active">DISPONÍVEL</span>
              </div>
              
              <h4 class="item-title">{{ item.titulo }}</h4>
              
              <div class="item-details">
                <p><strong>Quantidade:</strong> {{ item.quantidade }}</p>
                <p v-if="item.doador_id">
                  <strong>Doador:</strong> {{ item.doador_id.nome }} ({{ item.doador_id.empresa }})
                </p>
                <p v-if="item.doador_id && item.doador_id.endereco">
                  <strong>Bairro:</strong> {{ item.doador_id.endereco.bairro }} 📍
                </p>
                <div class="reputation-doador" v-if="item.doador_id">
                  <span class="stars-small">{{ obterEstrelas(item.doador_id.reputacao) }}</span>
                  <span class="rating-small">({{ item.doador_id.reputacao.toFixed(1) }})</span>
                </div>
              </div>

              <button @click="reservarAlimento(item._id)" class="btn-reserve">Reservar Alimento 📦</button>
            </div>
          </div>
        </div>
      </section>

      <!-- Minhas Reservas Ativas (Direita - Logística) -->
      <section class="reserves-section">
        <div class="card-box secondary">
          <h3>Suas Reservas Pendentes</h3>
          <p class="section-desc">Retire os alimentos abaixo seguindo as instruções de endereço</p>

          <div v-if="carregandoReservas" class="loading">Buscando suas reservas...</div>

          <div v-else-if="minhasReservas.length === 0" class="empty-state">
            Você não possui reservas pendentes de coleta.
          </div>

          <div v-else class="reserves-list">
            <!-- Cada item é um documento Reserva com o doacao_id populado -->
            <div v-for="res in minhasReservas" :key="res._id" class="reserve-item">
              <div v-if="res.doacao_id">
                <div class="reserve-item-header">
                  <span class="badge-pending">AGENDADA</span>
                  <span class="cat-badge">{{ res.doacao_id.categoria }}</span>
                </div>

                <h4 class="item-title">{{ res.doacao_id.titulo }}</h4>

                <div class="reserve-details">
                  <p><strong>Qtd:</strong> {{ res.doacao_id.quantidade }}</p>
                  
                  <div class="doador-info" v-if="res.doacao_id.doador_id">
                    <p><strong>Doador:</strong> {{ res.doacao_id.doador_id.empresa }}</p>
                    <p>
                      <strong>Retirar em:</strong> 
                      {{ res.doacao_id.doador_id.endereco.logradouro }}, 
                      {{ res.doacao_id.doador_id.endereco.numero }} 
                      <span v-if="res.doacao_id.doador_id.endereco.complemento">({{ res.doacao_id.doador_id.endereco.complemento }})</span>
                      - {{ res.doacao_id.doador_id.endereco.bairro }}
                    </p>
                  </div>

                  <div class="instruction-box">
                    <strong>Instruções de Retirada:</strong><br />
                    <p class="inst-text">{{ res.doacao_id.instrucoes_retirada }}</p>
                  </div>
                </div>

                <button @click="cancelarReserva(res.doacao_id._id)" class="btn-cancel">Desistir / Cancelar Reserva ❌</button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
.dashboard-ong {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: sans-serif;
  color: #f8fafc;
}

/* Painel de Boas-Vindas */
.summary-section {
  margin-bottom: 30px;
}

.welcome-card {
  background: linear-gradient(135deg, rgba(20, 28, 48, 0.7), rgba(30, 41, 59, 0.5));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 25px 35px;
  position: relative;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.user-badge {
  position: absolute;
  top: 25px;
  right: 35px;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 5px;
}

.institution-name {
  color: #cbd5e1;
  font-size: 0.95rem;
  margin-bottom: 15px;
}

.reputation-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.4);
  padding: 8px 15px;
  border-radius: 8px;
  width: fit-content;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.stars {
  color: #eab308;
  letter-spacing: 2px;
  font-size: 1.1rem;
}

.rating-text {
  font-size: 0.85rem;
  color: #94a3b8;
}

/* Grid Layout */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

.card-box {
  background: rgba(20, 28, 48, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.card-header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.btn-refresh-inline {
  background: #1e293b;
  border: 1px solid #334155;
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background 0.2s;
}

.btn-refresh-inline:hover {
  background: #334155;
}

h3 {
  color: #10b981;
  font-size: 1.3rem;
}

.section-desc {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 25px;
}

.loading, .empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
  font-size: 0.9rem;
}

/* Lista de Feed Geral */
.feed-list, .reserves-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 5px;
}

.feed-list::-webkit-scrollbar, .reserves-list::-webkit-scrollbar {
  width: 5px;
}

.feed-list::-webkit-scrollbar-thumb, .reserves-list::-webkit-scrollbar-thumb {
  background: #1f2937;
  border-radius: 3px;
}

.feed-item {
  background: #0b111e;
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.02);
  transition: border-color 0.2s;
}

.feed-item:hover {
  border-color: rgba(16, 185, 129, 0.2);
}

.feed-item-header, .reserve-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.cat-badge {
  font-size: 0.75rem;
  color: #3b82f6;
  font-weight: bold;
}

.badge-active {
  font-size: 0.65rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.badge-pending {
  font-size: 0.65rem;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: bold;
}

.item-title {
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.item-details, .reserve-details {
  font-size: 0.8rem;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;
}

.reputation-doador {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.stars-small {
  color: #eab308;
}

.rating-small {
  font-size: 0.75rem;
  color: #64748b;
}

.btn-reserve {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  border: none;
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-reserve:hover {
  opacity: 0.9;
}

/* Itens de Reserva */
.reserve-item {
  background: #0b111e;
  border-radius: 10px;
  padding: 15px;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.doador-info {
  background: rgba(15, 23, 42, 0.5);
  padding: 8px 10px;
  border-radius: 6px;
  margin: 5px 0;
}

.instruction-box {
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.15);
  padding: 10px;
  border-radius: 6px;
  margin-top: 5px;
  text-align: left;
}

.inst-text {
  font-style: italic;
  color: #94a3b8;
  margin-top: 4px;
}

.btn-cancel {
  width: 100%;
  background: transparent;
  border: 1px solid #ef4444;
  color: #fca5a5;
  padding: 8px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
</style>
