import { useForm } from '@mantine/form';
import { Container, Box, TextInput, NumberInput, Button, Group, Title } from '@mantine/core';
import Layout from '../../componentes/Layout'; // Caminho de importação do layout/barra lateral

function FormProduto() {
    const form = useForm<{ nomeUnidade: string; cep: number; cidade: string; numero: number; complemento: string | undefined; cnpj: number; rua: string; estado: string; }>({
      mode: 'uncontrolled',
      initialValues: { nomeUnidade: '', cep: 0, cidade: '', numero: 0, cnpj: 0, rua: '', estado: '', complemento: ''},
      validate: (values) => ({
        nomeUnidade: 
        values.nomeUnidade === undefined
            ? 'Deve conter o nome da unidade'
            : values.nomeUnidade.length < 2
                ? 'Deve conter mais do que 2 caracteres'
                : null,
        cep: 
        values.cep === undefined
          ? 'Deve conter o CEP da unidade'
          : values.cep <= 0
            ? 'Deve conter um valor maior que 0'
            : null,
        cidade:
        values.cidade === undefined
          ? 'Deve conter a cidade da unidade'
          : values.cidade.length < 2
            ? 'Deve conter mais do que 2 caracteres'
            : null,
        numero:
        values.numero === undefined
          ? 'Deve conter o número da unidade'
          : values.numero <= 0
            ? 'Deve conter um valor maior que 0'
            : null,
        cnpj:
        values.cnpj === undefined
          ? 'Deve conter o CNPJ da unidade'
          :  values.cnpj <= 0
              ? 'Deve conter um valor maior que 0'
              : null, 
        rua:
        values.rua === undefined
          ? 'Deve conter a rua da unidade'
          : values.rua.length < 2
            ? 'Deve conter mais do que 2 caracteres'
            : null,
        estado:
        values.estado === undefined
          ? 'Deve conter o estado da unidade'
          : values.estado.length < 2
            ? 'Deve conter mais do que 2 caracteres'
            : null,
      }),
    });
  
    return (
      <Layout>
    <Container size='responsive'>
        
        <Box mx="500">
        <Title>Cadastro de Unidade</Title>
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <TextInput
            label="Nome da Unidade"
            placeholder="Nome da Unidade"
            key={form.key('nomeUnidade')}
            {...form.getInputProps('nomeUnidade')}
            withAsterisk
          />
          <NumberInput
            mt="sm"
            label="CEP"
            placeholder="CEP da Unidade"
            key={form.key('cep')}
            {...form.getInputProps('cep')}
            withAsterisk
          />
          <TextInput
            mt="sm"
            label="Cidade"
            placeholder="Cidade da Unidade"
            key={form.key('cidade')}
            {...form.getInputProps('cidade')}
            withAsterisk
          />
          <NumberInput
            label="Número da Unidade"
            placeholder="Número da Unidade"
            key={form.key('numero')}
            {...form.getInputProps('numero')}
            withAsterisk
          />
          <TextInput
            mt="sm"
            label="Complemento da Unidade"
            placeholder="Complemento da Unidade"
            key={form.key('complemento')}
            {...form.getInputProps('complemento')}
          />
          <NumberInput
            mt="sm"
            label="CNPJ da Unidade"
            placeholder="CNPJ da Unidade"
            key={form.key('cnpj')}
            {...form.getInputProps('cnpj')}
            withAsterisk
          />
          <TextInput
            mt="sm"
            label="Rua da Unidade"
            placeholder="Rua da Unidade"
            key={form.key('rua')}
            {...form.getInputProps('rua')}
            withAsterisk
          />
          <TextInput
            mt="sm"
            label="Estado da Unidade"
            placeholder="Estado da Unidade"
            key={form.key('estado')}
            {...form.getInputProps('estado')}
            withAsterisk
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit">Cadastrar</Button>
          </Group>
        </form>
    </Box></Container>
    </Layout>
    );
  }

export default FormProduto;