import React from 'react';
import { Button } from '@mantine/core';
import styles from './CadastroUnidadesInformacoes.module.css'; // Importe o arquivo CSS
import Layout from '../../componentes/Layout'; // Caminho de importação do layout/barra lateral

export function ButtonCantinas() {
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
            <input type='text' id='complemento' placeholder='Complemento'></input>
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
