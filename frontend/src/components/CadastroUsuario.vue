<script setup>

import { ref } from 'vue';

const form = ref({
  nome: '',
  tipo_perfil: 'DOADOR',
  empresa: '',
  documento: '', // CPF ou CNPJ para identificação do usuário
  aceitou_termo_juridico: false,
  endereco: { cep: '', bairro: '', logradouro: '', numero: '', complemento: '' }
});

const exibirModalTermos = ref(false);

const aplicarMascaraDocumento = (event) => {
  let valor = event.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos
  if (valor.length > 14) {
    valor = valor.slice(0, 14); // Limita ao máximo de 14 dígitos (CNPJ)
  }

  if (valor.length <= 11) {
    // CPF: 000.000.000-00
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    valor = valor.replace(/^(\d{2})(\d)/, '$1.$2');
    valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    valor = valor.replace(/\.(\d{3})(\d)/, '.$1/$2');
    valor = valor.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
  form.value.documento = valor;
};

const buscarCep = async () => {
  const cep = form.value.endereco.cep.replace(/\D/g, '');
  if (cep.length !== 8) return;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    if (!data.erro) {
      form.value.endereco.bairro = data.bairro;
      form.value.endereco.logradouro = data.logradouro;
    }
  } catch (e) {
    console.error("Erro no CEP");
  }
};

const cadastrar = async () => {
  try {
    // Criamos uma cópia limpa do formulário removendo pontos, traços e barras do documento antes de salvar no banco
    const payloadEnvio = {
      ...form.value,
      documento: form.value.documento.replace(/\D/g, '')
    };

    const response = await fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadEnvio)
    });

    const data = await response.json();

    if (response.ok) {
      alert("Conta criada com sucesso! " + data.message);
      
      // Reseta o formulário para limpar os campos da tela
      form.value = {
        nome: '',
        tipo_perfil: 'DOADOR',
        empresa: '',
        documento: '',
        aceitou_termo_juridico: false,
        endereco: { cep: '', bairro: '', logradouro: '', numero: '', complemento: '' }
      };
    } else {
      alert("Erro ao cadastrar: " + (data.error || "Dados inválidos."));
    }
  } catch (error) {
    console.error("Erro na requisição:", error);
    alert("Erro de conexão: Verifique se o servidor backend está ligado!");
  }
};
</script>

<template>
  <div class="cadastro-wrapper">
    <div class="cadastro-card">
      <h2>Criar Conta - Alimenta+</h2>
      <p class="subtitle">Conectando doadores e ONGs em prol do ODS 2</p>

      <!-- 1. O formulário -->
      <!-- O '@submit.prevent="cadastrar"' escuta o envio do formulário e chama a nossa função de cadastro, impedindo que a página dê F5 automático. -->
      <form @submit.prevent="cadastrar">
        
        <!-- Campo Nome -->
        <div class="form-group">
          <label>Seu Nome</label>
          <input type="text" v-model="form.nome" placeholder="Digite seu nome completo" required />
        </div>

        <!-- Campo Perfil (Doador ou ONG) -->
        <div class="form-group">
          <label>Você é Doador (Mercado/Restaurante) ou ONG (Receptor)?</label>
          <select v-model="form.tipo_perfil" required>
            <option value="DOADOR">Doador (Estabelecimento Comercial)</option>
            <option value="ONG">ONG (Entidade Receptora)</option>
          </select>
        </div>

        <!-- Nome do Estabelecimento -->
        <div class="form-group">
          <label>Nome da Empresa ou da Instituição</label>
          <input type="text" v-model="form.empresa" placeholder="Ex: Supermercado Silva ou Cozinha Comunitária" required />
        </div>

        <!-- Campo CPF ou CNPJ -->
        <div class="form-group">
          <label>CPF ou CNPJ (Identificação)</label>
          <input type="text" v-model="form.documento" @input="aplicarMascaraDocumento" placeholder="000.000.000-00 ou 00.000.000/0000-00" required />
        </div>

        <!-- Endereço com ViaCEP -->
        <div class="form-group">
          <!-- O '@blur="buscarCep"' dispara a nossa busca automática no ViaCEP quando o usuário clica fora do campo CEP -->
          <label>CEP</label>
          <input type="text" v-model="form.endereco.cep" @blur="buscarCep" placeholder="00000-000" required />
        </div>

        <div class="form-group">
          <label>Rua / Logradouro</label>
          <input type="text" v-model="form.endereco.logradouro" placeholder="Preenchido pelo CEP" required />
        </div>

        <div class="form-row">
          <div class="form-group col-6">
            <label>Número</label>
            <input type="text" v-model="form.endereco.numero" placeholder="Nº ou S/N" required />
          </div>
          <div class="form-group col-6">
            <label>Complemento</label>
            <input type="text" v-model="form.endereco.complemento" placeholder="Apto, Bloco, etc." />
          </div>
        </div>

        <div class="form-group">
          <label>Bairro</label>
          <input type="text" v-model="form.endereco.bairro" placeholder="Preenchido pelo CEP" required />
        </div>

        <!-- O Termo de Segurança Jurídica (Onda 1) -->
        <div class="form-group checkbox-group">
  <!-- Removi a tag <label> e coloquei <span>. Isso impede que o clique no link ative o checkbox por engano -->
  <input type="checkbox" id="termo" v-model="form.aceitou_termo_juridico" required />
  <span class="checkbox-text">
    Declaro que li e aceito os 
    <a href="#" @click.prevent="exibirModalTermos = true" class="link-termos">Termos de Segurança Jurídica</a>, 
    assumindo a responsabilidade pela manipulação correta.
  </span>
