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

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
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
//------------------------------------------------------------------------------------------------------------------------------------
app.get('/produtos', (req, res) => {
  const query = 'SELECT * FROM produtos';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/produtos', (req, res) => {
  const { nome_p, categoria, preco, perecivel, descricao, unidade_medida } = req.body;

  const query = 'INSERT INTO produtos (nome_p, categoria, preco, perecivel, descricao, unidade_medida) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nome_p, categoria, preco, perecivel, descricao, unidade_medida];

  db.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: results.insertId });
  });
});

app.put('/produtos/:id_produto', (req, res) => {
  const { id_produto } = req.params;
  const { nome_p, categoria, preco, perecivel, descricao, unidade_medida } = req.body;
  
  const query = 'UPDATE produtos SET nome_p = ?, categoria = ?, preco = ?, perecivel = ?, descricao = ?, unidade_medida = ? WHERE id_produto = ?';
  const values = [nome_p, categoria, preco, perecivel, descricao, unidade_medida, id_produto];

  db.query(query, values, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Produto atualizado com sucesso' });
  });
});

app.delete('/produtos/:id_produto', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM produtos WHERE id_produto = ?';

  db.query(query, id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Produto removido com sucesso' });
  });
});
//------------------------------------------------------------------------------------------------------------------------------------
app.get('/categorias', (req, res) => {
  const query = 'SELECT * FROM categorias';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/categorias', (req, res) => {
  const { nome, descricao } = req.body;
  const query = 'INSERT INTO categorias (nome, descricao) VALUES (?, ?)';
  const values = [nome, descricao];

  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: results.insertId, nome, descricao });
  });
});

app.put('/categorias/:id_categoria', (req, res) => {
  const { id_categorias } = req.params;
  const { nome, descricao } = req.body;
  const query = 'UPDATE produtos SET nome = ?, descricao = ? WHERE id_categorias = ?';
  const values = [id_categorias, nome, descricao];

  db.query(query, values, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Categoria atualizada com sucesso' });
  });
});

app.delete('/categorias/:id_categorias', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM produtos WHERE id_categorias = ?';

  db.query(query, id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Categorias removido com sucesso' });
  });
});
//------------------------------------------------------------------------------------------------------------------------------------
app.get('/unidades', (req, res) => {
  const query = 'SELECT * FROM unidades';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/unidades', (req, res) => {
  const { polo, nome_unidade, cep, cidade, rua, estado, numero, complemento } = req.body;
  const query = 'INSERT INTO unidades (polo, nome_unidade, cep, cidade, rua, estado, numero, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [polo, nome_unidade, cep, cidade, rua, estado, numero, complemento];

  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id: results.insertId, polo, nome_unidade, cep, cidade, rua, estado, numero, complemento });
  });
});

app.put('/unidades/:id_unidade', (req, res) => {
  const { id_unidade } = req.params;
  const { polo, nome_unidade, cep, cidade, rua, estado, numero, complemento } = req.body;
  const query = 'UPDATE unidades SET polo = ?, nome_unidade = ?, cep = ?, cidade = ?, rua = ?, estado = ?, numero = ?, complemento = ? WHERE id_unidade = ?';
  const values = [polo, nome_unidade, cep, cidade, rua, estado, numero, complemento, id_unidade];

  db.query(query, values, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Unidade atualizada com sucesso' });
  });
});

app.delete('/unidades/:id_unidade', (req, res) => {
  const { id_unidade } = req.params;
  const query = 'DELETE FROM unidades WHERE id_unidade = ?';

  db.query(query, [id_unidade], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Unidade removida com sucesso' });
  });
});
