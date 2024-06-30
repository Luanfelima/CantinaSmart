import { useForm } from '@mantine/form';
import { Container, Box, TextInput, NumberInput, Button, Group, Radio, Title } from '@mantine/core';
import Layout from '../../componentes/Layout'; // Caminho de importação do layout/barra lateral



function FormProduto() {
    const form = useForm<{ nome: string; quantidade: number; preco: number; perecivel: boolean | undefined ; descricao: string | undefined }>({
      mode: 'uncontrolled',
      initialValues: { nome: '', quantidade: 0, preco: 0, perecivel: undefined , descricao: ''},
      validate: (values) => ({
        nome: 
        values.nome === undefined
            ? 'Deve conter o nome do produto'
            : values.nome.length < 2
                ? 'Deve conter mais do que 2 caracteres'
                : null,
        quantidade: 
        values.quantidade === undefined
          ? 'Deve conter a quantidade do produto'
          : values.quantidade < 1
            ? 'Deve conter um valor maior que 1'
            : null,
        preco:
        values.preco === undefined
         ? 'Deve conter o preço do produto'
         : values.preco <= 0
            ? 'Deve conter um valor maior que 0'
            : null,
        perecivel:
        values.perecivel === undefined
        ? 'Deve selecionar uma das opções'
        : null,
      }),
    });
  
    return (
      <Layout>
    <Container size='responsive'>
        
        <Box mx="500">
        <Title>Cadastro de Produtos</Title>
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <TextInput
            label="Nome do produto"
            placeholder="Nome do produto"
            key={form.key('nome')}
            {...form.getInputProps('nome')}
            withAsterisk
          />
          <NumberInput
            mt="sm"
            label="Quantidade"
            placeholder="Quantidade do produto cadastrado"
            key={form.key('quantidade')}
            {...form.getInputProps('quantidade')}
            withAsterisk
          />
          <NumberInput
            mt="sm"
            label="Preço"
            placeholder="Preço do produto cadastrado"
            key={form.key('preco')}
            {...form.getInputProps('preco')}
            withAsterisk
          />
            <Radio.Group
            name="perecivel"
            label="Selecionar se o produto é perecível ou não"
            key={form.key('perecivel')}
            {...form.getInputProps('perecivel')}
            withAsterisk
            
            >
            <Group mt="xs">
            <Radio value="perecivelSim" label="Sim" />
            <Radio value="perecivelNao" label="Não" />

            </Group>
            </Radio.Group>
            <TextInput
            
            label="Descrição"
            placeholder="Descrição do produto"
            key={form.key('descricao')}
            {...form.getInputProps('descricao')}
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