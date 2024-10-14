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
  id_produto: number;
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
        accessorKey: 'id_produto',
        header: 'ID',
        enableEditing: false, // Desativa a edição
        size: 0, // Define o tamanho da coluna como zero
        mantineTableHeadCellProps: { style: { display: 'none' } }, // Oculta no cabeçalho
        mantineTableBodyCellProps: { style: { display: 'none' } }, // Oculta no corpo
      },
      {
        accessorKey: 'nome_p',
        header: 'Nome do Produto',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.nome_p,
          onFocus: () => setValidationErrors({ ...validationErrors, nome_p: undefined }),
        },
      },
      {
        accessorKey: 'categoria',
        header: 'Categoria',
        mantineEditTextInputProps: {
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
          data: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ],
          required: true,
          error: validationErrors?.perecivel,
          onFocus: () => setValidationErrors({ ...validationErrors, perecivel: undefined }),
        },
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sim' : 'Não'),
      },
      {
        accessorKey: 'descricao',
        header: 'Descrição',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.descricao,
          onFocus: () => setValidationErrors({ ...validationErrors, descricao: undefined }),
        },
      },
      {
        accessorKey: 'unidade_medida',
        header: 'Unidade de Medida',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.unidade_medida,
          onFocus: () => setValidationErrors({ ...validationErrors, unidade_medida: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  const queryClient = useQueryClient();

  const {
    data: fetchedProdutos = [],
    isError: isLoadingProdutosError,
    isFetching: isFetchingProdutos,
    isLoading: isLoadingProdutos,
  } = useGetProdutos();

  const createProdutoMutation = useCreateProduto();
  const updateProdutoMutation = useUpdateProduto();
  const deleteProdutoMutation = useDeleteProduto();

  const handleCreateProduto: MRT_TableOptions<Produto>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    const newProduto = {
      ...values,
      perecivel: values.perecivel === 'true',
    };

    await createProdutoMutation.mutateAsync(newProduto);
    exitCreatingMode();
  };

  const handleSaveProduto: MRT_TableOptions<Produto>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    const updatedProduto = {
      ...values,
      perecivel: values.perecivel === 'true' || values.perecivel === true,
    };

    await updateProdutoMutation.mutateAsync(updatedProduto);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<Produto>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir este produto?',
      children: (
        <Text>
          Tem certeza que você quer excluir o produto {row.original.nome_p}? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => handleDeleteProduto(row.original.id_produto),
    });

  const handleDeleteProduto = async (produtoId: number) => {
    try {
      if (!produtoId && produtoId !== 0) {
        console.error('ID do produto é inválido:', produtoId);
        return;
      }

      await deleteProdutoMutation.mutateAsync(produtoId);
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
    }
  };

  const table = useMantineReactTable({
    columns,
    data: fetchedProdutos,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.id_produto),
    mantineToolbarAlertBannerProps: isLoadingProdutosError
      ? { color: 'red', children: 'Erro ao carregar dados' }
      : undefined,
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

// Funções auxiliares de CRUD
function useGetProdutos() {
  return useQuery<Produto[]>({
    queryKey: ['produtos'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/produtos');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: Omit<Produto, 'id_produto'>) => {
      const response = await axios.post('http://localhost:3000/produtos', produto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: Produto) => {
      await axios.put(`http://localhost:3000/produtos/${produto.id_produto}`, produto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

function useDeleteProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produtoId: number) => {
      if (!produtoId && produtoId !== 0) {
        throw new Error('ID do produto é inválido.');
      }
      await axios.delete(`http://localhost:3000/produtos/${produtoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
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

const validateRequired = (value: any) => {return value !== null && value !== undefined && value.toString().trim().length > 0;};
const validateMinLength = (value: string, minLength: number) => {return value.trim().length >= minLength;};
const validateNomeProduto = (nome: string) => {return /^[^\d]+$/.test(nome.trim()) && validateMinLength(nome, 3);}; // Nome do produto não deve conter números e deve ter no mínimo 3 caracteres
const validatePreco = (preco: any) => {const numberPreco = Number(preco); return !isNaN(numberPreco) && numberPreco >= 0;}; // Verifica se o preço é um número positivo
const validateDescricao = (descricao: string) => {return validateMinLength(descricao, 4);}; // Descrição deve ter no mínimo 4 caracteres

const validateProduto = (values: Produto) =>{
  const errors: Record<string, string | undefined> = {};
  
  // Validação do nome do produto
  if (!validateRequired(values.nome_p)) {
    errors.nome_p = 'Nome do produto é obrigatório';
  } else if (!validateNomeProduto(values.nome_p)) {
    errors.nome_p = 'Nome do produto inválido';
  }
  // Validação da categoria
  if (!validateRequired(values.categoria)) {
    errors.categoria = 'Categoria é obrigatória';
  } else if (!validateMinLength(values.categoria, 3)) {
    errors.categoria = 'Categoria inválida'
  }
  // Validação do preço
  if (!validateRequired(values.preco)) {
    errors.preco = 'Preço é obrigatório';
  } else if (!validatePreco(values.preco)) {
    errors.preco = 'Preço inválido';
  }
  // Validação do campo perecível
  if (values.perecivel === null || values.perecivel === undefined) {
    errors.perecivel = 'Campo perecível é obrigatório';
  }
  // Validação da descrição
  if (!validateRequired(values.descricao)) {
    errors.descricao = 'Descrição é obrigatória';
  } else if (!validateDescricao(values.descricao)) {
    errors.descricao = 'Descrição deve ter no mínimo 10 caracteres';
  }
  // Validação da unidade de medida
  if (!validateRequired(values.unidade_medida)) {
    errors.unidade_medida = 'Unidade de medida é obrigatória';
  }
  return errors;
};