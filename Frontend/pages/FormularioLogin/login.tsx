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

export function FormLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const router = useRouter();

  const validateEmail = (email: string) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: '', password: '' };

    if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);

    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = () => {
    if (validateForm()) {
      router.push('/Dashboard/dashboard');
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
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          error={errors.password}
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