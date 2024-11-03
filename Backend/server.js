require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: ['http://localhost:3001', 'https://cantinasmart.vercel.app', 'https://cantina-smart-git-master-time-cantinas.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600,
  credentials: true,
};

// Aplicação do middleware CORS
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
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.query('SELECT 1', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão com o banco de dados estabelecida com sucesso');
  }
});

// Exporta o `app` para permitir testes
module.exports = app;

const port = process.env.PORT || 3000;

if (!port) {
  throw new Error("A variável de ambiente PORT não está definida. Verifique a configuração do Render.");
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
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
      console.error('Erro ao verificar o token:', err);
      return res.status(403).json({ error: 'Token inválido ou expirado' });
    }

    req.gestor = gestor;
    next();
  });
}

// Middleware de autenticação para o administrador
function authenticateAdmToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, adm) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.adm = adm;
    next();
  });
}

// Middleware para autorizar acesso a um funcionário específico
function authorizeFuncionario(req, res, next) {
  const { id_func } = req.params;
  const matricula_gestor = req.gestor.matricula_gestor;

  console.log(`Gestor CPF: ${matricula_gestor}, Funcionário ID: ${id_func}`);

  const query = 'SELECT * FROM funcionario_gestor WHERE id_func = ? AND matricula_gestor = ?';

  db.query(query, [id_func, matricula_gestor], (err, results) => {
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
  const matricula_gestor = req.gestor.matricula_gestor;

  const query = 'SELECT * FROM categoria_gestor WHERE id_categorias = ? AND matricula_gestor = ?';
  db.query(query, [id_categorias, matricula_gestor], (err, results) => {
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

// Middleware para autorizar o gestor a acessar uma unidade especifica
function authorizeUnidade(req, res, next) {
  const { id_unidade } = req.params;
  const matricula_gestor = req.gestor.matricula_gestor;

  const query = 'SELECT * FROM unidade_gestor WHERE id_unidade = ? AND matricula_gestor = ?';
  db.query(query, [id_unidade, matricula_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao acessar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'Acesso negado: Gestor não autorizado para esta unidade' });
    }

    next();
  });
}

// Middleware para autorizar acesso a produtos
function authorizeProduto(req, res, next) {
  const { id_produto } = req.params;
  const matricula_gestor = req.gestor.matricula_gestor;

  const query = 'SELECT * FROM produto_gestor WHERE id_produto = ? AND matricula_gestor = ?';

  db.query(query, [id_produto, matricula_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao acessar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }

    if (results.length === 0) {
      return res.status(403).json({ error: 'Acesso negado: Gestor não autorizado para este produto' });
    }

    next();
  });
}

app.get('/funcionarios', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;
  console.info(`Buscando funcionários para o gestor com matrícula: ${matricula_gestor}`);

  const query = `
    SELECT f.*
    FROM funcionarios f
    INNER JOIN funcionario_gestor fg ON f.id_func = fg.id_func
    WHERE fg.matricula_gestor = ?
  `;

  db.query(query, [matricula_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar funcionários:', err);
      return res.status(500).json({ error: 'Erro ao buscar funcionários' });
    }

    console.info(`Funcionários encontrados para o gestor ${matricula_gestor}:`, results.length);
    res.json(results);
  });
});

