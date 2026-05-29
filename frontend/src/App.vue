<template>
  <div id="app">
    <!-- 1. Desenhamos o componente de cadastro na tela -->
    <CadastroUsuario />
  </div>
</template>

<script setup>
// 2. Importamos o componente que você acabou de criar
import CadastroUsuario from './components/CadastroUsuario.vue';


</script>

<style>
/* 3. Resetamos a margem e a cor de fundo do navegador para encaixar o layout escuro */
body {
  margin: 0;
  padding: 0;
  background-color: #0f172a;
}
</style>
