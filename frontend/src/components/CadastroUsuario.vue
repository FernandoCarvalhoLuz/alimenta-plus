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
  email: '',
  senha: '',
  tipo_perfil: 'DOADOR',
  empresa: '',
  documento: '', // CPF ou CNPJ
  aceitou_termo_juridico: false,
  endereco: { cep: '', bairro: '', logradouro: '', numero: '', complemento: '' }
});

// Estado reativo para o login
const formLogin = ref({
  email: '',
  senha: ''
});

const exibirModalTermos = ref(false);

// Máscara dinâmica de digitação para CPF/CNPJ
const aplicarMascara = (event) => {
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

  formCadastro.value.documento = valor;
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
      body: JSON.stringify({ email: formLogin.value.email, senha: formLogin.value.senha })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('token', data.token); // Salva o token
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
            <label for="login-email">E-mail Cadastrado</label>
            <input 
              type="email" 
              id="login-email"
              v-model="formLogin.email" 
              placeholder="seu@email.com" 
              required 
            />
          </div>
          <div class="form-group">
            <label for="login-senha">Senha</label>
            <input 
              type="password" 
              id="login-senha"
              v-model="formLogin.senha" 
              placeholder="Digite sua senha secreta" 
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
            <label for="reg-email">E-mail de Acesso</label>
            <input type="email" id="reg-email" v-model="formCadastro.email" placeholder="seu@email.com" required />
          </div>

          <div class="form-group">
            <label for="reg-senha">Criar Senha Segura</label>
            <input type="password" id="reg-senha" v-model="formCadastro.senha" placeholder="No mínimo 6 caracteres" minlength="6" required />
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
              @input="aplicarMascara($event)"
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
  padding: 30px 20px;
}

/* Card Branco com Borda Suave Sand */
.auth-card {
  background: #faf7f2;
  border: 1px solid rgba(220, 205, 185, 0.4);
  border-radius: 24px; /* Mais arredondado / orgânico */
  width: 100%;
  max-width: 480px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(220, 205, 185, 0.25);
}

.auth-tabs {
  display: flex;
  background: #f5efe6;
  border-bottom: 1px solid rgba(220, 205, 185, 0.3);
}

.tab-btn {
  flex: 1;
  padding: 15px;
  background: transparent;
  border: none;
  font-family: 'Quicksand', sans-serif;
  color: #64748b;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: #ea580c;
  background: rgba(249, 115, 22, 0.03);
}

.tab-btn.active {
  color: #ea580c;
  background: #faf7f2;
  border-bottom: 3px solid #f97316;
}

.form-section {
  padding: 35px;
}

h2 {
  color: #ea580c;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 5px;
  text-align: center;
}

.subtitle {
  color: #64748b;
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
  color: #475569;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 6px;
  text-align: left;
}

input, select {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #1e293b;
  padding: 11px 15px;
  border-radius: 12px; /* Arredondado amigável */
  font-size: 0.9rem;
  font-family: 'Quicksand', sans-serif;
  outline: none;
  transition: all 0.2s ease;
}

input:focus, select:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin: 20px 0;
}

.checkbox-group input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #f97316;
}

.checkbox-text {
  font-size: 0.85rem;
  color: #475569;
}

.link-termos {
  color: #ea580c;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 600;
}

.link-termos:hover {
  color: #c2410c;
}

/* Botão Encorpado Laranja-Solar */
.btn-submit {
  width: 100%;
  background: linear-gradient(135deg, #f97316, #facc15);
  color: #ffffff;
  font-family: 'Quicksand', sans-serif;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.2);
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.3);
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
  background: rgba(30, 25, 20, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-card {
  background: #ffffff;
  border: 1px solid rgba(220, 205, 185, 0.5);
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(30, 25, 20, 0.15);
}

.modal-card h3 {
  color: #ea580c;
  font-size: 1.25rem;
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-body {
  color: #475569;
  font-size: 0.85rem;
  line-height: 1.6;
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
  background: #ede6db;
  border-radius: 3px;
}

.btn-close {
  background: #f5efe6;
  border: none;
  font-family: 'Quicksand', sans-serif;
  color: #1e293b;
  padding: 12px;
  border-radius: 8px;
  width: 100%;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #ede6db;
}
</style>