app.post('/funcionarios', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;
  const { nome, email, telefone, cpf, cargo } = req.body;

  console.info(`Cadastrando funcionário pelo gestor ${matricula_gestor} com dados:`, { nome, email, telefone, cpf, cargo });

  const query = 'INSERT INTO funcionarios (nome, email, telefone, cpf, cargo) VALUES (?, ?, ?, ?, ?)';
  const values = [nome, email, telefone, cpf, cargo];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir funcionário:', err);
      return res.status(500).json({ error: 'Erro ao inserir funcionário' });
    }

    const id_func = results.insertId;
    console.info(`Funcionário ${id_func} inserido com sucesso. Associando com o gestor ${matricula_gestor}`);

    // Inserir na tabela funcionario_gestor
    const query_fg = 'INSERT INTO funcionario_gestor (id_func, matricula_gestor) VALUES (?, ?)';
    db.query(query_fg, [id_func, matricula_gestor], (err) => {
      if (err) {
        console.error('Erro ao associar funcionário ao gestor na tabela funcionario_gestor:', err);
        return res.status(500).json({ error: 'Erro ao associar funcionário ao gestor' });
      }
      console.info(`Funcionário ${id_func} associado com sucesso ao gestor ${matricula_gestor}`);
      res.status(201).json({ id_func, nome, email, telefone, cpf, cargo });
    });
  });
});

app.put('/funcionarios/:id_func', authenticateToken, authorizeFuncionario, (req, res) => {
  const { id_func } = req.params;
  const { nome, email, telefone, cpf, cargo } = req.body;
  const matricula_gestor = req.gestor.matricula_gestor;

  console.info(`Atualizando funcionário ID: ${id_func} pelo gestor matrícula: ${matricula_gestor} com dados:`, { nome, email, telefone, cpf, cargo });

  const query = 'UPDATE funcionarios SET nome = ?, email = ?, telefone = ?, cpf = ?, cargo = ? WHERE id_func = ?';
  const values = [nome, email, telefone, cpf, cargo, id_func];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar funcionário:', err);
      return res.status(500).json({ error: 'Erro ao atualizar funcionário' });
    }

    console.info(`Funcionário ${id_func} atualizado com sucesso pelo gestor ${matricula_gestor}`);
    res.json({ message: 'Funcionário atualizado com sucesso' });
  });
});

app.delete('/funcionarios/:id_func', authenticateToken, authorizeFuncionario, (req, res) => {
  const { id_func } = req.params;
  const matricula_gestor = req.gestor.matricula_gestor;

  console.info(`Iniciando exclusão do funcionário ID: ${id_func} pelo gestor matrícula: ${matricula_gestor}`);

  // Primeiro remove o funcionário da tabela `funcionario_gestor`
  const deleteFuncionarioGestor = 'DELETE FROM funcionario_gestor WHERE id_func = ?';

  db.query(deleteFuncionarioGestor, [id_func], (err) => {
    if (err) {
      console.error('Erro ao excluir associação na tabela funcionario_gestor:', err);
      return res.status(500).json({ error: 'Erro ao excluir associação do funcionário com o gestor' });
    }

    console.info(`Associação do funcionário ${id_func} removida da tabela funcionario_gestor. Prosseguindo com a exclusão do funcionário.`);

    // Depois remove o funcionário da tabela `funcionarios`
    const deleteFuncionario = 'DELETE FROM funcionarios WHERE id_func = ?';

    db.query(deleteFuncionario, [id_func], (err) => {
      if (err) {
        console.error('Erro ao excluir funcionário:', err);
        return res.status(500).json({ error: 'Erro ao excluir funcionário' });
      }

      console.info(`Funcionário ${id_func} excluído com sucesso pelo gestor ${matricula_gestor}`);
      res.json({ message: 'Funcionário removido com sucesso' });
    });
  });
});

// ----------------------------------- Rotas de Unidades -----------------------------------
app.get('/unidades', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;
  console.info(`Buscando unidades para o gestor com matrícula: ${matricula_gestor}`);

  const query = `
    SELECT u.*
    FROM unidades u
    INNER JOIN unidade_gestor ug ON u.id_unidade = ug.id_unidade
    WHERE ug.matricula_gestor = ?
  `;

  db.query(query, [matricula_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar unidades:', err);
      return res.status(500).json({ error: 'Erro ao buscar unidades' });
    }

    console.info(`Unidades encontradas para o gestor ${matricula_gestor}:`, results.length);
    res.json(results);
  });
});

