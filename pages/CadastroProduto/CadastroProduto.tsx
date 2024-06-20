import React, { useState } from 'react';
import { Alert, Button } from '@mantine/core';
import styles from './CadastroProduto.module.css';
import Layout from '../../componentes/Layout';

export function ButtonCantinas() {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [perecivel, setPerecivel] = useState('');
  const [preco, setPreco] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(''); // Novo estado para mensagem de sucesso

  const handleNomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNome(event.target.value);
  };

  const handleQuantidadeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantidade(event.target.value);
  };

  const handlePrecoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPreco(event.target.value);
  };

  const handlePerecivelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPerecivel(event.target.value);
  };

  const handleDescricaoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescricao(event.target.value);
  };

  const limparCampos = () => {
    setNome('');
    setQuantidade('');
    setPreco('');
    setPerecivel('');
    setDescricao('');
    setErro('');
    setSucesso('');
  };

  const cadastrarCampos = () => {
    const campos = { nome, quantidade, preco, perecivel, descricao };
    let todosPreenchidos = true;

    for (const [key, value] of Object.entries(campos)) {
      if (!value.trim()) {
        todosPreenchidos = false;
        setErro('Todos os campos devem ser preenchidos.');
        setSucesso('');
        return;
      }
      
      // Fazer o alerta de erro desaparecer após 6 segundos
      setTimeout(() => {
        setErro('');
      }, 6000);
    }

    if (todosPreenchidos) {
      limparCampos();
      setSucesso('Produto Cadastrado com Sucesso!');
      setErro(''); // Limpar qualquer mensagem de erro

      // Fazer o alerta de sucesso desaparecer após 3.5 segundos
      setTimeout(() => {
        setSucesso('');
      }, 3500);
    }
  };

  const isCampoVazio = (valor: string) => !valor.trim();

  return (
    <Layout>
      <div className={styles.container}>
        <p className={styles.texto}>Produtos &gt; Cadastrar produto</p>
        {erro && (
          <Alert
            title="Erro"
            color="red"
            styles={(theme) => ({
              root: {
                marginBottom: theme.spacing.sm,
                bottom: 150,
                left: 250,
              },
              title: {
                color: theme.colors.red[6],
              },
            })}
          >
            {erro}
          </Alert>
        )}
        {sucesso && (
          <Alert
            title="Sucesso"
            color="green"
            styles={(theme) => ({
              root: {
                marginBottom: theme.spacing.sm,
                bottom: 150,
                left: 250,
              },
              title: {
                color: theme.colors.green[6],
              },
            })}
          >
            {sucesso}
          </Alert>
        )}
        <div className={styles.input}>
          <div className={styles.ColunaEsquerda}>
            <input
              type='text'
              value={nome}
              onChange={handleNomeChange}
              id='texto'
              placeholder='*Nome'
              className={isCampoVazio(nome) && erro ? styles.erro : ''}
            />
            <input
              type='text'
              value={quantidade}
              onChange={handleQuantidadeChange}
              id='texto'
              placeholder='*Quantidade'
              className={isCampoVazio(quantidade) && erro ? styles.erro : ''}
            />
          </div>

          <div className={styles.ColunaDireita}>
            <input
              type='text'
              value={perecivel}
              onChange={handlePerecivelChange}
              id='texto'
              placeholder='*É perecível?'
              className={isCampoVazio(perecivel) && erro ? styles.erro : ''}
            />
            <input
              type='text'
              value={preco}
              onChange={handlePrecoChange}
              id='texto'
              placeholder='*Preço'
              className={isCampoVazio(preco) && erro ? styles.erro : ''}
            />
          </div>
          <div>
            <input
              className={`${styles.descricao} ${isCampoVazio(descricao) && erro ? styles.erro : ''}`}
              value={descricao}
              onChange={handleDescricaoChange}
              type='text'
              id='texto'
              placeholder='*Descrição'
            />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button onClick={cadastrarCampos}>Cadastrar</Button>
          <Button onClick={limparCampos}>Limpar</Button>
        </div>
      </div>
    </Layout>
  );
}

export default ButtonCantinas;
