<script setup>
// 1. Importações do Vue
import { ref, onMounted, computed } from 'vue';

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
      
      form.value.titulo = '';
      form.value.quantidade = '';
      form.value.instrucoes_retirada = '';

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
      atualizarDadosUsuario();
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

const obterEstrelas = (num) => {
  const nota = Math.round(num || 5);
  return '⭐'.repeat(nota) + '☆'.repeat(5 - nota);
};

// Onda 4: Indicadores de Impacto
const totalRefeicoes = computed(() => {
  return doacoesDoador.value.length * 15; // Estimativa: 15 refeições por doação
});

const seloSustentabilidade = computed(() => {
  if (doacoesDoador.value.length >= 10) return 'Ouro 🥇';
  if (doacoesDoador.value.length >= 5) return 'Prata 🥈';
  if (doacoesDoador.value.length >= 1) return 'Bronze 🥉';
  return 'Iniciante 🌱';
});

// Onda 4: Upload de Foto
const fileInputRef = ref(null);

const triggerUpload = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const handleUploadFoto = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    
    img.onload = async () => {
      // Otimização: Reduz tamanho e qualidade da imagem para não onerar o banco
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      let width = img.width;
      let height = img.height;
      
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      const base64Otimizado = canvas.toDataURL('image/jpeg', 0.7); // Compressão Jpeg 70%

      try {
        const response = await fetch(`http://localhost:3000/api/usuarios/${props.usuario._id}/foto`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ foto_local_base64: base64Otimizado })
        });
        
        const data = await response.json();

        if (response.ok) {
          emit('notify', { message: 'Foto do local atualizada com sucesso!', type: 'success' });
          atualizarDadosUsuario();
        } else {
          emit('notify', { message: data.error || 'Erro ao processar imagem no servidor.', type: 'error' });
        }
      } catch (error) {
        emit('notify', { message: 'Erro de conexão ao enviar foto.', type: 'error' });
      }
    };
  };
  reader.readAsDataURL(file);
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

        <!-- Indicadores de Impacto (Onda 4) -->
        <div class="impact-metrics mt-4">
          <div class="impact-item">
            <span class="impact-icon">🍽️</span>
            <div>
              <div class="impact-value">{{ totalRefeicoes }}</div>
              <div class="impact-label">Refeições Providenciadas</div>
            </div>
          </div>
          <div class="impact-item">
            <span class="impact-icon">🏆</span>
            <div>
              <div class="impact-value">{{ seloSustentabilidade }}</div>
              <div class="impact-label">Selo de Sustentabilidade</div>
            </div>
          </div>
        </div>

        <!-- Foto do Local de Retirada (Onda 4) -->
        <div class="photo-upload-section mt-4">
          <input type="file" accept="image/*" ref="fileInputRef" @change="handleUploadFoto" style="display: none;" />
          <button @click="triggerUpload" class="btn-upload">📸 Atualizar Foto do Local de Retirada</button>
          <div v-if="props.usuario.foto_local_base64" class="photo-preview mt-2">
            <p class="preview-title">Sua foto atual do local:</p>
            <img :src="props.usuario.foto_local_base64" alt="Foto do local de retirada" class="img-preview" />
          </div>
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
              <label for="titulo-alimento">O que você vai doar?</label>
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

              <!-- Se estiver reservado pela ONG, permite confirmar a coleta física -->
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
  color: #1e293b;
}

/* Painel de Resumo do Doador - Gradiente Laranja Claro */
.summary-section {
  margin-bottom: 30px;
}

.welcome-card {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border: 1px solid rgba(249, 115, 22, 0.25);
  border-radius: 24px;
  padding: 30px 40px;
  position: relative;
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.08);
}

.user-badge {
  position: absolute;
  top: 30px;
  right: 40px;
  background: #f97316;
  color: #ffffff;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

h2 {
  font-size: 1.8rem;
  color: #ea580c;
  font-weight: 700;
  margin-bottom: 5px;
}

.company-name {
  color: #475569;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
}

.reputation-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  padding: 8px 18px;
  border-radius: 12px;
  width: fit-content;
  border: 1px solid rgba(249, 115, 22, 0.15);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02);
}

.stars {
  color: #f59e0b; /* Amarelo */
  letter-spacing: 2px;
  font-size: 1.1rem;
}

.rating-text {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 600;
}

/* Indicadores de Impacto */
.impact-metrics {
  display: flex;
  gap: 20px;
  background: rgba(255, 255, 255, 0.6);
  padding: 15px;
  border-radius: 12px;
  border: 1px solid rgba(249, 115, 22, 0.1);
}

.impact-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.impact-icon {
  font-size: 1.8rem;
}

.impact-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ea580c;
}

.impact-label {
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 600;
}

/* Upload de Foto */
.btn-upload {
  background: #ffffff;
  border: 1px dashed #f97316;
  color: #ea580c;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.btn-upload:hover {
  background: #fff7ed;
}

.img-preview {
  max-width: 250px;
  max-height: 150px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  object-fit: cover;
}

.preview-title {
  font-size: 0.75rem;
  color: #64748b;
  margin-bottom: 5px;
}

.mt-4 { margin-top: 1.5rem; }
.mt-2 { margin-top: 0.5rem; }

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

/* Card Branco com Borda Suave */
.card-express, .card-history {
  background: #faf7f2;
  border: 1px solid rgba(220, 205, 185, 0.4);
  border-radius: 24px;
  padding: 35px;
  box-shadow: 0 10px 30px rgba(220, 205, 185, 0.18);
}

h3 {
  color: #ea580c;
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.section-desc {
  color: #64748b;
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
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 8px;
}

input, select, textarea {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  padding: 11px 15px;
  border-radius: 12px;
  font-size: 0.9rem;
  outline: none;
  font-family: 'Quicksand', sans-serif;
  transition: all 0.2s ease;
}

input:focus, select:focus, textarea:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
}

.btn-post {
  width: 100%;
  background: linear-gradient(135deg, #f97316, #facc15);
  border: none;
  color: white;
  padding: 13px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.25);
}

.btn-post:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.35);
}

/* Histórico */
.loading, .empty-state {
  text-align: center;
  color: #64748b;
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
  background: #ede6db;
  border-radius: 3px;
}

.history-card {
  background: #f5efe6;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(220, 205, 185, 0.3);
  border-left: 5px solid #64748b;
  transition: all 0.2s ease;
}

.history-card.disponivel {
  border-left-color: #10b981;
  background: #f0fdf4; /* Verde bem suave */
}

.history-card.reservada {
  border-left-color: #3b82f6;
  background: #eff6ff; /* Azul bem suave */
}

.history-card.coletada {
  border-left-color: #94a3b8;
  background: #f8fafc;
  opacity: 0.7;
}

.history-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.disponivel .status-badge {
  color: #15803d;
  background: rgba(22, 163, 74, 0.1);
}

.reservada .status-badge {
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.1);
}

.coletada .status-badge {
  color: #475569;
  background: rgba(71, 85, 105, 0.1);
}

.cat-badge {
  font-size: 0.75rem;
  color: #475569;
  font-weight: bold;
}

.history-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.history-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #475569;
}

/* Caixa de Ação de Reserva */
.action-box {
  background: #ffffff;
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 15px;
  border-radius: 12px;
  margin-top: 15px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.03);
}

.reserve-alert {
  font-size: 0.8rem;
  color: #1d4ed8;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: left;
}

.btn-confirm {
  width: 100%;
  background: #2563eb;
  border: none;
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: bold;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.15);
}

.btn-confirm:hover {
  background: #1d4ed8;
}
</style>