app.post('/unidades', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;
  const { polo, nome_unidade, cep, cidade, rua, estado, numero, complemento } = req.body;

  console.info(`Cadastrando unidade pelo gestor ${matricula_gestor} com dados:`, { polo, nome_unidade, cep, cidade, rua, estado, numero, complemento });

  const query = 'INSERT INTO unidades (polo, nome_unidade, cep, cidade, rua, estado, numero, complemento) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [polo, nome_unidade, cep, cidade, rua, estado, numero, complemento];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir unidade:', err);
      return res.status(500).json({ error: 'Erro ao inserir unidade' });
    }

    const id_unidade = results.insertId;
    console.info(`Unidade ${id_unidade} inserida com sucesso. Associando com o gestor ${matricula_gestor}`);

    const query_ug = 'INSERT INTO unidade_gestor (matricula_gestor, id_unidade) VALUES (?, ?)';
    db.query(query_ug, [matricula_gestor, id_unidade], (err) => {
      if (err) {
        console.error('Erro ao inserir na tabela unidade_gestor:', err);
        return res.status(500).json({ error: 'Erro ao associar unidade ao gestor' });
      }

      console.info(`Unidade ${id_unidade} associada com sucesso ao gestor ${matricula_gestor}`);
      res.status(201).json({ id_unidade, polo, nome_unidade, cep, cidade, rua, estado, numero, complemento });
    });
  });
});

app.put('/unidades/:id_unidade', authenticateToken, authorizeUnidade, (req, res) => {
  const { id_unidade } = req.params;
  const { polo, nome_unidade, cep, cidade, rua, estado, numero, complemento } = req.body;
  const matricula_gestor = req.gestor.matricula_gestor;

  console.info(`Atualizando unidade ID: ${id_unidade} pelo gestor matrícula: ${matricula_gestor} com dados:`, { polo, nome_unidade, cep, cidade, rua, estado, numero, complemento });

  const query = 'UPDATE unidades SET polo = ?, nome_unidade = ?, cep = ?, cidade = ?, rua = ?, estado = ?, numero = ?, complemento = ? WHERE id_unidade = ?';
  const values = [polo, nome_unidade, cep, cidade, rua, estado, numero, complemento, id_unidade];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar unidade:', err);
      return res.status(500).json({ error: 'Erro ao atualizar unidade' });
    }

    console.info(`Unidade ${id_unidade} atualizada com sucesso pelo gestor ${matricula_gestor}`);
    res.json({ message: 'Unidade atualizada com sucesso' });
  });
});

app.delete('/unidades/:id_unidade', authenticateToken, authorizeUnidade, (req, res) => {
  const { id_unidade } = req.params;
  const matricula_gestor = req.gestor.matricula_gestor;

  console.info(`Iniciando exclusão da unidade ID: ${id_unidade} pelo gestor matrícula: ${matricula_gestor}`);

  const deleteUnidadeGestor = 'DELETE FROM unidade_gestor WHERE id_unidade = ?';
  db.query(deleteUnidadeGestor, [id_unidade], (err) => {
    if (err) {
      console.error('Erro ao excluir associação na tabela unidade_gestor:', err);
      return res.status(500).json({ error: 'Erro ao excluir associação da unidade com o gestor' });
    }

    console.info(`Associação da unidade ${id_unidade} removida da tabela unidade_gestor. Prosseguindo com a exclusão da unidade.`);

    const deleteUnidade = 'DELETE FROM unidades WHERE id_unidade = ?';
    db.query(deleteUnidade, [id_unidade], (err) => {
      if (err) {
        console.error('Erro ao excluir unidade:', err);
        return res.status(500).json({ error: 'Erro ao excluir unidade' });
      }

      console.info(`Unidade ${id_unidade} excluída com sucesso pelo gestor ${matricula_gestor}`);
      res.json({ message: 'Unidade removida com sucesso' });
    });
  });
});

