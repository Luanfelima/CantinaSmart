import {
  TextInput,
  PasswordInput,
  Checkbox,
  Paper,
  Title,
  Container,
  Group,
  Button,
} from '@mantine/core';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import classes from './login.module.css';
import api from '../../api/api';

export function FormLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', senha: '' });
  const router = useRouter();

  useEffect(() => {
    // Carregar email e senha do localStorage se "Lembrar-me" estiver marcado
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedSenha = localStorage.getItem('rememberedSenha');
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

    if (savedRememberMe) {
      setEmail(savedEmail || '');
      setSenha(savedSenha || '');
      setRememberMe(true);
    }
  }, []);

  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;
    return !!email.length && regex.test(email.toLowerCase());
  };

  const validateForm = () => {
    const newErrors = { email: '', senha: '' };

    if (!validateEmail(email)) {
      newErrors.email = 'E-mail inválido.';
    }

    if (!email) {
      newErrors.email = 'E-mail é obrigatório.';
    }


    if (!senha) {
      newErrors.senha = 'Senha é obrigatória.';
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.senha;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      const { data } = await api.post('/login', { email, senha });
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('matricula_gestor', data.matricula_gestor);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
        localStorage.setItem('rememberedSenha', senha);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedSenha');
        localStorage.setItem('rememberMe', 'false');
      }

      router.push('/Dashboard/dashboard');
    } catch (error: any) {
      if (error.response) {

        } if (error.response.status === 401) {
          alert('Falha na Autenticação.');
        } else {
        alert('Erro de conexão. Verifique sua rede e tente novamente.');
      }
    }
  };

  const handleImageClick = () => {
    router.push('/FormularioLoginAdm/loginAdm');
  };

  return (
    <Container size={420} my={40} className={classes.container}>
      <Title ta="center" className={classes.title}>
        Cantinas Smart
      </Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput
          label="Email"
          placeholder=" email@example.com"
          required
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          error={errors.email}
        />
        <PasswordInput
          label="Senha"
          placeholder="Sua senha"
          required
          mt="md"
          value={senha}
          onChange={(event) => setSenha(event.currentTarget.value)}
          error={errors.senha}
        />
        <Group justify="space-between" mt="lg">
          <Checkbox
            label="Lembrar-me"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.currentTarget.checked)}
          />
        </Group>
        <Button onClick={handleLogin} fullWidth mt="xl">
          Login
        </Button>
      </Paper>

      {/* Imagem clicável no canto */}
      <div className={classes.imageContainer}>
        <Image
          src="/engrenagem.png"
          alt="Área do ADM"
          width={50}
          height={50}
          onClick={handleImageClick}
          className={classes.image}
        />
      </div>
    </Container>
  );
}

export default FormLogin;
