const request = require('supertest');
const express = require('express');

const produtos = [
  { id: 1, nome: 'Bolo de Chocolate', categoria: 'Doce', preco: 10.0, perecivel: true },
  { id: 2, nome: 'Bolacha Club Social', categoria: 'Snacks', preco: 20.0, perecivel: false }
];

const app = express();
app.use(express.json());

// Teste na lógica da rota de produtos
app.put('/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, categoria, preco, perecivel } = req.body;
  
  const produto = produtos.find(p => p.id === parseInt(id));
  if (!produto) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  console.log('Produto antes da atualização:', produto);

  produto.nome = nome;
  produto.categoria = categoria;
  produto.preco = preco;
  produto.perecivel = perecivel;

  console.log('Produto depois da atualização:', produto);

  res.json({ message: 'Produto atualizado com sucesso', produto });
});

describe('Teste de atualização de produto', () => {
  it('deve atualizar um produto existente', async () => {
    const produtoAtualizado = {
      nome: 'Prato Feito de Filé de Frango',
      categoria: 'Refeição Completa',
      preco: 25.0,
      perecivel: true
    };

    const response = await request(app)
      .put('/produtos/1')
      .send(produtoAtualizado);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Produto atualizado com sucesso');
    expect(response.body.produto).toMatchObject(produtoAtualizado);
  });

  it('deve retornar erro 404 se o produto não for encontrado', async () => {
    const produtoAtualizado = {
      nome: 'Produto Inexistente',
      categoria: 'Categoria Inexistente',
      preco: 30.0,
      perecivel: true
    };

    const response = await request(app)
      .put('/produtos/999') // ID inexistente
      .send(produtoAtualizado);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Produto não encontrado');
  });
});