// ----------------------------------- Rotas de Categorias -----------------------------------
app.get('/categorias', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;
  console.info(`Buscando categorias para o gestor com matrícula: ${matricula_gestor}`);

  const query = `
    SELECT c.* 
    FROM categorias c
    INNER JOIN categoria_gestor cg ON c.id_categorias = cg.id_categorias
    WHERE cg.matricula_gestor = ?;
  `;

  db.query(query, [matricula_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar categorias:', err);
      return res.status(500).json({ error: 'Erro ao buscar categorias' });
    }

    console.info(`Categorias encontradas para o gestor ${matricula_gestor}:`, results.length);
    res.json(results);
  });
});

app.post('/categorias', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;
  const { nome, descricao } = req.body;

  console.info(`Cadastrando categoria pelo gestor ${matricula_gestor} com dados:`, { nome, descricao });

  const query = 'INSERT INTO categorias (nome, descricao) VALUES (?, ?)';
  const values = [nome, descricao];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir categoria:', err);
      return res.status(500).json({ error: 'Erro ao inserir categoria' });
    }

    const id_categorias = results.insertId;
    console.info(`Categoria ${id_categorias} inserida com sucesso. Associando com o gestor ${matricula_gestor}`);

    const query_cg = 'INSERT INTO categoria_gestor (matricula_gestor, id_categorias) VALUES (?, ?)';
    db.query(query_cg, [matricula_gestor, id_categorias], (err) => {
      if (err) {
        console.error('Erro ao inserir na tabela categoria_gestor:', err);
        return res.status(500).json({ error: 'Erro ao associar categoria ao gestor' });
      }

      console.info(`Categoria ${id_categorias} associada com sucesso ao gestor ${matricula_gestor}`);
      res.status(201).json({ id_categorias, nome, descricao });
    });
  });
});

app.put('/categorias/:id_categorias', authenticateToken, authorizeCategoria, (req, res) => {
  const { id_categorias } = req.params;
  const { nome, descricao } = req.body;
  const matricula_gestor = req.gestor.matricula_gestor;

  console.info(`Atualizando categoria ID: ${id_categorias} pelo gestor matrícula: ${matricula_gestor} com dados:`, { nome, descricao });

  const query = 'UPDATE categorias SET nome = ?, descricao = ? WHERE id_categorias = ?';
  const values = [nome, descricao, id_categorias];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar categoria:', err);
      return res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }

    console.info(`Categoria ${id_categorias} atualizada com sucesso pelo gestor ${matricula_gestor}`);
    res.json({ message: 'Categoria atualizada com sucesso' });
  });
});

app.delete('/categorias/:id_categorias', authenticateToken, authorizeCategoria, (req, res) => {
  const { id_categorias } = req.params;
  const matricula_gestor = req.gestor.matricula_gestor;

  console.info(`Iniciando exclusão da categoria ID: ${id_categorias} pelo gestor matrícula: ${matricula_gestor}`);

  const deleteCategoriaGestor = 'DELETE FROM categoria_gestor WHERE id_categorias = ?';
  db.query(deleteCategoriaGestor, [id_categorias], (err) => {
    if (err) {
      console.error('Erro ao excluir associação na tabela categoria_gestor:', err);
      return res.status(500).json({ error: 'Erro ao excluir associação da categoria com o gestor' });
    }

    console.info(`Associação da categoria ${id_categorias} removida da tabela categoria_gestor. Prosseguindo com a exclusão da categoria.`);

    const deleteCategoria = 'DELETE FROM categorias WHERE id_categorias = ?';
    db.query(deleteCategoria, [id_categorias], (err) => {
      if (err) {
        console.error('Erro ao excluir categoria:', err);
        return res.status(500).json({ error: 'Erro ao excluir categoria' });
      }

      console.info(`Categoria ${id_categorias} excluída com sucesso pelo gestor ${matricula_gestor}`);
      res.json({ message: 'Categoria removida com sucesso' });
    });
  });
});

