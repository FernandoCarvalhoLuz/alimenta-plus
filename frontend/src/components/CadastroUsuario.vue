<script setup>
// 1. Importações do Vue
import { ref } from 'vue';

// 2. Definição dos eventos emitidos para o componente pai (App.vue)
const emit = defineEmits(['login-success', 'notify']);

// Controle de qual formulário exibir: 'cadastro' ou 'login'
const abaAtiva = ref('login');

// Estado reativo para o cadastro
const formCadastro = ref({
  nome: '',
  tipo_perfil: 'DOADOR',
  empresa: '',
  documento: '', // CPF ou CNPJ
  aceitou_termo_juridico: false,
  endereco: { cep: '', bairro: '', logradouro: '', numero: '', complemento: '' }
});

// Estado reativo para o login
const formLogin = ref({
  documento: ''
});

const exibirModalTermos = ref(false);

// Máscara dinâmica de digitação para CPF/CNPJ
const aplicarMascara = (event, campo) => {
  let valor = event.target.value.replace(/\D/g, ''); // Remove tudo que não for número
  if (valor.length > 14) valor = valor.slice(0, 14);

  if (valor.length <= 11) {
    // Máscara CPF: 000.000.000-00
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // Máscara CNPJ: 00.000.000/0000-00
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  if (campo === 'cadastro') {
    formCadastro.value.documento = valor;
  } else {
    formLogin.value.documento = valor;
  }
};

// Integração ViaCEP
const buscarCep = async () => {
  const cep = formCadastro.value.endereco.cep.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (!data.erro) {
      formCadastro.value.endereco.bairro = data.bairro;
      formCadastro.value.endereco.logradouro = data.logradouro;
      emit('notify', { message: "Endereço localizado via CEP!", type: 'success' });
    } else {
      emit('notify', { message: "CEP não encontrado.", type: 'warning' });
    }
  } catch (e) {
    emit('notify', { message: "Erro de conexão ao buscar CEP.", type: 'error' });
  }
};

// Cadastro de novo usuário
const realizarCadastro = async () => {
  try {
    const payload = {
      ...formCadastro.value,
      documento: formCadastro.value.documento.replace(/\D/g, '') // Envia documento sanitizado (apenas números)
    };

    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      emit('notify', { message: "Conta criada com sucesso!", type: 'success' });
      // Loga automaticamente o usuário cadastrado
      emit('login-success', data.usuario);
    } else {
      emit('notify', { message: data.error || "Erro ao criar conta.", type: 'error' });
    }
  } catch (error) {
    emit('notify', { message: "Falha de conexão com o servidor.", type: 'error' });
  }
};

