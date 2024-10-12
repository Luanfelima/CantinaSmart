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
import { useState } from 'react';
import Image from 'next/image';
import classes from './login.module.css';
import api from '../../api/api';

export function FormLogin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [errors, setErrors] = useState({ email: '', senha: '' });
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: '', senha: '' };

    if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!senha) {
      newErrors.senha = 'Senha é obrigatória';
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.senha;
  };

  const handleLogin = async () => {
    try {
      const { data } = await api.post('/login', { email, senha });
      localStorage.setItem('token', data.token);  // Salva o token JWT
      localStorage.setItem('refreshToken', data.refreshToken);  // Salva o refresh token
      router.push('/Dashboard/dashboard');  // Redireciona para o dashboard
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro ao fazer login. Verifique suas credenciais.');
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
          placeholder="email@example.com"
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
          <Checkbox label="Lembrar-me" />
        </Group>
        <Button onClick={handleLogin} fullWidth mt="xl">
          Login
        </Button>
      </Paper>

      {/* Imagem clicável no canto */}
      <div className={classes.imageContainer}>
        <Image
          src="/engrenagem.png" // Altere o caminho da imagem
          alt="Área do ADM"
          width={50} // Tamanho da imagem
          height={50}
          onClick={handleImageClick}
          className={classes.image}
        />
      </div>
    </Container>
  );
}
export default FormLogin;