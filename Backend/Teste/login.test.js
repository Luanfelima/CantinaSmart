const request = require('supertest');
const express = require('express');

const usuarios = [
  { email: 'joao.silva@example.com', senha: '12345678p' },
];

const app = express();
app.use(express.json());

// Simulação da rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  console.log('Tentativa de login:', { email, senha });

  // Verifica se as credenciais estão no "banco de dados" (array de usuários)
  const usuario = usuarios.find(user => user.email === email && user.senha === senha);

  if (usuario) {
    res.status(200).json({ token: 'cantinas344527' });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

describe('Teste de Login Simplificado', () => {
  it('deve retornar um token para credenciais válidas', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'joao.silva@example.com', senha: '12345678p' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('deve retornar erro 401 para credenciais inválidas', async () => {
    const response = await request(app)
      .post('/login')
      .send({ email: 'joao.silva@example.com', senha: '12345678' });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Credenciais inválidas');
  });
});