</div>

        <button type="submit" class="btn-submit">Criar Minha Conta</button>
      </form>
    </div>
  </div>

  <!-- O modal só aparece na tela se exibirModalTermos for TRUE -->
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

    <!-- Botão que muda a variável para FALSE para fechar o modal -->
    <button type="button" @click="exibirModalTermos = false" class="btn-close">Fechar e Voltar</button>
  </div>
</div>

</template>


<style scoped>
/* Centraliza o card de cadastro na tela */
.cadastro-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #0f172a; /* Azul Escuro */
  font-family: sans-serif;
  padding: 20px;
}

/* O cartão com efeito vidro translúcido (Glassmorphism) */
.cadastro-card {
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

.form-row {
  display: flex;
  gap: 15px;
}

.col-6 {
  flex: 1;
}

label {
  color: #cbd5e1;
  font-size: 0.85rem;
  margin-bottom: 8px;
  font-weight: 600;
}

/* Inputs bonitos e modernos */
input, select {
  background: #0f172a;
  border: 1px solid #334155;
  color: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  border-color: #10b981; /* Brilha em verde ao focar */
}

/* Grupo do Checkbox do Termo Jurídico */
.checkbox-group {
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  margin: 25px 0;
}

.checkbox-group input {
  margin-top: 3px;
  cursor: pointer;
}

.checkbox-group label, .checkbox-group .checkbox-text {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #cbd5e1;
  cursor: pointer;
}


/* Botão de Enviar Premium com Gradiente e Efeito Hover */
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

/* Link do Termo Jurídico */
.link-termos {
  color: #10b981;
  text-decoration: underline;
  cursor: pointer;
}

.link-termos:hover {
  color: #3b82f6;
}

/* Fundo escuro semi-transparente que cobre a tela inteira */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.85); /* Fundo escuro */
  backdrop-filter: blur(8px); /* Desfoca tudo que está atrás */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000; /* Garante que fica por cima de tudo */
}

/* O cartão do Modal no centro da tela */
.modal-card {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.modal-card h3 {
  color: #10b981;
  margin-top: 0;
  margin-bottom: 20px;
}

/* Corpo de texto rolável para caso o termo seja grande */
.modal-body {
  color: #cbd5e1;
  font-size: 0.85rem;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto; /* Adiciona scrollbar vertical se o texto passar do tamanho */
  margin-bottom: 25px;
  padding-right: 10px;
}

/* Barra de rolagem estilizada para combinar com o tema */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

/* Botão de Fechar */
.btn-close {
  background: #334155;
  border: none;
  color: #f8fafc;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

.btn-close:hover {
  background: #475569;
}

</style>
