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

type Categoria = {
  id_categorias: number;
  nome: string;
  descricao: string;
};

const Example = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<Categoria>[]>(
    () => [
      {
        accessorKey: 'nome',
        header: 'Nome',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.nome,
          onFocus: () => setValidationErrors({ ...validationErrors, nome: undefined }),
        },
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
    ],
    [validationErrors],
  );

  const queryClient = useQueryClient();

  const {
    data: fetchedCategorias = [],
    isError: isLoadingCategoriasError,
    isFetching: isFetchingCategorias,
    isLoading: isLoadingCategorias,
  } = useGetCategorias();

  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();
  const deleteCategoriaMutation = useDeleteCategoria();

  const handleCreateCategoria: MRT_TableOptions<Categoria>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateCategoria(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createCategoriaMutation.mutateAsync(values);
    exitCreatingMode();
  };

  const handleSaveCategoria: MRT_TableOptions<Categoria>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateCategoria(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateCategoriaMutation.mutateAsync(values);
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<Categoria>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir essa categoria?',
      children: (
        <Text>
          Tem certeza que você quer excluir a categoria {row.original.nome}? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteCategoriaMutation.mutateAsync(row.original.id_categorias),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedCategorias,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.id_categorias),
    mantineToolbarAlertBannerProps: isLoadingCategoriasError
      ? { color: 'red', children: 'Erro ao carregar dados' }
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
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
        <Title order={3}>Editar Categoria</Title>
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar nova categoria</Button>
    ),
    state: {
      isLoading: isLoadingCategorias,
      isSaving: false,
      showAlertBanner: isLoadingCategoriasError,
      showProgressBars: isFetchingCategorias,
    },
  });

  return <MantineReactTable table={table} />;
};

function useCreateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoria: Omit<Categoria, 'id_categorias'>) => {
      const response = await axios.post('http://localhost:3000/categorias', categoria);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

function useGetCategorias() {
  return useQuery<Categoria[]>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/categorias');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoria: Categoria) => {
      await axios.put(`http://localhost:3000/categorias/${categoria.id_categorias}`, categoria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

function useDeleteCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoriaId: number) => {
      await axios.delete(`http://localhost:3000/categorias/${categoriaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
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
const validateNomeCategoria = (nome: string) => {return /^[^\d]+$/.test(nome.trim()) && validateMinLength(nome, 3);}; // Nome da categoria não deve conter números e deve ter no mínimo 3 caracteres

function validateCategoria(categoria: Categoria) {
  const errors: Record<string, string | undefined> = {};
  
  // Validação do nome da categoria
  if (!validateRequired(categoria.nome)) {
    errors.nomeCategoria = 'É necessário inserir o nome da categoria';
  } else if (!validateNomeCategoria(categoria.nome)) {
    errors.nomeCategoria = 'O nome da categoria precisa ter mais do que 2 caracteres e não conter números';
  }
  return errors;
}