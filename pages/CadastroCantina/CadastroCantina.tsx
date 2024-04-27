import React from 'react';
import { Button } from '@mantine/core';
import styles from './CadastroCantina.module.css'; // Importe o arquivo CSS

export function ButtonCantinas() {
  return (
    <div className={styles.container}> {/* Adiciona a classe container */}
      <div className={styles.headerContainer}> {/* Container para o título e a linha */}
        <h1 className={styles.title}>Minhas Unidades:</h1> {/* Adiciona o texto "Minhas Unidades" */}
        <hr className={styles.line} /> {/* Adiciona a linha preta */}
      </div>
      <div className={styles.buttonContainer}> {/* Container para os botões */}
        <Button>Campus Centro</Button>
        <Button>Campus Conceição</Button>
        <Button>Campus Barcelona</Button>
        <Button>Gerenciar Unidades</Button>
      </div>
    </div>
  );
}

export default ButtonCantinas;