import React from 'react';
import { Button } from '@mantine/core';
import { useRouter } from 'next/router';
import styles from './GerenciamentoCadastroUnidades.module.css'; // Importe o arquivo CSS

export function ButtonCantinas() {

  const router = useRouter(); // o useRouter é um metodo fornecido pelo next, para montar a rota até algo

  const cliqueAqui = () => {
    router.push('/CadastroUnidadesInformacoes/CadastroUnidadesInformacoes');
  };

  return (
    <div className={styles.centeredContainer}>
      <div className={styles.contentCadastro}>
        <div className={styles.titleContainerCadastroUnidades}>
          <h1 className={styles.title}>Cadastro de Unidades</h1>
        </div>
        <hr className={styles.lineCadastroUnidades} /> {/* Linha abaixo do "Cadastro de Unidades"*/}
        <div className={styles.buttonContainerCadastroUnidades}>
           {/* o evento onClick ele faz com que seja chamada a const cliqueAqui, que puxa a pagina desejada */}
          <Button onClick={cliqueAqui}>Inserir Dados</Button>
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