import {
    TextInput,
    PasswordInput,
    Checkbox,
    Anchor,
    Paper,
    Title,
    Text,
    Container,
    Group,
    Button,
  } from '@mantine/core';
  import classes from './login.module.css';
  import { useRouter } from 'next/router';
  import { LeadGrid } from '../Dashboard/dashboard';

  export function FormLogin() {

    const router = useRouter();
    const acessoLogin = () => {
      router.push('/Dashboard/dashboard');
    }

    return (
      <Container size={420} my={40}>
        <Title ta="center" className={classes.title}>
          Cantinas Smart
        </Title>
        
  
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <TextInput label="Email" placeholder="email@example.com" required />
          <PasswordInput label="Senha" placeholder="Sua senha" required mt="md" />
          <Group justify="space-between" mt="lg">
            <Checkbox label="Lembrar-me" />
          </Group>
          <Button onClick={acessoLogin} fullWidth mt="xl">
            Login
          </Button>
        </Paper>
      </Container>    
    );
  }