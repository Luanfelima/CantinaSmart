import React, { useState } from 'react';
import { Alert, Button } from '@mantine/core';
import styles from './CadastroUnidadesInformacoes.module.css'; // Importe o arquivo CSS
import Layout from '../../componentes/Layout'; // Caminho de importação do layout/barra lateral

export function ButtonCantinas() {
  const [nome, setNome] = useState('');
  const [cpnj, setCnpj] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(''); // Novo estado para mensagem de sucesso

  const handleNomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNome(event.target.value);
  };

  const handleCnpjChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(event.target.value);
  };

  const handleCepChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCep(event.target.value);
  };

  const handleEnderecoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndereco(event.target.value);
  };

  const handleCidadeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCidade(event.target.value);
  };

  const handleNumeroChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumero(event.target.value);
  };

  const handleComplementoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setComplemento(event.target.value);
  };

  const handleEstadoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEstado(event.target.value);
  };

  /*const limparCampos = () => {
    setNome('');
    setCnpj('');
    setCep('');
    setEndereco('');
    setCidade('');
    setEstado('');
    setNumero('');
    setComplemento('');
    setErro('');
    setSucesso('');
  };*/

  const limparCampos = () => {
    const campos = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
    campos.forEach((campo) => {
      campo.value = '';
      campo.classList.remove(styles.erro); // Remove a classe de erro ao limpar os campos
    });
  };

  const verificarCampos = () => {
    const campos = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
    let todosPreenchidos = true;

    campos.forEach((campo) => {
      if (campo.id !== 'complemento' && campo.value.trim() === '') {
        campo.classList.add(styles.erro); // Adiciona uma classe de erro se o campo estiver vazio
        todosPreenchidos = false;
      } else {
        campo.classList.remove(styles.erro); // Remove a classe de erro se o campo estiver preenchido
      }
    });

    if (todosPreenchidos) {
      alert('Unidade Cadastrada com Sucesso!');
      limparCampos();
    }
    else {
      alert('Por favor, preencha todos os campos obrigatórios.');
    }
  };

  return (
    <Layout>
      <div className={styles.container}> {/* Adiciona a classe container */}
        <div className={styles.input}> {/*Adiciona a classe input */}
          <div className={styles.ColunaEsquerda}> {/*Adiciona div para coluna esquerda*/}
            <input type='text' id='nomeUnidade' placeholder='*Nome Unidade'></input>
            <input type='text' id='cep' placeholder='*CEP'></input>
            <input type='text' id='cidade' placeholder='*Cidade'></input>
            <input type='text' id='numero' placeholder='*Número'></input>
          </div>
          <div className={styles.ColunaDireita}> {/*Adiciona div para coluna direita*/}
            <input type='text' id='cnpj' placeholder='*CNPJ'></input>
            <input type='text' id='enderecoUnidade' placeholder='*Endereço Unidade'></input>
            <input type='text' id='estado' placeholder='*Estado'></input>
            <input type='text' id='complemento' placeholder='Complemento (Opcional)'></input>
          </div>
        </div>

        <div className={styles.buttonContainer}> {/* Container para os botões */}
          <Button onClick={verificarCampos}>Cadastrar</Button>
          <Button onClick={limparCampos}>Limpar</Button>
        </div>
      </div>
    </Layout>
  );
}

export default ButtonCantinas;