// ----------------------------------- Rotas de Gestores -----------------------------------
app.get('/gestor', (req, res) => {
  console.info('Iniciando busca de gestores');
  const query = 'SELECT nome, sobrenome, matricula_gestor, email, telefone FROM gestor';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Erro ao buscar gestores:', err);
      return res.status(500).json({ error: 'Erro ao buscar gestores' });
    }

    console.info(`Gestores encontrados: ${results.length}`);
    res.json(results);
  });
});

app.post('/gestor', async (req, res) => {
  const { nome, sobrenome, matricula_gestor, email, telefone, senha } = req.body;
  console.info('Iniciando cadastro de novo gestor:', { nome, sobrenome, matricula_gestor, email });

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const query = 'INSERT INTO gestor (nome, sobrenome, matricula_gestor, email, telefone, senha) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [nome, sobrenome, matricula_gestor, email, telefone, hashedPassword];

    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Erro ao cadastrar gestor:', err);
        return res.status(500).json({ error: 'Erro ao cadastrar gestor' });
      }

      console.info(`Gestor ${matricula_gestor} cadastrado com sucesso`);
      res.status(201).json({ message: 'Gestor registrado com sucesso' });
    });
  } catch (error) {
    console.error('Erro ao hash da senha:', error);
    res.status(500).json({ error: 'Erro ao processar a senha do gestor' });
  }
});

app.put('/gestor/:matricula_gestor', async (req, res) => {
  const { matricula_gestor } = req.params;
  const { nome, sobrenome, email, telefone, senha } = req.body;
  console.info(`Iniciando atualização do gestor ${matricula_gestor}`, { nome, sobrenome, email, telefone });

  try {
    const hashedPassword = await bcrypt.hash(senha, 10);
    const query = 'UPDATE gestor SET nome = ?, sobrenome = ?, email = ?, telefone = ?, senha = ? WHERE matricula_gestor = ?';
    const values = [nome, sobrenome, email, telefone, hashedPassword, matricula_gestor];

    db.query(query, values, (err) => {
      if (err) {
        console.error(`Erro ao atualizar o gestor ${matricula_gestor}:`, err);
        return res.status(500).json({ error: 'Erro ao atualizar gestor' });
      }

      console.info(`Gestor ${matricula_gestor} atualizado com sucesso`);
      res.json({ message: 'Gestor atualizado com sucesso' });
    });
  } catch (error) {
    console.error('Erro ao hash da senha:', error);
    res.status(500).json({ error: 'Erro ao processar a senha do gestor' });
  }
});

app.delete('/gestor/:matricula_gestor', (req, res) => {
  const { matricula_gestor } = req.params;
  console.info(`Iniciando exclusão do gestor ${matricula_gestor}`);

  const query = 'DELETE FROM gestor WHERE matricula_gestor = ?';

  db.query(query, [matricula_gestor], (err) => {
    if (err) {
      console.error(`Erro ao excluir o gestor ${matricula_gestor}:`, err);
      return res.status(500).json({ error: 'Erro ao excluir gestor' });
    }

    console.info(`Gestor ${matricula_gestor} excluído com sucesso`);
    res.json({ message: 'Gestor removido com sucesso' });
  });
});

// ----------------------------------- Rota de Login -----------------------------------

