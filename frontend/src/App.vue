<template>
  <div id="app">
    <!-- Barra de Navegação Premium (Header) -->
    <header class="app-header">
      <div class="logo-container">
        <span class="logo-icon">🌱</span>
        <span class="logo-text">Alimenta<span class="plus-symbol">+</span></span>
      </div>
      
      <!-- Navegação por Abas (SPA Simplificada para Aprendizado) -->
      <nav class="nav-menu">
        <button 
          @click="currentTab = 'cadastro-usuario'" 
          :class="{ active: currentTab === 'cadastro-usuario' }"
          class="nav-btn">
          Criar Conta
        </button>
        <button 
          @click="currentTab = 'cadastro-doacao'" 
          :class="{ active: currentTab === 'cadastro-doacao' }"
          class="nav-btn">
          Cadastro Expresso (Alimentos)
        </button>
        <button 
          @click="currentTab = 'lista-doacoes'" 
          :class="{ active: currentTab === 'lista-doacoes' }"
          class="nav-btn">
          Painel de Doações (Feed)
        </button>
      </nav>
    </header>

    <!-- Área de Conteúdo Principal -->
    <main class="app-content">
      <!-- v-if / v-else-if gerenciam a renderização condicional em tempo real -->
      <CadastroUsuario v-if="currentTab === 'cadastro-usuario'" />
      <CadastroDoacao v-else-if="currentTab === 'cadastro-doacao'" />
      <ListaDoacoes v-else-if="currentTab === 'lista-doacoes'" />
    </main>
  </div>
</template>

<script setup>
// 1. Importações do Vue e dos Componentes
import { ref } from 'vue';
import CadastroUsuario from './components/CadastroUsuario.vue';
import CadastroDoacao from './components/CadastroDoacao.vue';
import ListaDoacoes from './components/ListaDoacoes.vue';

// 2. Estado Reativo da Aba Atual
// Controla qual tela deve ser renderizada. O padrão é a tela de Cadastro de Usuário.
const currentTab = ref('cadastro-usuario');
</script>

<style>
/* Reset global e estilos base de página */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
  background-color: #0f172a; /* Azul Escuro */
  color: #f8fafc;
}

/* Barra de Navegação com Efeito de Vidro (Glassmorphism) */
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 40px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.3rem;
  font-weight: bold;
  color: #f8fafc;
}

.plus-symbol {
  color: #10b981; /* Verde característico */
}

/* Menu de Abas */
.nav-menu {
  display: flex;
  gap: 10px;
}

.nav-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.03);
}

/* Estado Ativo das Abas (Destaque Verde) */
.nav-btn.active {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

/* Conteúdo Principal */
.app-content {
  min-height: calc(100vh - 70px);
}
</style>
