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
  console.log('JWT_SECRET:', process.env.JWT_SECRET);
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
      console.error('erro ao verificar o codigo:', err)
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

  console.log(`Gestor CPF: ${cpf_gestor}, Funcionário ID: ${id_func}`);

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

// Middleware para autorizar o gestor a acessar uma categoria específica
function authorizeCategoria(req, res, next) {
  const { id_categorias } = req.params;
  const cpf_gestor = req.gestor.cpf_gestor;

  const query = 'SELECT * FROM categoria_gestor WHERE id_categorias = ? AND cpf_gestor = ?';
  db.query(query, [id_categorias, cpf_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao acessar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'Acesso negado: Gestor não autorizado para esta categoria' });
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
  console.log(`ID do funcionário recebido na rota: ${id_func}`);
  const { nome, email, telefone, cpf, cargo } = req.body;

  console.log(`Atualizando funcionário ID: ${id_func} pelo gestor CPF: ${req.gestor.cpf_gestor}`);

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

  // Primeiro remove o funcionário da tabela `funcionario_gestor`
  const deleteFuncionarioGestor = 'DELETE FROM funcionario_gestor WHERE id_func = ?';

  db.query(deleteFuncionarioGestor, [id_func], (err) => {
    if (err) {
      console.error('Erro ao excluir da tabela funcionario_gestor:', err);
      return res.status(500).json({ error: err.message });
    }

    // Depois remove o funcionário da tabela `funcionarios`
    const deleteFuncionario = 'DELETE FROM funcionarios WHERE id_func = ?';

    db.query(deleteFuncionario, [id_func], (err) => {
      if (err) {
        console.error('Erro ao excluir funcionário:', err);
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
app.get('/categorias', authenticateToken, (req, res) => {
  const cpf_gestor = req.gestor.cpf_gestor;

  const query = `
    SELECT c.* 
    FROM categorias c
    INNER JOIN categoria_gestor cg ON c.id_categorias = cg.id_categorias
    WHERE cg.cpf_gestor = ?;
  `;

  db.query(query, [cpf_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

app.post('/categorias', authenticateToken, (req, res) => {
  const cpf_gestor = req.gestor.cpf_gestor;
  const { nome, descricao } = req.body;

  const query = 'INSERT INTO categorias (nome, descricao) VALUES (?, ?)';
  const values = [nome, descricao];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir categoria:', err);
      return res.status(500).json({ error: err.message });
    }
    const id_categorias = results.insertId;

    const query_cg = 'INSERT INTO categoria_gestor (cpf_gestor, id_categorias) VALUES (?, ?)';
    db.query(query_cg, [cpf_gestor, id_categorias], (err) => {
      if (err) {
        console.error('Erro ao inserir na tabela categoria_gestor:', err);
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json({ id_categorias, nome, descricao });
    });
  });
});

app.put('/categorias/:id_categorias', authenticateToken, authorizeCategoria, (req, res) => {
  const { id_categorias } = req.params;
  const { nome, descricao } = req.body;

  const query = 'UPDATE categorias SET nome = ?, descricao = ? WHERE id_categorias = ?';
  const values = [nome, descricao, id_categorias];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar categoria:', err);
      return res.status(500).json({ error: err.message });
    }

    res.json({ message: 'Categoria atualizada com sucesso' });
  });
});

app.delete('/categorias/:id_categorias', authenticateToken, authorizeCategoria, (req, res) => {
  const { id_categorias } = req.params;

  const deleteCategoriaGestor = 'DELETE FROM categoria_gestor WHERE id_categorias = ?';
  db.query(deleteCategoriaGestor, [id_categorias], (err) => {
    if (err) {
      console.error('Erro ao excluir da tabela categoria_gestor:', err);
      return res.status(500).json({ error: err.message });
    }

    const deleteCategoria = 'DELETE FROM categorias WHERE id_categorias = ?';
    db.query(deleteCategoria, [id_categorias], (err) => {
      if (err) {
        console.error('Erro ao excluir categoria:', err);
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Categoria removida com sucesso' });
    });
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

  // Verifique se os dados do corpo da requisição estão corretos
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  console.log('Email fornecido:', email);
  console.log('Senha fornecida:', senha);  // Verifique se a senha está sendo enviada

  const query = 'SELECT * FROM gestor WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.log('Erro no banco de dados:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      console.log('Nenhum usuário encontrado com este email');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const gestor = results[0];
    console.log('Gestor encontrado:', gestor);
    console.log('Senha do banco de dados (hash):', gestor.senha);  // Verifique se a senha está sendo retornada corretamente

    // Verificação da senha
    try {
      const match = await bcrypt.compare(senha, gestor.senha);  // Comparação da senha
      if (!match) {
        console.log('Senha incorreta');
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      console.log('Senha correta, gerando token...');

      // Geração do token JWT
      const token = jwt.sign(
        { cpf_gestor: gestor.cpf_gestor, email: gestor.email },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      // Geração do refresh token
      const refreshToken = jwt.sign(
        { cpf_gestor: gestor.cpf_gestor, email: gestor.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Envio do token, refresh token e cpf_gestor como resposta
      res.json({ token, refreshToken, cpf_gestor: gestor.cpf_gestor });
    } catch (error) {
      console.error('Erro ao comparar as senhas:', error);
      return res.status(500).json({ error: 'Erro interno ao verificar as credenciais' });
    }
  });
});

// ----------------------------------- Rota para renovar token -------------------------

app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  
  // Verifique se o refresh token é válido
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token não fornecido' });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, gestor) => {
    if (err) {
      return res.status(403).json({ error: 'Refresh token inválido ou expirado' });
    }

    // Gere um novo token de acesso
    const token = jwt.sign(
      { cpf_gestor: gestor.cpf_gestor, email: gestor.email },
      process.env.JWT_SECRET,
      { expiresIn: '7h' } // Pode ajustar o tempo conforme necessário
    );

    res.json({ token });
  });
});
