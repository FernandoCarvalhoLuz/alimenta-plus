<script setup>
// 1. Importações do Vue
import { ref, onMounted } from 'vue';

// 2. Propriedades Recebidas (Dados do Usuário Logado)
const props = defineProps({
  usuario: {
    type: Object,
    required: true
  }
});

// Eventos emitidos para aviso e recarga global
const emit = defineEmits(['notify', 'update-user']);

// Estado reativo do Formulário
const form = ref({
  doador_id: props.usuario._id,
  titulo: '',
  categoria: 'Panificação',
  quantidade: '',
  instrucoes_retirada: ''
});

// Estado das doações postadas pelo doador
const doacoesDoador = ref([]);
const carregandoHistorico = ref(true);

// Busca doações deste doador no backend
const carregarHistorico = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/doacoes?doador_id=${props.usuario._id}`);
    if (response.ok) {
      doacoesDoador.value = await response.json();
    }
  } catch (error) {
    console.error("Erro ao carregar histórico:", error);
  } finally {
    carregandoHistorico.value = false;
  }
};

onMounted(() => {
  carregarHistorico();
});

// Envia a doação para o backend (Cadastro Expresso)
const publicarDoacao = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/doacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();

    if (response.ok) {
      emit('notify', { message: "Doação publicada com sucesso no feed!", type: 'success' });
      
      // Reseta os campos do formulário
      form.value.titulo = '';
      form.value.quantidade = '';
      form.value.instrucoes_retirada = '';

      // Atualiza a lista na tela
      carregarHistorico();
    } else {
      emit('notify', { message: data.error || "Erro ao publicar doação.", type: 'error' });
    }
  } catch (error) {
    emit('notify', { message: "Erro de conexão ao salvar doação.", type: 'error' });
  }
};

// Confirma que a ONG retirou fisicamente a doação (Completa o fluxo de Reserva e Reputação)
const confirmarColeta = async (doacaoId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/doacoes/${doacaoId}/coletar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();

    if (response.ok) {
      emit('notify', { message: "Entrega concluída! Sua reputação subiu.", type: 'success' });
      
      // Atualiza os dados locais do doador (para ver a reputação subindo na tela)
      atualizarDadosUsuario();
      
      // Atualiza o histórico
      carregarHistorico();
    } else {
      emit('notify', { message: data.error || "Erro ao confirmar coleta.", type: 'error' });
    }
  } catch (error) {
    emit('notify', { message: "Erro de conexão ao processar coleta.", type: 'error' });
  }
};

// Busca os dados atualizados do doador na base (reputação atualizada)
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

// Helper para desenhar as estrelas da reputação baseada no número
const obterEstrelas = (num) => {
  const nota = Math.round(num || 5);
  return '⭐'.repeat(nota) + '☆'.repeat(5 - nota);
};
</script>

<template>
  <div class="dashboard-doador">
    
    <!-- Painel de Resumo do Doador -->
    <section class="summary-section">
      <div class="welcome-card">
        <span class="user-badge">DOADOR</span>
        <h2>Olá, {{ props.usuario.nome }}</h2>
        <p class="company-name">🏢 {{ props.usuario.empresa }}</p>
        
        <div class="reputation-bar">
          <span class="stars">{{ obterEstrelas(props.usuario.reputacao) }}</span>
          <span class="rating-text">Reputação: <strong>{{ props.usuario.reputacao.toFixed(1) }}</strong> / 5.0</span>
        </div>
      </div>
    </section>

    <div class="dashboard-grid">
      <!-- Formulário de Cadastro Expresso (Onda 2 - Item 1) -->
      <section class="form-section">
        <div class="card-express">
          <h3>Cadastro Expresso de Alimento</h3>
          <p class="section-desc">Disponibilize excedentes no feed rapidamente</p>

          <form @submit.prevent="publicarDoacao">
            <div class="form-group">
              <label for="titulo-alimento">O que você vai doação?</label>
              <input 
                type="text" 
                id="titulo-alimento" 
                v-model="form.titulo" 
                placeholder="Ex: 20 pães franceses, 5 marmitas congeladas" 
                required 
              />
            </div>

            <div class="form-group">
              <label for="cat-alimento">Categoria</label>
              <select id="cat-alimento" v-model="form.categoria" required>
                <option value="Panificação">Panificação / Padaria</option>
                <option value="Hortifrúti">Hortifrúti (Frutas/Hortaliças)</option>
                <option value="Marmitas">Refeições Prontas / Marmitas</option>
                <option value="Laticínios">Laticínios e Frios</option>
                <option value="Mercearia">Alimentos secos / Mercearia</option>
                <option value="Outros">Outros</option>
              </select>
            </div>

            <div class="form-group">
              <label for="qtd-alimento">Quantidade e Embalagem</label>
              <input 
                type="text" 
                id="qtd-alimento" 
                v-model="form.quantidade" 
                placeholder="Ex: 5 sacolas, 10kg, 12 caixas" 
                required 
              />
            </div>

            <div class="form-group">
              <label for="inst-alimento">Instruções Logísticas de Retirada</label>
              <textarea 
                id="inst-alimento" 
                v-model="form.instrucoes_retirada" 
                placeholder="Ex: Entrada lateral pela rua secundária. Tocar o interfone e procurar pelo supervisor Cláudio na cozinha."
                rows="3" 
                required>
              </textarea>
            </div>

            <button type="submit" class="btn-post">Publicar no Feed 🚀</button>
          </form>
        </div>
      </section>

      <!-- Histórico de Doações e Ações (Onda 3 / Confirmação) -->
      <section class="history-section">
        <div class="card-history">
          <h3>Seu Histórico de Doações</h3>
          <p class="section-desc">Acompanhe as reservas e confirme as coletas concluídas</p>

          <div v-if="carregandoHistorico" class="loading">Carregando histórico...</div>
          
          <div v-else-if="doacoesDoador.length === 0" class="empty-state">
            Nenhum alimento cadastrado por você ainda.
          </div>

          <div v-else class="history-list">
            <div v-for="item in doacoesDoador" :key="item._id" class="history-card" :class="item.status_reserva.toLowerCase()">
              <div class="history-card-header">
                <span class="status-badge">{{ item.status_reserva }}</span>
                <span class="cat-badge">{{ item.categoria }}</span>
              </div>
              
              <h4 class="history-title">{{ item.titulo }}</h4>
              
              <div class="history-details">
                <p><strong>Qtd:</strong> {{ item.quantidade }}</p>
                <small class="time">Publicado em: {{ new Date(item.data_criacao).toLocaleDateString() }}</small>
              </div>

              <!-- Se estiver reservado pela ONG, permite confirmar a coleta física (Confirmação) -->
              <div v-if="item.status_reserva === 'RESERVADA'" class="action-box">
                <p class="reserve-alert">⚠️ A coleta foi agendada por uma ONG parceira!</p>
                <button @click="confirmarColeta(item._id)" class="btn-confirm">Confirmar Entrega / Coleta 🤝</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dashboard-doador {
  max-width: 1100px;
  margin: 0 auto;
  padding: 30px 20px;
  font-family: sans-serif;
  color: #f8fafc;
}

/* Resumo do Perfil */
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
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: bold;
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 5px;
}

.company-name {
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
  color: #eab308; /* Dourado */
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
  grid-template-columns: 1fr 1.2fr;
  gap: 30px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* Card Genérico */
.card-express, .card-history {
  background: rgba(20, 28, 48, 0.65);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

h3 {
  color: #10b981;
  font-size: 1.3rem;
  margin-bottom: 5px;
}

.section-desc {
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 25px;
}

/* Formulário */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

label {
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 8px;
}

input, select, textarea {
  background: #0b111e;
  border: 1px solid #1e293b;
  color: #f8fafc;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  font-family: sans-serif;
  transition: all 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.btn-post {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.btn-post:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
}

/* Histórico */
.loading, .empty-state {
  text-align: center;
  color: #94a3b8;
  padding: 40px 0;
  font-size: 0.9rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 5px;
}

.history-list::-webkit-scrollbar {
  width: 5px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #1f2937;
  border-radius: 3px;
}

.history-card {
  background: #0b111e;
  border-radius: 10px;
  padding: 15px;
  border-left: 4px solid #94a3b8;
  transition: all 0.2s ease;
}

.history-card.disponivel {
  border-left-color: #10b981; /* Verde */
}

.history-card.reservada {
  border-left-color: #3b82f6; /* Azul */
}

.history-card.coletada {
  border-left-color: #64748b; /* Cinza */
  opacity: 0.7;
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
}

.disponivel .status-badge {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.reservada .status-badge {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.coletada .status-badge {
  color: #94a3b8;
  background: rgba(148, 163, 184, 0.1);
}

.cat-badge {
  font-size: 0.7rem;
  color: #64748b;
}

.history-title {
  font-size: 1rem;
  margin-bottom: 8px;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #cbd5e1;
}

/* Caixa de Ação de Reserva */
.action-box {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 12px;
  border-radius: 8px;
  margin-top: 12px;
}

.reserve-alert {
  font-size: 0.75rem;
  color: #93c5fd;
  margin-bottom: 8px;
  text-align: left;
}

.btn-confirm {
  width: 100%;
  background: #2563eb;
  border: none;
  color: white;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm:hover {
  background: #1d4ed8;
}
</style>
