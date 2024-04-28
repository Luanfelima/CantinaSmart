import React from 'react';
import { Button } from '@mantine/core';
import styles from './GerenciamentoCadastroUnidades.module.css'; // Importe o arquivo CSS

export function ButtonCantinas() {
  return (
    <div className={styles.centeredContainer}>
      <div className={styles.contentCadastro}>
        <div className={styles.titleContainerCadastroUnidades}>
          <h1 className={styles.title}>Cadastro de Unidades</h1>
        </div>
        <hr className={styles.lineCadastroUnidades} /> {/* Linha abaixo do "Cadastro de Unidades"*/}
        <div className={styles.buttonContainerCadastroUnidades}>
          <Button>Inserir Dados</Button>
        </div>
      </div>
      <div className={styles.divider}></div> {/*Linha vertical de divisão*/}
      <div className={styles.contentLista}>
        <div className={styles.unitListContainer}>
          <h2>Lista de Unidades</h2>
          <hr className={styles.lineListaUnidades} /> {/* Linha abaixo do "Lista de Unidades" */}
          <div className={styles.unitButton}>
            <Button>Centro</Button>
            <Button>Conceição</Button>
            <Button>Barcelona</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButtonCantinas;