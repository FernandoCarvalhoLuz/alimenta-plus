<template>
  <div :class="{ 'high-contrast': highContrast }" class="app-container">
    
    <!-- Barra de Navegação Premium (Header) -->
    <header class="app-header" role="banner">
      <div class="logo-container">
        <span class="logo-icon" aria-hidden="true">🍊</span>
        <span class="logo-text">Alimenta<span class="plus-symbol">+</span></span>
      </div>
      
      <!-- Menu de Abas para Usuários Autenticados -->
      <nav v-if="usuarioLogado" class="nav-menu" role="navigation" aria-label="Menu principal">
        <button 
          v-if="usuarioLogado.tipo_perfil === 'DOADOR'"
          @click="currentTab = 'doador'" 
          :class="{ active: currentTab === 'doador' }"
          class="nav-btn"
          aria-label="Ir para Painel do Doador">
          Painel do Doador 🏢
        </button>
        
        <button 
          v-if="usuarioLogado.tipo_perfil === 'ONG'"
          @click="currentTab = 'ong'" 
          :class="{ active: currentTab === 'ong' }"
          class="nav-btn"
          aria-label="Ir para Painel da ONG">
          Painel da ONG 🤝
        </button>

        <button 
          @click="currentTab = 'dashboard'" 
          :class="{ active: currentTab === 'dashboard' }"
          class="nav-btn"
          aria-label="Ir para Métricas de Impacto">
          Métricas de Impacto 📊
        </button>
      </nav>

      <!-- Opções Auxiliares: Acessibilidade e Sair -->
      <div class="header-actions">
        <!-- Onda 2: Acessibilidade Visual (Alto Contraste) -->
        <button 
          @click="toggleHighContrast" 
          class="btn-accessibility" 
          :aria-pressed="highContrast"
          title="Alternar modo de alto contraste para acessibilidade">
          🌓 Alto Contraste
        </button>

        <div v-if="usuarioLogado" class="user-session-info">
          <span class="user-name">{{ usuarioLogado.nome }}</span>
          <button @click="logout" class="btn-logout" aria-label="Sair da conta">Sair</button>
        </div>
      </div>
    </header>

    <!-- Área de Conteúdo Principal -->
    <main class="app-main" role="main">
      
      <!-- Se NÃO estiver logado, exibe tela de Login / Cadastro -->
      <div v-if="!usuarioLogado" class="auth-section">
        <CadastroUsuario @login-success="handleLoginSuccess" @notify="showToast" />
      </div>

      <!-- Se ESTIVER logado, renderiza a tela com base no perfil e aba -->
      <div v-else class="content-section">
        <CadastroDoacao 
          v-if="currentTab === 'doador' && usuarioLogado.tipo_perfil === 'DOADOR'" 
          :usuario="usuarioLogado" 
          @notify="showToast"
          @update-user="handleUpdateUser"
        />
        
        <ListaDoacoes 
          v-else-if="currentTab === 'ong' && usuarioLogado.tipo_perfil === 'ONG'" 
          :usuario="usuarioLogado" 
          @notify="showToast"
          @update-user="handleUpdateUser"
        />

        <RelatorioGlobal 
          v-else-if="currentTab === 'dashboard'" 
        />
      </div>

    </main>

    <!-- Rodapé Acessível -->
    <footer class="app-footer" role="contentinfo">
      <p>&copy; 2026 Alimenta+ - Tecnologia social em prol do ODS 2 (Fome Zero).</p>
    </footer>

    <!-- Sistema Premium de Notificação Toast -->
    <div v-if="toast.visible" :class="toast.type" class="toast-notification" role="alert" aria-live="assertive">
      <span class="toast-icon">{{ toastIcon }}</span>
      <span class="toast-message">{{ toast.message }}</span>
      <button @click="toast.visible = false" class="toast-close-btn" aria-label="Fechar notificação">×</button>
    </div>

  </div>
</template>

<script setup>
// 1. Importações do Vue e Componentes
import { ref, computed, onMounted } from 'vue';
import CadastroUsuario from './components/CadastroUsuario.vue';
import CadastroDoacao from './components/CadastroDoacao.vue';
import ListaDoacoes from './components/ListaDoacoes.vue';
import RelatorioGlobal from './components/RelatorioGlobal.vue';

// 2. Estados Globais Reativos
const usuarioLogado = ref(null);
const currentTab = ref('dashboard');
const highContrast = ref(false);

// Estado das Notificações Toast
const toast = ref({
  visible: false,
  message: '',
  type: 'success'
});