// Login de usuário
const realizarLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documento: formLogin.value.documento })
    });

    const data = await response.json();

    if (response.ok) {
      emit('notify', { message: `Bem-vindo de volta, ${data.usuario.nome}!`, type: 'success' });
      emit('login-success', data.usuario);
    } else {
      emit('notify', { message: data.error || "Dados de acesso incorretos.", type: 'error' });
    }
  } catch (error) {
    emit('notify', { message: "Falha de conexão com o servidor.", type: 'error' });
  }
};
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <div class="auth-tabs">
        <button 
          @click="abaAtiva = 'login'" 
          :class="{ active: abaAtiva === 'login' }"
          class="tab-btn">
          Acessar Sistema
        </button>
        <button 
          @click="abaAtiva = 'cadastro'" 
          :class="{ active: abaAtiva === 'cadastro' }"
          class="tab-btn">
          Cadastrar-se
        </button>
      </div>

      <!-- FORMULÁRIO DE LOGIN -->
      <div v-if="abaAtiva === 'login'" class="form-section">
        <h2>Entrar no Alimenta+</h2>
        <p class="subtitle">Conectando alimentos e solidariedade através da tecnologia</p>

        <form @submit.prevent="realizarLogin">
          <div class="form-group">
            <label for="login-doc">CPF ou CNPJ Cadastrado</label>
            <input 
              type="text" 
              id="login-doc"
              v-model="formLogin.documento" 
              @input="aplicarMascara($event, 'login')"
              placeholder="000.000.000-00 ou 00.000.000/0000-00" 
              required 
            />
          </div>
          <button type="submit" class="btn-submit">Acessar Plataforma 🚀</button>
        </form>
      </div>

      <!-- FORMULÁRIO DE CADASTRO -->
      <div v-else class="form-section">
        <h2>Criar Conta</h2>
        <p class="subtitle">Cadastre sua empresa ou instituição de caridade</p>

        <form @submit.prevent="realizarCadastro">
          <div class="form-group">
            <label for="reg-nome">Nome do Responsável</label>
            <input type="text" id="reg-nome" v-model="formCadastro.nome" placeholder="Digite seu nome completo" required />
          </div>

          <div class="form-group">
            <label for="reg-perfil">Tipo de Perfil</label>
            <select id="reg-perfil" v-model="formCadastro.tipo_perfil" required>
              <option value="DOADOR">Doador (Mercado/Restaurante/Padaria)</option>
              <option value="ONG">ONG (Receptora / Cozinha Comunitária)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="reg-empresa">Nome do Estabelecimento / Razão Social</label>
            <input type="text" id="reg-empresa" v-model="formCadastro.empresa" placeholder="Ex: Panificadora Alfa ou Lar Amigo" required />
          </div>

          <div class="form-group">
            <label for="reg-doc">CPF ou CNPJ (Identidade)</label>
            <input 
              type="text" 
              id="reg-doc"
              v-model="formCadastro.documento" 
              @input="aplicarMascara($event, 'cadastro')"
              placeholder="000.000.000-00 ou 00.000.000/0000-00" 
              required 
            />
          </div>

          <div class="form-group">
            <label for="reg-cep">CEP (Preenchimento Automático)</label>
            <input type="text" id="reg-cep" v-model="formCadastro.endereco.cep" @blur="buscarCep" placeholder="00000-000" required />
          </div>

          <div class="form-group">
            <label for="reg-rua">Logradouro / Rua</label>
            <input type="text" id="reg-rua" v-model="formCadastro.endereco.logradouro" placeholder="Logradouro localizado pelo CEP" required />
          </div>

          <div class="form-row">
            <div class="form-group col-6">
              <label for="reg-num">Número</label>
              <input type="text" id="reg-num" v-model="formCadastro.endereco.numero" placeholder="Nº ou S/N" required />
            </div>
            <div class="form-group col-6">
              <label for="reg-comp">Complemento</label>
              <input type="text" id="reg-comp" v-model="formCadastro.endereco.complemento" placeholder="Sala, Apto, etc. (Opcional)" />
            </div>
          </div>

          <div class="form-group">
            <label for="reg-bairro">Bairro</label>
            <input type="text" id="reg-bairro" v-model="formCadastro.endereco.bairro" placeholder="Bairro localizado pelo CEP" required />
          </div>

          <!-- Termo Jurídico -->
          <div class="form-group checkbox-group">
            <input type="checkbox" id="reg-termo" v-model="formCadastro.aceitou_termo_juridico" required />
            <span class="checkbox-text">
              Declaro que li e aceito os 
              <a href="#" @click.prevent="exibirModalTermos = true" class="link-termos">Termos de Segurança Jurídica</a>.
            </span>
          </div>

          <button type="submit" class="btn-submit">Finalizar Cadastro 🌿</button>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL DOS TERMOS JURÍDICOS -->
  <div v-if="exibirModalTermos" class="modal-overlay" @click.self="exibirModalTermos = false">
    <div class="modal-card">
      <h3>Termo de Segurança Jurídica e Responsabilidade</h3>
      
      <div class="modal-body">
        <p><strong>1. DO MARCO LEGAL (LEI Nº 14.016/2020)</strong></p>
        <p>Em conformidade com a legislação brasileira, os doadores de alimentos (comerciais ou industriais) respondem civil e penalmente por danos causados pelos alimentos doados apenas se houver dolo ou negligência grave (contaminação intencional ou manipulação sabidamente inadequada).</p>
        
        <p><strong>2. RESPONSABILIDADE DO DOADOR (RICARDO)</strong></p>
        <p>O doador compromete-se a fornecer apenas alimentos próprios para consumo humano, respeitando os critérios de higiene, integridade da embalagem e armazenamento adequado até o momento da coleta.</p>
  
        <p><strong>3. RESPONSABILIDADE DA ONG RECEPTORA (SANDRA)</strong></p>
        <p>A entidade receptora compromete-se a transportar, armazenar, preparar e distribuir os alimentos de forma estritamente higiênica, mantendo a refrigeração se necessária, isentando o doador de qualquer responsabilidade após a assinatura do recibo de coleta física.</p>
      </div>

      <button type="button" @click="exibirModalTermos = false" class="btn-close">Entendido e Fechar</button>
    </div>
  </div>
</template>

<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
}

.auth-card {
  background: rgba(20, 28, 48, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
}

.auth-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.4);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.tab-btn {
  flex: 1;
  padding: 15px;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #f8fafc;
}

.tab-btn.active {
  color: #10b981;
  background: rgba(20, 28, 48, 0.8);
  border-bottom: 2px solid #10b981;
}

.form-section {
  padding: 30px;
}

h2 {
  color: #10b981;
  font-size: 1.6rem;
  margin-bottom: 5px;
  text-align: center;
}

.subtitle {
  color: #94a3b8;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 25px;
  line-height: 1.4;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.col-6 {
  flex: 1;
}

label {
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 6px;
  text-align: left;
}

input, select {
  background: #0b111e;
  border: 1px solid #1e293b;
  color: #f8fafc;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}

.checkbox-group input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.8rem;
  color: #cbd5e1;
}

.link-termos {
  color: #10b981;
  text-decoration: underline;
  cursor: pointer;
}

.link-termos:hover {
  color: #3b82f6;
}

.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  color: #ffffff;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.btn-submit:hover {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.25);
}

.btn-submit:active {
  transform: translateY(1px);
}

/* Modal overlay & card */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10, 15, 25, 0.9);
  backdrop-filter: blur(6px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 25px;
  width: 90%;
  max-width: 460px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-card h3 {
  color: #10b981;
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-body {
  color: #94a3b8;
  font-size: 0.8rem;
  line-height: 1.5;
  max-height: 250px;
  overflow-y: auto;
  margin-bottom: 20px;
  padding-right: 8px;
  text-align: left;
}

.modal-body::-webkit-scrollbar {
  width: 5px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #1f2937;
  border-radius: 3px;
}

.btn-close {
  background: #1f2937;
  border: none;
  color: #f8fafc;
  padding: 10px;
  border-radius: 6px;
  width: 100%;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #374151;
}
</style>
