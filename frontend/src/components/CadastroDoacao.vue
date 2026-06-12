<script setup>
// 1. Importações do Vue
import { ref, onMounted } from 'vue';

// 2. Estado Reativo do Formulário de Doação
const form = ref({
  doador_id: '',
  titulo: '',
  categoria: 'Panificação', // Valor padrão inicial
  quantidade: '',
  instrucoes_retirada: ''
});

// Lista de doadores cadastrados para exibir no dropdown de simulação/teste
const doadores = ref([]);
const carregandoDoadores = ref(true);

// Carrega a lista de usuários do backend e filtra aqueles que são "DOADOR"
const carregarDoadores = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/usuarios');
    const data = await response.json();
    if (response.ok) {
      // Filtra apenas usuários do tipo DOADOR
      doadores.value = data.filter(u => u.tipo_perfil === 'DOADOR');
      
      // Se houver algum doador gravado no localStorage (o último que se cadastrou)
      const ultimoDoadorId = localStorage.getItem('ultimo_doador_id');
      if (ultimoDoadorId && doadores.value.some(d => d._id === ultimoDoadorId)) {
        form.value.doador_id = ultimoDoadorId;
      } else if (doadores.value.length > 0) {
        // Caso contrário, seleciona o primeiro da lista como padrão
        form.value.doador_id = doadores.value[0]._id;
      }
    }
  } catch (error) {
    console.error("Erro ao carregar doadores:", error);
  } finally {
    carregandoDoadores.value = false;
  }
};

// 3. Executado assim que o componente é montado na tela
onMounted(() => {
  carregarDoadores();
});

// 4. Função para cadastrar a doação via API POST
const cadastrarDoacao = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/doacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Sucesso: Alimento cadastrado expressamente para doação!");
      
      // Salva no localStorage para manter a seleção do doador ativa
      localStorage.setItem('ultimo_doador_id', form.value.doador_id);

      // Reseta os campos de preenchimento, mas mantém o doador selecionado
      form.value.titulo = '';
      form.value.quantidade = '';
      form.value.instrucoes_retirada = '';
    } else {
      alert("Erro ao publicar doação: " + (data.error || "Verifique os dados informados."));
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro de conexão: Verifique se o servidor backend está online.");
  }
};
</script>

<template>
  <div class="doacao-wrapper">
    <div class="doacao-card">
      <h2>Cadastro Expresso de Alimentos</h2>
      <p class="subtitle">Publique sobras e excedentes de comida em menos de 2 minutos</p>

      <!-- Se não houver doadores na base de dados, avisa o usuário para criar um primeiro -->
      <div v-if="!carregandoDoadores && doadores.length === 0" class="alert-box warning">
        Nenhum Doador cadastrado no banco. Por favor, acesse a aba "Criar Conta" e cadastre um Doador primeiro!
      </div>

      <form v-else @submit.prevent="cadastrarDoacao">
        
        <!-- Campo de seleção do Doador (Simula o Usuário logado) -->
        <div class="form-group">
          <label>Identificação do Doador (Simulação)</label>
          <select v-model="form.doador_id" required>
            <option v-for="d in doadores" :key="d._id" :value="d._id">
              {{ d.nome }} ({{ d.empresa }})
            </option>
          </select>
          <small class="helper-text">Seleciona qual estabelecimento parceiro está anunciando este alimento.</small>
        </div>

        <!-- Título do Item -->
        <div class="form-group">
          <label>O que está doando? (Título Curto)</label>
          <input type="text" v-model="form.titulo" placeholder="Ex: 15 Pães de Sal, 5kg de Bananas" required />
        </div>

        <!-- Categoria do Alimento -->
        <div class="form-group">
          <label>Categoria</label>
          <select v-model="form.categoria" required>
            <option value="Panificação">Panificação / Padaria</option>
            <option value="Hortifrúti">Hortifrúti (Frutas/Legumes)</option>
            <option value="Marmitas">Refeições Prontas / Marmitas</option>
            <option value="Laticínios">Laticínios e Frios</option>
            <option value="Mercearia">Mercearia (Não perecíveis)</option>
            <option value="Outros">Outros</option>
          </select>
        </div>

        <!-- Quantidade -->
        <div class="form-group">
          <label>Quantidade e Embalagem</label>
          <input type="text" v-model="form.quantidade" placeholder="Ex: 5 sacolas, 10kg, 12 potes" required />
        </div>

        <!-- Instruções Logísticas de Retirada (Requisito Especial) -->
        <div class="form-group">
          <label>Instruções de Retirada (Logística)</label>
          <textarea 
            v-model="form.instrucoes_retirada" 
            placeholder="Ex: Entrar pelo portão de carga na rua lateral. Procurar por Cláudia na expedição." 
            rows="3"
            required>
          </textarea>
          <small class="helper-text">Essas instruções ajudam os voluntários da ONG a coletar o item sem confusão.</small>
        </div>

        <button type="submit" class="btn-submit">Publicar Doação Expresso 🚀</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Centraliza o card na tela */
.doacao-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #0f172a; /* Azul Escuro */
  font-family: sans-serif;
  padding: 20px;
}

/* Cartão com efeito vidro translúcido */
.doacao-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

h2 {
  color: #10b981; /* Verde Alimenta+ */
  margin-bottom: 5px;
  text-align: center;
}

.subtitle {
  color: #94a3b8;
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 30px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

label {
  color: #cbd5e1;
  font-size: 0.85rem;
  margin-bottom: 8px;
  font-weight: 600;
}

input, select, textarea {
  background: #0f172a;
  border: 1px solid #334155;
  color: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  font-family: sans-serif;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  border-color: #10b981; /* Brilha verde */
}

.helper-text {
  color: #64748b;
  font-size: 0.75rem;
  margin-top: 5px;
}

.alert-box {
  padding: 15px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 25px;
  text-align: center;
}

.alert-box.warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid #f59e0b;
  color: #f59e0b;
}

.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  border: none;
  color: white;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
}

.btn-submit:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-submit:active {
  transform: translateY(1px);
}
</style>