// Ícones dinâmicos do Toast
const toastIcon = computed(() => {
  switch (toast.value.type) {
    case 'success': return '🍊';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
});

// 3. Funções de Ciclo de Vida & Ações
onMounted(() => {
  const session = localStorage.getItem('usuario_logado');
  if (session) {
    try {
      usuarioLogado.value = JSON.parse(session);
      ajustarAbaPadrao();
    } catch (e) {
      localStorage.removeItem('usuario_logado');
    }
  }

  const contrastPref = localStorage.getItem('alto_contraste');
  if (contrastPref === 'true') {
    highContrast.value = true;
  }
});

const ajustarAbaPadrao = () => {
  if (usuarioLogado.value.tipo_perfil === 'DOADOR') {
    currentTab.value = 'doador';
  } else if (usuarioLogado.value.tipo_perfil === 'ONG') {
    currentTab.value = 'ong';
  } else {
    currentTab.value = 'dashboard';
  }
};

const handleLoginSuccess = (usuario) => {
  usuarioLogado.value = usuario;
  localStorage.setItem('usuario_logado', JSON.stringify(usuario));
  ajustarAbaPadrao();
};

const handleUpdateUser = (usuarioAtualizado) => {
  usuarioLogado.value = usuarioAtualizado;
  localStorage.setItem('usuario_logado', JSON.stringify(usuarioAtualizado));
};

const logout = () => {
  usuarioLogado.value = null;
  localStorage.removeItem('usuario_logado');
  showToast({ message: "Sessão encerrada com sucesso.", type: 'info' });
};

const toggleHighContrast = () => {
  highContrast.value = !highContrast.value;
  localStorage.setItem('alto_contraste', highContrast.value.toString());
  showToast({ 
    message: highContrast.value ? "Alto contraste ativado para leitura." : "Alto contraste desativado.", 
    type: 'info' 
  });
};

const showToast = ({ message, type = 'success' }) => {
  toast.value.message = message;
  toast.value.type = type;
  toast.value.visible = true;

  setTimeout(() => {
    toast.value.visible = false;
  }, 4000);
};
</script>

<style>
/* Importa a fonte amigável e arredondada Quicksand */
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap');

/* 1. CONFIGURAÇÕES E RESETS GLOBAIS */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Quicksand', sans-serif;
  background-color: #f5efe6; /* Bege areia suave, reduzindo o brilho */
  color: #1e293b; /* Charcoal escuro amigável */
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 2. HEADER CLARO ORGÂNICO (Finos toques de Laranja/Bege) */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: rgba(245, 239, 230, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(220, 205, 185, 0.25);
  box-shadow: 0 4px 20px rgba(220, 205, 185, 0.15);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ea580c; /* Laranja Escuro */
}

.plus-symbol {
  color: #f59e0b; /* Amarelo-Ouro */
}

/* MENU DE ABAS */
.nav-menu {
  display: flex;
  gap: 12px;
}

.nav-btn {
  background: transparent;
  border: none;
  font-family: 'Quicksand', sans-serif;
  color: #64748b;
  padding: 10px 20px;
  border-radius: 20px; /* Bem arredondado */
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.05);
}

.nav-btn.active {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.08);
  font-weight: 700;
}

/* AÇÕES DO HEADER */
.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-accessibility {
  background: #f5efe6;
  border: 1px solid rgba(220, 205, 185, 0.5);
  color: #475569;
  font-family: 'Quicksand', sans-serif;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-accessibility:hover {
  background: #ede6db;
  color: #1e293b;
}

.user-session-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 0.9rem;
  color: #ea580c;
  font-weight: 700;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  font-family: 'Quicksand', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #ef4444;
  color: white;
}

/* 3. CONTEÚDO PRINCIPAL E FOOTER */
.app-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.app-footer {
  text-align: center;
  padding: 25px;
  background: #f5efe6;
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 500;
  border-top: 1px solid rgba(220, 205, 185, 0.3);
}

/* 4. TOAST NOTIFICATION PREMIUM (Clara e Elegante) */
.toast-notification {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 5000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(220, 205, 185, 0.3);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  max-width: 380px;
  background: #ffffff;
  color: #1e293b;
  border: 1px solid rgba(220, 205, 185, 0.4);
}

.toast-notification.success {
  border-left: 5px solid #f97316; /* Laranja */
}

.toast-notification.error {
  border-left: 5px solid #ef4444;
}

.toast-notification.warning {
  border-left: 5px solid #f59e0b;
}

.toast-notification.info {
  border-left: 5px solid #3b82f6;
}

.toast-message {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.4;
  flex-grow: 1;
}

.toast-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.3rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close-btn:hover {
  color: #1e293b;
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* ==========================================================================
   5. ACESSIBILIDADE - ESTILOS DE ALTO CONTRASTE (Onda 2 - Item 2)
   ========================================================================== */
.high-contrast {
  background-color: #000000 !important;
  color: #ffffff !important;
}

.high-contrast .app-header {
  background: #000000 !important;
  border-bottom: 2px solid #ffffff !important;
}

.high-contrast .nav-btn,
.high-contrast .btn-accessibility,
.high-contrast .btn-logout,
.high-contrast .btn-submit,
.high-contrast .btn-post,
.high-contrast .btn-reserve,
.high-contrast .btn-confirm,
.high-contrast .btn-cancel,
.high-contrast .btn-refresh,
.high-contrast .btn-refresh-inline {
  background: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  text-decoration: none !important;
}

.high-contrast .nav-btn.active {
  background: #ffffff !important;
  color: #000000 !important;
}

.high-contrast .auth-card,
.high-contrast .welcome-card,
.high-contrast .card-express,
.high-contrast .card-box,
.high-contrast .history-card,
.high-contrast .feed-item,
.high-contrast .reserve-item,
.high-contrast .stat-card,
.high-contrast .food-grid,
.high-contrast .impact-meter {
  background: #000000 !important;
  border: 2px solid #ffffff !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: #ffffff !important;
}

.high-contrast input,
.high-contrast select,
.high-contrast textarea {
  background: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
  border-radius: 0 !important;
}

.high-contrast label,
.high-contrast .subtitle,
.high-contrast .section-desc,
.high-contrast .user-name,
.high-contrast .rating-text,
.high-contrast .desc {
  color: #ffffff !important;
}

.high-contrast .stars,
.high-contrast .stars-small {
  color: #ffffff !important;
}

.high-contrast .plus-symbol,
.high-contrast h2,
.high-contrast h3,
.high-contrast h4 {
  color: #ffffff !important;
  background: none !important;
  -webkit-text-fill-color: initial !important;
}

.high-contrast .toast-notification {
  background: #000000 !important;
  color: #ffffff !important;
  border: 3px solid #ffffff !important;
  border-radius: 0 !important;
}
</style>
