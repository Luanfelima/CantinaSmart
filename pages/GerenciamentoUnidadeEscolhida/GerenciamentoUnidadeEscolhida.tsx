import React from 'react';
import { Button, stylesToString } from '@mantine/core';
import styles from './GerenciamentoUnidadeEscolhida.module.css'; // Importe o arquivo CSS
import Image from 'next/image';
import Layout from '../../componentes/Layout'; // Caminho de importação do layout/barra lateral

export function ButtonCantinas() {

  return (
    <Layout>
    <div className={styles.container}> {/* Adiciona a classe container */}
      <div className={styles.consultaUnidades}>
        <text>Consulta de Unidades</text>  {/*Adiciona a classe texto do titulo da pagina no topo */}
      </div>
      <div className={styles.textUnidade}> {/*Adiciona a classe texto da unidade na parte de cima da tela */}
        <text>Unidade: Centro</text>
      </div>
      <div className={styles.botaoRelatorio}>
          <Button>
          <Image className={styles.img} src="/img/Exportar.png" alt="Gerar Relatório" width={40} height={40}/>
          Gerar Relatório
          </Button>
      </div>
      <div className={styles.botoesGerenciamento}>
        <Button>Gerenciar Estoque</Button>
        <Button>Administrar Compra</Button>
        <Button>Administrar Venda</Button>
      </div>
    </div>
    </Layout>
  );
}
export default ButtonCantinas;