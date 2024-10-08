require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Express app setup
const app = express();
app.use(express.json());

// CORS Configuration
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

// Log's para o Database connection
console.log('Tentando conectar ao banco de dados com as seguintes configurações:');
console.log('Host:', process.env.DB_HOST);
console.log('Usuário:', process.env.DB_USER);
console.log('Banco de Dados:', process.env.DB_NAME);

// Database connection
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

// Middleware para autenticação via token JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('Authorization Header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, gestor) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    req.gestor = gestor;
    next();
  });
}

// Middleware para autorizar o gestor a acessar uma unidade específica
function authorizeUnidade(req, res, next) {
  const { id_unidade } = req.params;
  const cpf_gestor = req.gestor.cpf_gestor;

  const query = 'SELECT * FROM unidade_gestor WHERE id_unidade = ? AND cpf_gestor = ?';

  db.query(query, [id_unidade, cpf_gestor], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'Acesso negado: Gestor não autorizado para esta unidade' });
    }

    next();
  });
}

// Middleware para autorizar acesso a um funcionário específico
function authorizeFuncionario(req, res, next) {
  const { id_func } = req.params;
  const cpf_gestor = req.gestor.cpf_gestor;

  const query = 'SELECT * FROM funcionario_gestor WHERE id_func = ? AND cpf_gestor = ?';

  db.query(query, [id_func, cpf_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao acessar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'Acesso negado: Gestor não autorizado para este funcionário' });
    }

    next();
  });
}

// Start server
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

// ----------------------------------- Rotas de Funcionários -----------------------------------
app.get('/funcionarios', authenticateToken, (req, res) => {
  const cpf_gestor = req.gestor.cpf_gestor;

  const query = `
    SELECT f.*
    FROM funcionarios f
    INNER JOIN funcionario_gestor fg ON f.id_func = fg.id_func
    WHERE fg.cpf_gestor = ?
  `;

  db.query(query, [cpf_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionários:', err);
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

app.post('/funcionarios', authenticateToken, (req, res) => {
  const cpf_gestor = req.gestor.cpf_gestor;
  const { nome, email, telefone, cpf, cargo } = req.body;

  const query = 'INSERT INTO funcionarios (nome, email, telefone, cpf, cargo) VALUES (?, ?, ?, ?, ?)';
  const values = [nome, email, telefone, cpf, cargo];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir funcionário:', err);
      return res.status(500).json({ error: err.message });
    }
    const id_func = results.insertId;

    // Inserir na tabela funcionario_gestor
    const query_fg = 'INSERT INTO funcionario_gestor (id_func, cpf_gestor) VALUES (?, ?)';
    db.query(query_fg, [id_func, cpf_gestor], (err) => {
      if (err) {
        console.error('Erro ao inserir na tabela funcionario_gestor:', err);
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id_func, nome, email, telefone, cpf, cargo });
    });
  });
});

app.put('/funcionarios/:id_func', authenticateToken, authorizeFuncionario, (req, res) => {
  const { id_func } = req.params;
  const { nome, email, telefone, cpf, cargo } = req.body;

  const query = 'UPDATE funcionarios SET nome = ?, email = ?, telefone = ?, cpf = ?, cargo = ? WHERE id_func = ?';
  const values = [nome, email, telefone, cpf, cargo, id_func];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar funcionário:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Funcionário atualizado com sucesso' });
  });
});

app.delete('/funcionarios/:id_func', authenticateToken, authorizeFuncionario, (req, res) => {
  const { id_func } = req.params;

  const query = 'DELETE FROM funcionarios WHERE id_func = ?';

  db.query(query, [id_func], (err) => {
    if (err) {
      console.error('Erro ao excluir funcionário:', err);
      return res.status(500).json({ error: err.message });
    }
    // Também remover da tabela funcionario_gestor
    const query_fg = 'DELETE FROM funcionario_gestor WHERE id_func = ?';
    db.query(query_fg, [id_func], (err) => {
      if (err) {
        console.error('Erro ao excluir da tabela funcionario_gestor:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Funcionário removido com sucesso' });
    });
  });
});

// ----------------------------------- Rotas de Unidades -----------------------------------
app.get('/unidades', authenticateToken, (req, res) => {
  console.log('Requisição recebida em /unidades');
  const cpf_gestor = req.gestor.cpf_gestor;
  console.log('CPF do gestor autenticado:', cpf_gestor);

  const query = `
    SELECT u.*
    FROM unidades u
    INNER JOIN unidade_gestor ug ON u.id_unidade = ug.id_unidade
    WHERE ug.cpf_gestor = ?
  `;

  db.query(query, [cpf_gestor], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    res.json(results);
  });
});

