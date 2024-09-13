require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:3001', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600, 
  credentials: true, 
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
    return;
  }
  console.log('Conectado ao banco de dados MySQL');
});

app.get('/funcionarios', (req, res) => {
  const query = 'SELECT * FROM funcionarios';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/funcionarios', (req, res) => {
  const { nome, email, telefone, cpf, cargo } = req.body;
  const query = 'INSERT INTO funcionarios (nome, email, telefone, cpf, cargo) VALUES (?, ?, ?, ?, ?)';
  const values = [nome, email, telefone, cpf, cargo];

  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: results.insertId, nome, email, telefone, cpf, cargo });
  });
});

app.put('/funcionarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, cpf, cargo } = req.body;
  const query = 'UPDATE funcionarios SET nome = ?, email = ?, telefone = ?, cpf = ?, cargo = ? WHERE id = ?';
  const values = [nome, email, telefone, cpf, cargo, id];

  db.query(query, values, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Funcionário atualizado com sucesso' });
  });
});

app.delete('/funcionarios/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM funcionarios WHERE id = ?';

  db.query(query, id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Funcionário removido com sucesso' });
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});