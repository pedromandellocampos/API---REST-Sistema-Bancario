const { format } = require("date-fns");
const bancoDeDados = require("../bancodedados/bancodedados.js");
const {
	validadorSePresentes,
	retornarConta,
	validarSenha,
	localizarTransacoes,
	criarData,
	temSaldo,
	existeConta,
	estaCorretoValor,
} = require("./funcoes-utilitarias.js");
const contasBancarias = bancoDeDados.contas;

let controladorId = 1;

// todas funcoes foram criadas para serem async, em caso de alguma
//implementacao superveniente exigir o retorno de parametros que precisam ser
//aguardados.

async function listarContas(req, res) {
	let mensagem = null;

	if (contasBancarias < 1) {
		mensagem = "Usuário ainda não possui conta";
	} else {
		mensagem = contasBancarias;
	}
	res.status(200).json(mensagem);
}

//PENDENTE: VALIDACAO DOS NUMEROS INDICADOS SE SAO NUMEROS OU STRING
async function criarConta(req, res) {
	const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

	const novaConta = {
		numero: controladorId++,
		saldo: 0,
		usuario: {
			nome,
			cpf,
			data_nascimento,
			telefone,
			email,
			senha,
		},
	};

	contasBancarias.push(novaConta);

	return res.status(201).json({ mensagem: "Conta criada com sucesso" });
}

//PENDENTE: VALIDACAO DOS NUMEROS INDICADOS SE SAO NUMEROS OU STRING
//PENDENTE:  validacao do numero indicado na url
async function atualizarUsuarioConta(req, res) {
	//incluir validações = Se existe, se os valores informados estão no formato correto.
	// Se não repete deve ser em uma função distinta.

	const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

	const contaAlterada = retornarConta(req.params.numeroConta);

	contaAlterada.usuario.nome = nome;
	contaAlterada.usuario.cpf = cpf;
	contaAlterada.usuario.data_nascimento = data_nascimento;
	contaAlterada.usuario.telefone = telefone;
	contaAlterada.usuario.email = email;
	contaAlterada.usuario.senha = senha;

	return res.status(204).json();
}

// PENDENTE: fazer controle do numero indicado no parametro como um intermediario
async function deletarConta(req, res) {
	const contaExcluida = retornarConta(req.params.numeroConta);

	if (!existeConta(res, contaExcluida)) {
		return;
	}

	if (contaExcluida.saldo !== 0) {
		return res.status(403).json({
			mensagem: "Não é possível excluir contas com saldo igual a R$ 0,00",
		});
	}

	contasBancarias.splice(
		contasBancarias.findIndex((conta) => {
			return conta === contaExcluida;
		}),
		1
	);
	return res.status(204).json();
}

//PENDENTE criar uma função para evitar repetição da validação.
async function depositar(req, res) {
	const { numero_conta, valor } = req.body;

	if (!validadorSePresentes(res, { numero_conta, valor })) {
		return;
	}

	if (!validadorSeContasNumero(res, numero_conta)) {
		return;
	}

	if (!estaCorretoValor(res, valor)) {
		return;
	}

	const contaDepositada = retornarConta(numero_conta);

	if (!existeConta(contaDepositada)) {
		return;
	}

	if (Number(valor) <= 0) {
		return res.status(400).json({
			mensagem: "O valor depositado não pode ser menor ou igual a 0",
		});
	}

	const data = criarData();

	const transacao = {
		data,
		numero_conta,
		valor,
	};

	bancoDeDados.depositos.push(transacao);

	contaDepositada.saldo += Number(valor);

	return res.status(204).json();
}

//PENDENTE criar uma função para evitar repetição da validação.
async function sacar(req, res) {
	const { numero_conta, senha, valor } = req.body;

	if (!validadorSePresentes(res, { numero_conta, valor, senha })) {
		return;
	}

	if (!validadorSeContasNumero(res, numero_conta)) {
		return;
	}

	if (!estaCorretoValor(res, valor)) {
		return;
	}

	const contaSacada = retornarConta(numero_conta);

	if (!existeConta(res, contaSacada)) {
		return;
	}

	if (!validarSenha(res, senha, conta)) {
		return;
	}

	if (!temSaldo(res, contaSacada, valor)) {
		return;
	}

	const data = criarData();

	const transacao = {
		data,
		numero_conta,
		valor,
	};

	bancoDeDados.saques.push(transacao);

	contaSacada.saldo -= Number(valor);

	return res.status(204).json();
}

async function transferir(req, res) {
	const { numero_conta_origem, numero_conta_destino, valor, senha } =
		req.body;

	let presente = validadorSePresentes(res, {
		numero_conta_origem,
		numero_conta_destino,
		valor,
		senha,
	});

	if (!presente) {
		return;
	}

	const contaOrigem = retornarConta(numero_conta_origem);
	const contaDestino = retornarConta(numero_conta_destino);

	if (!existeConta(res, contaOrigem)) {
		return;
	}

	if (!existeConta(res, contaDestino)) {
		return;
	}

	if (!validarSenha(res, senha, contaOrigem)) {
		return;
	}

	if (!temSaldo(res, contaOrigem.saldo, valor)) {
		return;
	}

	contaOrigem.saldo -= valor;
	contaDestino.saldo += valor;

	const data = criarData();

	const transacao = {
		data,
		numero_conta_origem,
		numero_conta_destino,
		valor,
	};

	bancoDeDados.transferencias.push(transacao);

	return res.status(204).json();
}

async function apresentarSaldo(req, res) {
	const { numero_conta } = req.query;

	if (!validadorSePresentes(res, { numero_conta })) {
		return;
	}

	const contaSelecionada = retornarConta(numero_conta);

	if (!existeConta(res, contaSelecionada)) {
		return;
	}

	const { saldo } = contaSelecionada;

	return res.status(200).json({ saldo });
}

async function apresentarExtrato(req, res) {
	const { numero_conta } = req.query;

	if (!validadorSePresentes(res, { numero_conta })) {
		return;
	}

	let { saques, depositos, transferencias } = bancoDeDados;

	saques = localizarTransacoes(saques, numero_conta) ?? [];
	depositos = localizarTransacoes(depositos, numero_conta) ?? [];
	transferencias = localizarTransacoes(transferencias, numero_conta) ?? [];

	return res.status(200).json({ saques, depositos, transferencias });
}

module.exports = {
	listarContas,
	criarConta,
	atualizarUsuarioConta,
	deletarConta,
	depositar,
	sacar,
	transferir,
	apresentarSaldo,
	apresentarExtrato,
};