// Rota para criar uma nova unidade
app.post('/unidades', authenticateToken, (req, res) => {
  const cpf_gestor = req.gestor.cpf_gestor;
  console.log('CPF do gestor:', cpf_gestor);
  console.log('Dados da unidade:', req.body);
  const { polo, nome_unidade, cep, cidade, rua, estado, numero, complemento } = req.body;
  const query = 'INSERT INTO unidades (polo, nome_unidade, cep, cidade, rua, estado, numero, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [polo, nome_unidade, cep, cidade, rua, estado, numero, complemento];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir unidade:', err);
      res.status(500).json({ error: err.message });
      return;
    }
    const id_unidade = results.insertId;

    // Inserir na tabela unidade_gestor
    const query_ug = 'INSERT INTO unidade_gestor (cpf_gestor, id_unidade) VALUES (?, ?)';
    db.query(query_ug, [cpf_gestor, id_unidade], (err) => {
      if (err) {
        console.error('Erro ao inserir na tabela unidade_gestor:', err);
        return res.status(500).json({ error: err.message });
      }
      console.log('Unidade associada ao gestor com sucesso');
      res.status(201).json({ id_unidade, polo, nome_unidade, cep, cidade, rua, estado, numero, complemento });
    });
  });
});

// Rota para atualizar uma unidade existente
app.put('/unidades/:id_unidade', authenticateToken, authorizeUnidade, (req, res) => {
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

// Rota para deletar uma unidade
app.delete('/unidades/:id_unidade', authenticateToken, authorizeUnidade, (req, res) => {
  const { id_unidade } = req.params;
  const query = 'DELETE FROM unidades WHERE id_unidade = ?';

  db.query(query, [id_unidade], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    // Também remover da tabela unidade_gestor
    const query_ug = 'DELETE FROM unidade_gestor WHERE id_unidade = ?';
    db.query(query_ug, [id_unidade], (err) => {
      if (err) {
        console.error('Erro ao excluir da tabela unidade_gestor:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Unidade removida com sucesso' });
    });
  });
});

// ----------------------------------- Rotas de Categorias -----------------------------------
app.get('/unidades/:id_unidade/categorias', authenticateToken, authorizeUnidade, (req, res) => {
  const { id_unidade } = req.params;

  const query = 'SELECT * FROM categorias WHERE id_unidade = ?';
  db.query(query, [id_unidade], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/unidades/:id_unidade/categorias', authenticateToken, authorizeUnidade, (req, res) => {
  const { id_unidade } = req.params;
  const { nome, descricao } = req.body;

  const query = 'INSERT INTO categorias (nome, descricao, id_unidade) VALUES (?, ?, ?)';
  const values = [nome, descricao, id_unidade];

  db.query(query, values, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(201).json({ id_categorias: results.insertId, nome, descricao, id_unidade });
  });
});

app.put('/unidades/:id_unidade/categorias/:id_categorias', authenticateToken, authorizeUnidade, (req, res) => {
  const { id_unidade, id_categorias } = req.params;
  const { nome, descricao } = req.body;

  const query = 'UPDATE categorias SET nome = ?, descricao = ? WHERE id_categorias = ? AND id_unidade = ?';
  const values = [nome, descricao, id_categorias, id_unidade];

  db.query(query, values, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Categoria atualizada com sucesso' });
  });
});

app.delete('/unidades/:id_unidade/categorias/:id_categorias', authenticateToken, authorizeUnidade, (req, res) => {
  const { id_unidade, id_categorias } = req.params;

  const query = 'DELETE FROM categorias WHERE id_categorias = ? AND id_unidade = ?';

  db.query(query, [id_categorias, id_unidade], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Categoria removida com sucesso' });
  });
});

// ----------------------------------- Rotas de Gestores -----------------------------------
app.get('/gestor', (req, res) => {
  const query = 'SELECT nome, sobrenome, cpf_gestor, email, telefone FROM gestor';
  db.query(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.post('/gestor', async (req, res) => {
  const { nome, sobrenome, cpf_gestor, email, telefone, senha } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);

    const query = 'INSERT INTO gestor (nome, sobrenome, cpf_gestor, email, telefone, senha) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [nome, sobrenome, cpf_gestor, email, telefone, hashedPassword];

    db.query(query, values, (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ message: 'Gestor registrado com sucesso' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/gestor/:cpf_gestor', async (req, res) => {
  const { cpf_gestor } = req.params;
  const { nome, sobrenome, email, telefone, senha } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(senha, 10);

    const query = 'UPDATE gestor SET nome = ?, sobrenome = ?, email = ?, telefone = ?, senha = ? WHERE cpf_gestor = ?';
    const values = [nome, sobrenome, email, telefone, hashedPassword, cpf_gestor];

    db.query(query, values, (err) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Gestor atualizado com sucesso' });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/gestor/:cpf_gestor', (req, res) => {
  const { cpf_gestor } = req.params;
  const query = 'DELETE FROM gestor WHERE cpf_gestor = ?';

  db.query(query, [cpf_gestor], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Gestor removido com sucesso' });
  });
});

// ----------------------------------- Rota de Login -----------------------------------
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  console.log('Email:', email);
  console.log('Senha:', senha);

  const query = 'SELECT * FROM gestor WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.log('Erro no banco:', err.message);
      res.status(500).json({ error: err.message });
      return;
    }

    if (results.length === 0) {
      console.log('Email não encontrado');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const gestor = results[0];
    console.log('Gestor encontrado:', gestor);

    // Verifica a senha
    const match = await bcrypt.compare(senha, gestor.senha);

    if (!match) {
      console.log('Senha incorreta');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    console.log('Senha correta, gerando token...');
    const token = jwt.sign(
      {
        cpf_gestor: gestor.cpf_gestor,
        email: gestor.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({ token });
  });
});