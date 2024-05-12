import React from 'react';
import { Button } from '@mantine/core';
import styles from './CadastroUnidadesInformacoes.module.css'; // Importe o arquivo CSS
import Layout from '../../componentes/Layout'; // Caminho de importação do layout/barra lateral

export function ButtonCantinas() {
  return (
  <Layout>
    <div className={styles.container}> {/* Adiciona a classe container */}
      <div className={styles.input}> {/*Adiciona a classe input */}
        <div className={styles.ColunaEsquerda}> {/*Adiciona div para coluna esquerda*/}
          <input type='text' id='texto' placeholder='Nome Unidade'></input>
          <input type='text' id='texto' placeholder='CEP'></input>
          <input type='text' id='texto' placeholder='Cidade'></input>
          <input type='text' id='texto' placeholder='Número'></input>
        </div>
          <div className={styles.ColunaDireita}> {/*Adiciona div para coluna direita*/}
            <input type='text' id='texto' placeholder='CNPJ'></input>
            <input type='text' id='texto' placeholder='Endereço Unidade'></input>
            <input type='text' id='texto' placeholder='Estado'></input>
            <input type='text' id='texto' placeholder='Complemento'></input>
          </div>
      </div>

          <div className={styles.buttonContainer}> {/* Container para os botões */}
            <Button>Cadastrar</Button>
            <Button>Limpar</Button>
          </div>
    </div>
  </Layout>
  );
}

export default ButtonCantinas;