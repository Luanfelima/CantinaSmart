import React, { useState } from 'react';
import { Alert, Button } from '@mantine/core';
import styles from './CadastroProduto.module.css'; // Importe o arquivo CSS
import Layout from '../../componentes/Layout'; // Caminho de importação do layout/barra lateral

export function ButtonCantinas() {
  // Estados para armazenar os valores dos campos
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [descricao, setDescricao] = useState('');
  const [perecivel, setPerecivel] = useState('');
  const [preco, setPreco] = useState('');
  const [erro, setErro] = useState(''); // Estado para mensagem de erro

  // Manipuladores de eventos para atualizar os estados dos campos
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

  // Função para limpar todos os campos
  const limparCampos = () => {
    setNome('');
    setQuantidade('');
    setPreco('');
    setPerecivel('');
    setDescricao('');
    setErro(''); // Limpar mensagem de erro
  };

  // Função que cadastra os campos
  const cadastrarCampos = () => {
    // Verifica se todos os campos estão preenchidos
    if (!nome.trim() && !quantidade.trim() && !preco.trim() && !perecivel.trim() && !descricao.trim()) {
      setErro('Todos os campos devem ser preenchidos.');
      return;
    }

    const verificarCampos = () => {
      const campos = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
      let todosPreenchidos = true;}

    // Limpa os campos após o cadastro
    limparCampos();
    alert('Produto Cadastrado com Sucesso!');
  };

  return (
    <Layout>
      <div className={styles.container}>
        <p className={styles.texto}>Produtos &gt; Cadastrar produto</p>

        <div className={styles.input}>
          <div className={styles.ColunaEsquerda}>
            <input type='text' value={nome} onChange={handleNomeChange} id='texto' placeholder='*Nome'/>
            <input
              type='text' value={quantidade} onChange={handleQuantidadeChange} id='texto' placeholder='*Quantidade'/>
          </div>
          
          <div className={styles.ColunaDireita}>
            <input type='text' value={perecivel} onChange={handlePerecivelChange} id='texto' placeholder='*É perecível?'/>
            <input
              type='text' value={preco} onChange={handlePrecoChange} id='texto' placeholder='*Preço'/>
          </div>
          <div>
            <input
              className={styles.descricao} value={descricao} onChange={handleDescricaoChange} type='text' id='texto' placeholder='*Descrição'/>
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
