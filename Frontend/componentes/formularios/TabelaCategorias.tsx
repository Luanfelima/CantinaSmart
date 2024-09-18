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

// Definição do tipo Categoria
type Categoria = {
  id_categoria?: string;
  nomeCategoria: string;
  descricao?: string;
};

const Example = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Categoria>[]>(
    () => [
      {
        accessorKey: 'nomeCategoria',
        header: 'Nome da categoria',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.nomeCategoria,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nomeCategoria: undefined,
            }),
        },
      },
      {
        accessorKey: 'descricao',
        header: 'Descrição',
        mantineEditTextInputProps: {
          type: 'text',
          required: false,
        },
      },
    ],
    [validationErrors],
  );

  // Chamar os hooks de API
  const { mutateAsync: createCategoria, status: createStatus } = useCreateCategoria();
  const isCreatingCategoria = createStatus === 'pending';

  const {
    data: fetchedCategorias = [],
    isError: isLoadingCategoriasError,
    isFetching: isFetchingCategorias,
    isLoading: isLoadingCategorias,
  } = useGetCategorias();

  const { mutateAsync: updateCategoria, status: updateStatus } = useUpdateCategoria();
  const isUpdatingCategoria = updateStatus === 'pending';

  const { mutateAsync: deleteCategoria, status: deleteStatus } = useDeleteCategoria();
  const isDeletingCategoria = deleteStatus === 'pending';

  // Ação de criação
  const handleCreateCategoria: MRT_TableOptions<Categoria>['onCreatingRowSave'] =
    async ({ values, exitCreatingMode }) => {
      const newValidationErrors = validateCategoria(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await createCategoria(values);
      exitCreatingMode();
    };

  // Ação de atualização
  const handleSaveCategoria: MRT_TableOptions<Categoria>['onEditingRowSave'] =
    async ({ values, table }) => {
      const newValidationErrors = validateCategoria(values);
      if (Object.values(newValidationErrors).some((error) => error)) {
        setValidationErrors(newValidationErrors);
        return;
      }
      setValidationErrors({});
      await updateCategoria(values);
      table.setEditingRow(null); // sair do modo de edição
    };

  // Ação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Categoria>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir essa categoria?',
      children: (
        <Text>
          Tem certeza que você quer excluir {row.original.nomeCategoria}? Essa ação não pode ser
          desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteCategoria(row.original.id_categoria!),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedCategorias,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id_categoria!,
    mantineToolbarAlertBannerProps: isLoadingCategoriasError
      ? {
          color: 'red',
          children: 'Erro ao carregar os dados',
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateCategoria,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveCategoria,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar nova categoria</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar categoria</Title>
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
      <Button
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Cadastrar nova categoria
      </Button>
    ),
    state: {
      isLoading: isLoadingCategorias,
      isSaving: isCreatingCategoria || isUpdatingCategoria || isDeletingCategoria,
      showAlertBanner: isLoadingCategoriasError,
      showProgressBars: isFetchingCategorias,
    },
  });

  return <MantineReactTable table={table} />;
};

// Função para criar categoria (POST)
function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoria: Categoria) => {
      try {
        const response = await axios.post('http://localhost:3000/categorias', categoria);
        return response.data;
      } catch (error: any) {
        if (axios.isAxiosError(error)) {
          console.error('Erro ao criar categoria:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
        } else {
          console.error('Erro desconhecido:', error);
        }
        throw new Error('Falha ao criar a categoria.');
      }
    },
    onMutate: (newCategoriaInfo: Categoria) => {
      queryClient.setQueryData(['users'], (prevCategorias: Categoria[] | undefined) => [
        ...(prevCategorias || []),
        { ...newCategoriaInfo, id_categoria: (Math.random() + 1).toString(36).substring(7) },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('Nova categoria criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar categoria:', error.message);
    },
  });
}

// Função para obter categorias (GET)
function useGetCategorias() {
  return useQuery<Categoria[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/categorias');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

// Função para atualizar categoria (PUT)
function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoria: Categoria) => {
      try {
        const response = await axios.put(
          `http://localhost:3000/categorias/${categoria.id_categoria}`,
          categoria,
        );
        return response.data;
      } catch (error: any) {
        console.error('Erro ao atualizar categoria:', error.message);
        throw new Error('Falha ao atualizar a categoria.');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log(`Categoria ${variables.nomeCategoria} atualizada com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar categoria:', error.message);
    },
  });
}

// Função para excluir categoria (DELETE)
function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id_categoria: string) => {
      try {
        const response = await axios.delete(`http://localhost:3000/categorias/${id_categoria}`);
        return response.data;
      } catch (error: any) {
        console.error('Erro ao excluir categoria:', error.message);
        throw new Error('Falha ao excluir a categoria.');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log(`Categoria com ID ${variables} excluída com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Erro ao excluir categoria:', error.message);
    },
  });
}

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  // Coloque isso com seus outros provedores do react-query perto da raiz do seu app
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);

export default ExampleWithProviders;

// Função de validação
const validateRequired = (value: any) => value !== null && !!value.length;

function validateCategoria(categoria: Categoria) {
  return {
    nomeCategoria: !validateRequired(categoria.nomeCategoria)
      ? 'É necessário inserir o nome da categoria'
      : categoria.nomeCategoria.length <= 2
      ? 'O nome da categoria precisa ter mais do que 2 caracteres'
      : '',
  };
}
