import React, { useState } from 'react';
import { useRouter } from 'next/router';
import classes from './loginAdm.module.css';

const LoginFormAdm: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push('/CadastroGestor/Gestor');
  };
  
  const handleBack = () => {
    router.push("/FormularioLogin/login");  
  };

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
    return !!email.length && regex.test(email.toLowerCase());
  };

  const validateForm = () => {
    const newErrors = { email: '', password: '' };

    if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido.';
    }

    if (!email) {
      newErrors.email = 'E-mail é obrigatório.';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória.';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
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
              placeholder='Email do ADM'
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
              placeholder='Senha do ADM'
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