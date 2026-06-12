<template>
  <div :class="{ 'high-contrast': highContrast }" class="app-container">
    
    <!-- Barra de Navegação Premium (Header) -->
    <header class="app-header" role="banner">
      <div class="logo-container">
        <span class="logo-icon" aria-hidden="true">🌱</span>
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

    <!-- Sistema Premium de Notificação Toast (Substitui o alert simples) -->
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
  type: 'success' // success, error, warning, info
});

// Ícones dinâmicos do Toast baseados no tipo de aviso
const toastIcon = computed(() => {
  switch (toast.value.type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    default: return 'ℹ️';
  }
});

// 3. Funções de Ciclo de Vida & Ações
onMounted(() => {
  // Verifica se o usuário já estava autenticado na sessão anterior
  const session = localStorage.getItem('usuario_logado');
  if (session) {
    try {
      usuarioLogado.value = JSON.parse(session);
      ajustarAbaPadrao();
    } catch (e) {
      localStorage.removeItem('usuario_logado');
    }
  }

  // Verifica preferência de alto contraste salva
  const contrastPref = localStorage.getItem('alto_contraste');
  if (contrastPref === 'true') {
    highContrast.value = true;
  }
});

// Direciona para a aba correta com base no perfil ao efetuar login
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

// Alterna o modo de acessibilidade de alto contraste (Onda 2)
const toggleHighContrast = () => {
  highContrast.value = !highContrast.value;
  localStorage.setItem('alto_contraste', highContrast.value.toString());
  showToast({ 
    message: highContrast.value ? "Alto contraste ativado para leitura." : "Alto contraste desativado.", 
    type: 'info' 
  });
};

// Exibe a notificação Toast premium na tela
const showToast = ({ message, type = 'success' }) => {
  toast.value.message = message;
  toast.value.type = type;
  toast.value.visible = true;

  // Fecha automaticamente a notificação após 4 segundos
  setTimeout(() => {
    toast.value.visible = false;
  }, 4000);
};
</script>

<style>
/* 1. RESET GLOBAL E FONTES */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
  background-color: #060813; /* Fundo extremamente escuro e premium */
  color: #f8fafc;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 2. HEADER MODERNO GLASSMORPHISM */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: rgba(11, 15, 30, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
  user-select: none;
}

.logo-icon {
  font-size: 1.6rem;
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: #f8fafc;
}

.plus-symbol {
  color: #10b981;
}

/* MENU DE NAVEGAÇÃO */
.nav-menu {
  display: flex;
  gap: 10px;
}

.nav-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.03);
}

.nav-btn.active {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* AÇÕES DO HEADER */
.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-accessibility {
  background: transparent;
  border: 1px solid #1e293b;
  color: #cbd5e1;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-accessibility:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #f8fafc;
}

.user-session-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 0.85rem;
  color: #94a3b8;
  font-weight: 600;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-logout:hover {
  background: #ef4444;
  color: white;
}

/* 3. CONTEÚDO E FOOTER */
.app-main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.app-footer {
  text-align: center;
  padding: 20px;
  background: #060813;
  color: #475569;
  font-size: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.02);
}

/* 4. TOAST NOTIFICATION PREMIUM */
.toast-notification {
  position: fixed;
  bottom: 25px;
  right: 25px;
  z-index: 5000;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  max-width: 380px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.toast-notification.success {
  background: #064e3b;
  color: #a7f3d0;
  border-left: 5px solid #10b981;
}

.toast-notification.error {
  background: #7f1d1d;
  color: #fecaca;
  border-left: 5px solid #ef4444;
}

.toast-notification.warning {
  background: #78350f;
  color: #fde68a;
  border-left: 5px solid #f59e0b;
}

.toast-notification.info {
  background: #1e1b4b;
  color: #c7d2fe;
  border-left: 5px solid #6366f1;
}

.toast-message {
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.4;
  flex-grow: 1;
}

.toast-close-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.toast-close-btn:hover {
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