app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Verifique se os dados do corpo da requisição estão corretos
  if (!email || !senha) {
    console.warn('Requisição de login sem email ou senha');
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  console.info('Iniciando processo de login para o email:', email);

  const query = 'SELECT * FROM gestor WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err);
      return res.status(500).json({ error: 'Erro ao acessar o banco de dados' });
    }

    if (results.length === 0) {
      console.warn(`Nenhum gestor encontrado com o email: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const gestor = results[0];
    console.info('Gestor encontrado:', { matricula_gestor: gestor.matricula_gestor, email: gestor.email });

    // Verificação da senha
    try {
      const match = await bcrypt.compare(senha, gestor.senha);
      if (!match) {
        console.warn('Senha incorreta para o email:', email);
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      console.info('Autenticação bem-sucedida para o email:', email);
      console.info('Gerando tokens de autenticação');

      // Geração do token JWT
      const token = jwt.sign(
        { matricula_gestor: gestor.matricula_gestor, email: gestor.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Geração do refresh token
      const refreshToken = jwt.sign(
        { matricula_gestor: gestor.matricula_gestor, email: gestor.email },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      console.info('Tokens gerados com sucesso para o gestor:', gestor.matricula_gestor);
      res.json({ token, refreshToken, matricula_gestor: gestor.matricula_gestor });
    } catch (error) {
      console.error('Erro ao comparar a senha:', error);
      return res.status(500).json({ error: 'Erro interno ao verificar as credenciais' });
    }
  });
});

// ----------------------------------- Rota para renovar token -------------------------

app.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;

  // Verifique se o refresh token é válido
  if (!refreshToken) {
    console.warn('Tentativa de renovação de token sem fornecer o refresh token');
    return res.status(401).json({ error: 'Refresh token não fornecido' });
  }

  console.info('Iniciando verificação do refresh token');

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, gestor) => {
    if (err) {
      console.warn('Refresh token inválido ou expirado:', err.message);
      return res.status(403).json({ error: 'Refresh token inválido ou expirado' });
    }

    console.info('Refresh token verificado com sucesso para o gestor:', gestor.matricula_gestor);

    // Gere um novo token de acesso
    const token = jwt.sign(
      { matricula_gestor: gestor.matricula_gestor, email: gestor.email },
      process.env.JWT_SECRET,
      { expiresIn: '7h' } // Pode ajustar o tempo conforme necessário
    );

    console.info('Novo token gerado para o gestor:', gestor.matricula_gestor);
    res.json({ token });
  });
});

// ----------------------------------- Rota de produtos -------------------------------
app.get('/produtos', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;

  console.info(`Gestor Matrícula: ${matricula_gestor} - Solicitando lista de produtos`);

  const query = `
    SELECT p.* 
    FROM produtos p
    INNER JOIN produto_gestor pg ON p.id_produto = pg.id_produto
    WHERE pg.matricula_gestor = ?
  `;

  db.query(query, [matricula_gestor], (err, results) => {
    if (err) {
      console.error('Erro ao buscar produtos:', err);
      return res.status(500).json({ error: err.message });
    }

    console.info(`Produtos retornados para gestor ${matricula_gestor}:`, results);
    res.json(results);
  });
});

app.post('/produtos', authenticateToken, (req, res) => {
  const matricula_gestor = req.gestor.matricula_gestor;
  const { nome_p, categoria, preco, perecivel, descricao, unidade_medida } = req.body;

  console.info(`Gestor Matrícula: ${matricula_gestor} - Criando novo produto`, req.body);

  const query = 'INSERT INTO produtos (nome_p, categoria, preco, perecivel, descricao, unidade_medida) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [nome_p, categoria, preco, perecivel, descricao, unidade_medida];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Erro ao inserir produto:', err);
      return res.status(500).json({ error: err.message });
    }

    const id_produto = results.insertId;

    const query_pg = 'INSERT INTO produto_gestor (id_produto, matricula_gestor) VALUES (?, ?)';
    db.query(query_pg, [id_produto, matricula_gestor], (err) => {
      if (err) {
        console.error('Erro ao vincular produto ao gestor na tabela produto_gestor:', err);
        return res.status(500).json({ error: err.message });
      }

      console.info(`Produto criado com ID ${id_produto} e vinculado ao gestor ${matricula_gestor}`);
      res.status(201).json({ id_produto, nome_p, categoria, preco, perecivel, descricao, unidade_medida });
    });
  });
});

app.put('/produtos/:id_produto', authenticateToken, authorizeProduto, (req, res) => {
  const { id_produto } = req.params;
  const { nome_p, categoria, preco, perecivel, descricao, unidade_medida } = req.body;

  console.info(`Atualizando produto ID ${id_produto} com novos dados:`, req.body);

  const query = `
    UPDATE produtos 
    SET nome_p = ?, categoria = ?, preco = ?, perecivel = ?, descricao = ?, unidade_medida = ?
    WHERE id_produto = ?
  `;
  const values = [nome_p, categoria, preco, perecivel, descricao, unidade_medida, id_produto];

  db.query(query, values, (err) => {
    if (err) {
      console.error('Erro ao atualizar produto:', err);
      return res.status(500).json({ error: err.message });
    }

    console.info(`Produto ID ${id_produto} atualizado com sucesso`);
    res.json({ message: 'Produto atualizado com sucesso' });
  });
});

app.delete('/produtos/:id_produto', authenticateToken, authorizeProduto, (req, res) => {
  const { id_produto } = req.params;

  console.info(`Iniciando exclusão do produto ID ${id_produto}`);

  // Primeiro remove o produto da tabela `produto_gestor`
  const deleteProdutoGestor = 'DELETE FROM produto_gestor WHERE id_produto = ?';

  db.query(deleteProdutoGestor, [id_produto], (err) => {
    if (err) {
      console.error('Erro ao excluir da tabela produto_gestor:', err);
      return res.status(500).json({ error: err.message });
    }

    console.info(`Produto ID ${id_produto} desvinculado do gestor com sucesso`);

    // Depois remove o produto da tabela `produtos`
    const deleteProduto = 'DELETE FROM produtos WHERE id_produto = ?';

    db.query(deleteProduto, [id_produto], (err) => {
      if (err) {
        console.error('Erro ao excluir o produto:', err);
        return res.status(500).json({ error: err.message });
      }

      console.info(`Produto ID ${id_produto} removido com sucesso`);
      res.json({ message: 'Produto removido com sucesso' });
    });
  });
});

// ----------------------------------- Rota de login do adm -------------------------------
app.post('/loginAdm', (req, res) => {
  const { email, senha } = req.body;

  // Verifica se os dados foram enviados
  if (!email || !senha) {
    console.warn('Tentativa de login sem email ou senha fornecidos');
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  console.info('Tentativa de login para o administrador:', email);

  // Busca o administrador no banco de dados
  const query = 'SELECT * FROM adm_cantinas WHERE email_adm = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Erro ao acessar o banco de dados na tentativa de login:', err);
      return res.status(500).json({ error: err.message });
    }

    if (results.length === 0) {
      console.warn(`Nenhum administrador encontrado com o email: ${email}`);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const adm = results[0];
    console.info('Administrador encontrado:', { id_adm: adm.id_adm, email_adm: adm.email_adm });

    // Verificação da senha com bcrypt
    try {
      const senhaCorreta = await bcrypt.compare(senha, adm.senha_adm);
      if (!senhaCorreta) {
        console.warn(`Senha incorreta fornecida para o administrador ${email}`);
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      console.info('Senha correta. Gerando tokens para o administrador:', { id_adm: adm.id_adm });

      // Geração do token JWT para o administrador
      const token = jwt.sign(
        { id_adm: adm.id_adm, email_adm: adm.email_adm },
        process.env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      // Geração do refresh token
      const refreshToken = jwt.sign(
        { id_adm: adm.id_adm, email_adm: adm.email_adm },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      console.info('Tokens gerados com sucesso para o administrador:', { id_adm: adm.id_adm });

      // Resposta com token e refresh token
      res.json({ token, refreshToken, id_adm: adm.id_adm });
    } catch (error) {
      console.error('Erro ao comparar as senhas:', error);
      return res.status(500).json({ error: 'Erro interno ao verificar as credenciais' });
    }
  });
});