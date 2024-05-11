import React from 'react';
import { NavbarSimpleColored } from '../Componentes/NavbarSimpleColored';
import { ButtonCantinas } from './GerenciamentoCadastroUnidades/GerenciamentoCadastroUnidades'; {/*Aq que altera a pagina que irá aparecer*/}

function cadastroCantinaInicio() {
  return (
    <><div className='container-principal'>
        <div>
          <NavbarSimpleColored /> 
        </div>
        <div className='container-central'>
          <ButtonCantinas />
        </div>
      </div></>
  );
}

export default cadastroCantinaInicio;