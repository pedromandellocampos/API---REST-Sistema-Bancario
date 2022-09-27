const express = require("express");
const rotas = express();

const {
	listarContas,
	criarConta,
	atualizarUsuarioConta,
	deletarConta,
	depositar,
	sacar,
	transferir,
	apresentarSaldo,
	apresentarExtrato,
} = require("./controladores/contas.js");

const {
	validarSenhaBanco,
	validarConteudoRecebido,
	validarSeRepetido,
	validarSeParamNumero,
	validarSeContaSenhaPresentes,
	validarQuerySenha,
	validarSeQueryPresentes,
	validarSeExisteConta,
} = require("./intermediarios");

//metodos GET
rotas.get("/contas", validarSenhaBanco, listarContas);
rotas.get(
	"/contas/saldo",
	validarSeContaSenhaPresentes,
	validarSeParamNumero,
	validarSeExisteConta,
	validarQuerySenha,
	apresentarSaldo
);
rotas.get(
	"/contas/extrato",
	validarSeContaSenhaPresentes,
	validarSeParamNumero,
	validarSeExisteConta,
	validarQuerySenha,
	apresentarExtrato
);

//metodos post
rotas.post("/contas", validarConteudoRecebido, validarSeRepetido, criarConta);
rotas.post("/transacoes/depositar", depositar);
rotas.post("/transacoes/sacar", sacar);
rotas.post("/transacoes/transferir", transferir);

//metodos PUT
rotas.put(
	"/contas/:numeroConta/usuario",
	validarSeParamNumero,
	//validarConteudoRecebido,
	validarSeRepetido,
	atualizarUsuarioConta
);

//metodos DELETE
rotas.delete("/contas/:numeroConta", validarSeParamNumero, deletarConta);

module.exports = rotas;
