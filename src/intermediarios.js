const { isLastDayOfMonth } = require("date-fns");
const contasBancarias = require("./bancodedados/bancodedados.js");
const {
	validarSenha,
	retornarConta,
	validadorSePresentes,
	existeConta,
	estaCorretoCPF,
	estaCorretoEmail,
} = require("./controladores/funcoes-utilitarias.js");

//verificar se a senha passada no parametro query da url está correta.
//se não estiver, encerra a execução e não passa para o proximo controlador.

async function validarSenhaBanco(req, res, next) {
	if (!validadorSePresente(res, req.query.senha_banco)) {
		return;
	}

	if (req.query.senha_banco !== contasBancarias.banco.senha) {
		return res.status(403).json({ message: "Senha incorreta" });
	}

	next();
}

async function validarConteudoRecebido(req, res, next) {
	const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

	const presentes = validadorSePresentes(res, {
		nome,
		data_nascimento,
		telefone,
		email,
		cpf,
		senha,
	});

	if (!presentes) {
		return;
	}

	if (!estaCorretoCPF(res, cpf)) {
		return;
	}

	if (!estaCorretoEmail(res, email)) {
		return;
	}

	next();
}

// validar se existe contas com o mesmo cpf ou email.
// diferencia para situacoes em que se deve criar uma conta ou alterar uma conta.
// nos casos em que se altera a conta, a propria conta nao deve ser levada em
// consideracao
async function validarSeRepetido(req, res, next) {
	const { cpf, email } = req.body;
	let demaisContas = null;

	if (req.params.numeroConta) {
		demaisContas = contasBancarias.contas.filter((conta) => {
			return conta.numero !== Number(req.params.numeroConta);
		});
	} else {
		demaisContas = contasBancarias.contas;
	}

	if (
		demaisContas.some((conta) => {
			return conta.usuario.cpf === cpf || conta.usuario.email === email;
		})
	) {
		return res.status(400).json({
			mensagem: "Já existe uma conta com o cpf ou e-mail informados!",
		});
	}

	next();
}

async function validarSeParamNumero(req, res, next) {
	const id = numeroConta ?? numero_conta;

	if (!validarSeContasNumero(res, id)) {
		return;
	}

	next();
}

async function validarSePresentes(req, res, next) {
	const { numero_conta_origem, numero_conta_destino, valor, senha } =
		req.body;

	if (
		!validadorSePresentes(res, {
			numero_conta_origem,
			numero_conta_destino,
			valor,
			senha,
		})
	) {
		return;
	}

	next();
}

async function validarQuerySenha(req, res, next) {
	const { numero_conta, senha } = req.query;
	const conta = retornarConta(numero_conta);

	validarSenha(res, senha, conta);

	next();
}

async function validarSeExisteConta(req, res, next) {
	const { numero_conta } = req.query;
	const conta = retornarConta(numero_conta);

	if (!existeConta(res, conta)) {
		return;
	}
	next();
}

async function validarSeContaSenhaPresentes(req, res, next) {
	const { numero_conta: numeroConta, senha } = req.query;

	let presente = validadorSePresentes(res, { numeroConta, senha });

	if (!presente) {
		return;
	}

	next();
}

module.exports = {
	validarSenhaBanco,
	validarConteudoRecebido,
	validarSeRepetido,
	validarSeParamNumero,
	validarSePresentes,
	validarQuerySenha,
	validarSeContaSenhaPresentes,
	validarSeExisteConta,
};
