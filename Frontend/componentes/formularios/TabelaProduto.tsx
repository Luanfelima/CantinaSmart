import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { ModalsProvider, modals } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

// Definição do tipo Produto
type Produto = {
  id_produto?: string;
  nome_p: string;
  categoria: string;
  preco: number;
  perecivel: boolean;
  descricao: string;
  unidade_medida: string;
};

const Example = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<Produto>[]>(
    () => [
      {
        accessorKey: 'nome_p',
        header: 'Nome do Produto',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.nome_p,
          onFocus: () => setValidationErrors({ ...validationErrors, nome_p: undefined }),
        },
      },
      {
        accessorKey: 'categoria',
        header: 'Categoria',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.categoria,
          onFocus: () => setValidationErrors({ ...validationErrors, categoria: undefined }),
        },
      },
      {
        accessorKey: 'preco',
        header: 'Preço',
        mantineEditTextInputProps: {
          type: 'number',
          required: true,
          error: validationErrors?.preco,
          onFocus: () => setValidationErrors({ ...validationErrors, preco: undefined }),
        },
      },
      {
        accessorKey: 'perecivel',
        header: 'Perecível',
        editVariant: 'select',
        mantineEditSelectProps: {
          data: ['Sim', 'Não'],
          required: true,
          error: validationErrors?.perecivel,
          onFocus: () => setValidationErrors({ ...validationErrors, perecivel: undefined }),
        },
      },
      {
        accessorKey: 'descricao',
        header: 'Descrição',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.descricao,
          onFocus: () => setValidationErrors({ ...validationErrors, descricao: undefined }),
        },
      },
      {
        accessorKey: 'unidade_medida',
        header: 'Unidade de Medida',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.unidade_medida,
          onFocus: () => setValidationErrors({ ...validationErrors, unidade_medida: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  const { mutateAsync: createProduto } = useCreateProduto();
  const { data: fetchedProdutos = [], isError: isLoadingProdutosError, isFetching: isFetchingProdutos, isLoading: isLoadingProdutos } = useGetProdutos();
  const { mutateAsync: updateProduto } = useUpdateProduto();
  const { mutateAsync: deleteProduto } = useDeleteProduto();

  const handleCreateProduto: MRT_TableOptions<Produto>['onCreatingRowSave'] = async ({ values, exitCreatingMode }) => {
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createProduto(values);
    exitCreatingMode();
  };

  const handleSaveProduto: MRT_TableOptions<Produto>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateProduto(values);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<Produto>) => {
    const id_produto = row.original.id_produto;
  
    if (id_produto) {
      modals.openConfirmModal({
        title: 'Tem certeza que você quer excluir este produto?',
        children: (
          <Text>Tem certeza que você quer excluir o produto {row.original.nome_p}? Essa ação não pode ser desfeita.</Text>
        ),
        labels: { confirm: 'Excluir', cancel: 'Cancelar' },
        confirmProps: { color: 'red' },
        onConfirm: () => deleteProduto(id_produto),
      });
    } else {
      console.error('ID do produto é inválido ou indefinido.');
    }
  };

  const table = useMantineReactTable({
    columns,
    data: fetchedProdutos,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id_produto,
    mantineToolbarAlertBannerProps: isLoadingProdutosError ? { color: 'red', children: 'Erro ao carregar dados' } : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateProduto,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveProduto,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar novo produto</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar Produto</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Editar">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Apagar">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo produto</Button>
    ),
    state: {
      isLoading: isLoadingProdutos,
      isSaving: false,
      showAlertBanner: isLoadingProdutosError,
      showProgressBars: isFetchingProdutos,
    },
  });

  return <MantineReactTable table={table} />;
};

function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: Produto) => {
      try {
        // Log para verificar os dados que estão sendo enviados
        console.log('Enviando dados do produto:', produto);

        // Verifique se todos os campos obrigatórios estão presentes
        if (!produto.nome_p || !produto.categoria || !produto.preco || !produto.descricao || !produto.unidade_medida) {
          throw new Error('Todos os campos obrigatórios devem ser preenchidos.');
        }

        // Chamada de API POST
        const response = await axios.post('http://localhost:3000/produtos', produto);

        // Log para verificar a resposta do servidor
        console.log('Resposta do servidor após a criação do produto:', response.data);

        return response.data;
      } catch (error: any) {
        // Tratamento de erro com log detalhado
        if (error.response) {
          console.error('Erro no servidor:', error.response.data);
        } else if (error.request) {
          console.error('Nenhuma resposta recebida do servidor:', error.request);
        } else {
          console.error('Erro na configuração da requisição:', error.message);
        }
        throw new Error('Falha ao criar o produto. Verifique os dados e tente novamente.');
      }
    },
    onMutate: (newProdutoInfo: Produto) => {
      // Atualiza a cache otimistamente antes da resposta do servidor
      queryClient.setQueryData(['produtos'], (prevProdutos: Produto[] | undefined) => [
        ...(prevProdutos || []),
        { ...newProdutoInfo, id_produto: (Math.random() + 1).toString(36).substring(7) },
      ]);
    },
    onSuccess: () => {
      // Invalida a query para garantir que os dados mais recentes são buscados após a criação
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      console.log('Novo produto criado com sucesso no banco de dados!');
    },
    onError: (error: any) => {
      // Log do erro no frontend
      console.error('Erro ao criar o produto no backend:', error.message);
    },
  });
}

function useGetProdutos() {
  return useQuery<Produto[]>({
    queryKey: ['produtos'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/produtos'); // chamada de API GET
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: Produto) => {
      try {
        console.log('Enviando dados para atualização:', produto);
        const response = await axios.put(`http://localhost:3000/produtos/${produto.id_produto}`, produto); // chamada de API PUT
        console.log('Resposta do servidor após atualização:', response.data); // Log da resposta do servidor
        return response.data;
      } catch (error) {
        console.error('Erro ao enviar a atualização ao servidor:', error);
        throw new Error('Falha ao atualizar o produto');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      console.log(`Produto ${variables.nome_p} atualizado com sucesso no banco de dados!`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar o produto no backend:', error);
    },
  });
}

function useDeleteProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_produto: string) => {
      try {
        console.log('Iniciando a exclusão do produto:', id_produto);
        const response = await axios.delete(`http://localhost:3000/produtos/${id_produto}`); // chamada de API DELETE
        console.log('Resposta do servidor após exclusão:', response.data); // Log da resposta do servidor
        return response.data;
      } catch (error) {
        console.error('Erro ao enviar a exclusão ao servidor:', error);
        throw new Error('Falha ao excluir o produto');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      console.log(`Produto com ID ${variables} excluído com sucesso no banco de dados!`);
    },
    onError: (error) => {
      console.error('Erro ao excluir o produto no backend:', error);
    },
  });
}

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);

export default ExampleWithProviders;

// Função de validação de produto
const validateProduto = (values: Produto) => {
  const errors: Record<string, string | undefined> = {
    nome_p: values.nome_p ? undefined : 'Nome do produto é obrigatório',
    categoria: values.categoria ? undefined : 'Categoria é obrigatória',
    preco: values.preco ? undefined : 'Preço é obrigatório',
    perecivel: values.perecivel !== undefined ? undefined : 'Campo perecível é obrigatório',
    descricao: values.descricao ? undefined : 'Descrição é obrigatória',
    unidade_medida: values.unidade_medida ? undefined : 'Unidade de medida é obrigatória',
  };
  return errors;
};