const bancoDeDados = require("../bancodedados/bancodedados.js");
const contasBancarias = bancoDeDados.contas;
const { format } = require("date-fns");

function criarData() {
	return format(new Date(), "yyyy-MM-dd HH:mm:ss");
}

function estaCorretoCPF(res, cpf) {
	if (isNaN(Number(cpf))) {
		res.status(400).json({ mensagem: "CPF deve contar apenas numeros" });
		return false;
	} else if (String(cpf).length !== 11) {
		console.log(String(cpf).length);
		res.status(400).json({ mensagem: "Digite um cpf válido" });
		return false;
	} else {
		return true;
	}
}

function estaCorretoEmail(res, email) {
	if (!email.includes("@") || !email.includes(".com")) {
		res.status(400).json({ mensagem: "Email invalido" });
		return false;
	}
	return true;
}

function estaCorretoValor(res, valor) {
	if (isNaN(Number(valor))) {
		res.status(400).json({
			mensagem: "Valor invalido. Digite apenas numeros",
		});
		return false;
	}
	return true;
}

function existeConta(res, conta) {
	if (!conta) {
		res.status(404).json({ mensagem: "Conta não localizada" });
		return false;
	}
	return true;
}

function localizarTransacoes(array, identificador) {
	return array.filter((transferencia) => {
		return (
			Number(transferencia.numero_conta) === Number(identificador) ||
			Number(transferencia.numero_conta_origem) ===
				Number(identificador) ||
			Number(transferencia.numero_conta_destino) === Number(identificador)
		);
	});
}

//recebe um id, localiza a conta com base no id fornecido
// e retorna a conta se existir ou undefined se não existir
function retornarConta(id) {
	const resultado = contasBancarias.find((conta) => {
		return Number(conta.numero) === Number(id);
	});
	return resultado;
}

//valida a senha informada com a senha da conta. Retorna um boolean
function temSaldo(res, conta, valorRetirado) {
	if (Number(conta.saldo) < Number(valorRetirado)) {
		res.status(403).json({ mensagem: "Saldo insuficiente." });
		return false;
	}
	return true;
}

function validarSenha(res, senha, conta) {
	if (senha !== conta.usuario.senha) {
		res.status(403).json({ mensagem: "Senha incorreta" });
		return false;
	}
	return true;
}

function validadorSePresentes(res, objeto) {
	const nomeVariavel = Object.keys(objeto);
	let existeItem = true;
	let i = 0;

	for (let item in objeto) {
		if (!objeto[item]) {
			existeItem = false;
			break;
		}
		i++;
	}

	if (!existeItem) {
		res.status(400).json({
			mensagem: `O item ${nomeVariavel[i]} devem ser preenchido`,
		});
		return false;
	}

	return true;
}

function validarSeContasNumero(res, id) {
	if (isNaN(Number(id))) {
		res.status(400).json({
			mensagem: "Conta invalida. Digite apenas numeros",
		});
		return false;
	}
	return true;
}

module.exports = {
	validadorSePresentes,
	retornarConta,
	validarSenha,
	existeConta,
	localizarTransacoes,
	temSaldo,
	criarData,
	estaCorretoCPF,
	estaCorretoEmail,
	validarSeContasNumero,
	estaCorretoValor,
};
