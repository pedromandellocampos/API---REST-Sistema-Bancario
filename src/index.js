const express = require("express");
const app = express();
const rotas = require("./rotas.js");

app.use(express.json());
app.use(rotas);

app.listen(8000);
