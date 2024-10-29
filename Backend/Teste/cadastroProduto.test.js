const request = require('supertest');
const express = require('express');

const produtos = [];

const app = express();
app.use(express.json());

// Simulação da rota de cadastro de produto
app.post('/produtos', (req, res) => {
  const produtoData = req.body;
  const novoProduto = { id_produto: produtos.length + 1, ...produtoData };

  produtos.push(novoProduto);
  console.log('Produto cadastrado:', novoProduto);

  res.status(201).json(novoProduto);
});

describe('Teste de Cadastro de Produto Simplificado', () => {
  it('deve cadastrar um produto e retornar os dados do produto cadastrado', async () => {
    const produtoData = {
      nome_p: 'Bolo de Chocolate',
      categoria: 'Doces',
      preco: 10.00,
      perecivel: true,
      descricao: 'Bolo de pote sabor chocolate',
      unidade_medida: 'Gramas'
    };

    const response = await request(app)
      .post('/produtos')
      .send(produtoData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id_produto');
    expect(response.body).toHaveProperty('nome_p', produtoData.nome_p);
    expect(response.body).toHaveProperty('categoria', produtoData.categoria);
    expect(response.body).toHaveProperty('preco', produtoData.preco);
    expect(response.body).toHaveProperty('perecivel', produtoData.perecivel);
    expect(response.body).toHaveProperty('descricao', produtoData.descricao);
    expect(response.body).toHaveProperty('unidade_medida', produtoData.unidade_medida);

    console.log('Produtos cadastrados:', produtos);
  });
});