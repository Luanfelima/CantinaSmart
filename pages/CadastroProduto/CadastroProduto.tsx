import React, {useState} from 'react';
import { Button } from '@mantine/core';
import styles from './CadastroProduto.module.css'; // Importe o arquivo CSS

export function ButtonCantinas() {
    // Estados para armazenar os valores dos campos
    const [nome, setNome] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [descricao, setDescricao] = useState('');
    const [preco, setPreco] = useState('');
  
    // Manipuladores de eventos para atualizar os estados dos campos, value={nomedocampo} onChange={handle___Change} // HTMLInputElement para entrada de dados, e HTMLTextAreaElement para texto
    const handleNomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setNome(event.target.value);
    };
  
    const handleQuantidadeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuantidade(event.target.value);
    };
  
    const handlePrecoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setPreco(event.target.value);
    };

    const handleDescricaoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setDescricao(event.target.value);
    };
  
    // Função para limpar todos os campos
    const clearFields = () => {
      setNome('');
      setQuantidade('');
      setPreco('');
      setDescricao('');
    };
  
  return (
    <div className={styles.container}>
      <p className={styles.texto}>Produtos &gt; Cadastrar produto</p>

      <div className={styles.input}>
        <div className={styles.ColunaEsquerda}>
          <input type='text' value={nome} onChange={handleNomeChange} id='texto' placeholder='Nome'></input>
          <input type='text' value={quantidade} onChange={handleQuantidadeChange} id='texto' placeholder='Quantidade'/>
        </div>
        <div className={styles.ColunaDireita}>
          <input type="text" id='texto' placeholder='Não consegui colocar o quadradinho :('/> {/* Não coloquei para "Limpar" pois neste campo ficará o input checkbox, que não deu muito certo */}
          <input type='text' value={preco} onChange={handlePrecoChange} id='texto' placeholder='Preço'></input>              
        </div>

        <div>
          <input className={styles.descricao} value={descricao} onChange={handleDescricaoChange} type='text' id='texto' placeholder='Descrição'></input>
        </div>
      </div>

      <div className={styles.buttonContainer}>
        <Button>Cadastrar</Button>
        <Button onClick={clearFields}>Limpar</Button>
      </div>

    </div>
  );
}
export default ButtonCantinas;