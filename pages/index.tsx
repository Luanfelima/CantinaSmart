import React from 'react';
import { NavbarSimpleColored } from '../componentes/NavbarSimpleColored';
import { FormLogin } from './FormulárioLogin/login';

function HomePage() {
  return (
    <>
      <div>
        <FormLogin />
      </div>
    </>
  );
}

export default HomePage;