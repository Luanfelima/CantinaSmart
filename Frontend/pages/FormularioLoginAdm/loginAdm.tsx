import React, { useState } from 'react';
import { useRouter } from 'next/router';
import classes from './loginAdm.module.css';

const LoginFormAdm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push('/CadastroGestor/Gestor');
  };
  
  const handleBack = () => {
    router.push("/FormularioLogin/login");
  };

  return (
    <div className={classes.page}> {/* Aplica a classe que muda a cor de fundo da tela */}
      <div className={classes.container}>
        <h2 className={classes.title}>Login ADM</h2>
        <form onSubmit={handleSubmit} className={classes.form}>
          <div>
            <label htmlFor="email" className={classes.label}>Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Email do Gestor'
              required
              className={classes.input}
            />
          </div>
          <div>
            <label htmlFor="password" className={classes.label}>Senha:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Senha do Gestor'
              required
              className={classes.input}
            />
          </div>
          <button type="submit" className={classes.button}>Entrar</button>
          <button type="button" onClick={handleBack} className={classes.button}>Voltar</button>
        </form>
      </div>
    </div>
  );
};

export default LoginFormAdm;