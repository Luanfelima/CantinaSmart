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
import api from '../../api/api';

// Definição do tipo Categoria
type Categoria = {
  id_categorias: number;
  nome: string;
  descricao: string;
};

const CadastroCategoria = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const queryClient = useQueryClient();

  // Função para buscar as categorias da API
  const {
    data: fetchedCategorias = [],
    error,
    isError: isLoadingCategoriasError,
    isFetching: isFetchingCategorias,
    isLoading: isLoadingCategorias,
  } = useGetCategorias();

  if (isLoadingCategoriasError) {
    console.error('Erro ao buscar categorias:', error);
    return <div>Erro ao carregar as categorias. Por favor, tente novamente mais tarde.</div>;
  }

  // Mutations para criar, atualizar e deletar categorias
  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();
  const deleteCategoriaMutation = useDeleteCategoria();

  // Função para salvar nova categoria
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
    try {
      await createCategoriaMutation.mutateAsync(values);
      exitCreatingMode(); // Sai do modo de criação
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  };

  // Função para salvar alterações na categoria
  const handleSaveCategoria: MRT_TableOptions<Categoria>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateCategoria(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    try {
      await updateCategoriaMutation.mutateAsync(values); // Atualiza a categoria
      table.setEditingRow(null); // Sai do modo de edição
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  };

  // Modal de confirmação para excluir uma categoria
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
      onConfirm: async () => {
        try {
          await deleteCategoriaMutation.mutateAsync(row.original.id_categorias); // Exclui a categoria
        } catch (error) {
          console.error('Erro ao excluir categoria:', error);
        }
      },
    });

  // Definição das colunas da tabela
  const columns = useMemo<MRT_ColumnDef<Categoria>[]>(() => [
    {
      accessorKey: 'id_categorias',
      header: 'ID',
      enableEditing: false, // Desativa a edição
      size: 0, // Oculta a coluna de ID
      mantineTableHeadCellProps: { style: { display: 'none' } }, // Oculta no cabeçalho
      mantineTableBodyCellProps: { style: { display: 'none' } }, // Oculta no corpo da tabela
    },
    {
      accessorKey: 'nome',
      header: 'Nome',
      mantineEditTextInputProps: {
        required: true, // Campo obrigatório
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
  ], [validationErrors]);

  // Configuração da tabela
  const table = useMantineReactTable({
    columns,
    data: fetchedCategorias, // Dados vindos da API
    createDisplayMode: 'modal', // Exibe modal para criação
    editDisplayMode: 'modal', // Exibe modal para edição
    enableEditing: true, // Habilita edição
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

// Funções auxiliares de CRUD
function useGetCategorias() {
  return useQuery<Categoria[], Error>({
    queryKey: ['categorias'],
    queryFn: async () => {
      const response = await api.get('/categorias');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useCreateCategoria() {
  const queryClient = useQueryClient();

  return useMutation<Categoria, Error, Omit<Categoria, 'id_categorias'>>({
    mutationFn: async (categoria) => {
      const response = await api.post('/categorias', categoria);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
    onError: (error) => {
      console.error('Erro ao criar categoria:', error);
    },
  });
}

function useUpdateCategoria() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Categoria>({
    mutationFn: async (categoria) => {
      await api.put(`/categorias/${categoria.id_categorias}`, categoria);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar categoria:', error);
    },
  });
}

function useDeleteCategoria() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (categoriaId) => {
      await api.delete(`/categorias/${categoriaId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir categoria:', error);
    },
  });
}

const queryClient = new QueryClient();

const CadastroCategoriaWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroCategoria />
    </ModalsProvider>
  </QueryClientProvider>
);

export default CadastroCategoriaWithProviders;

// Funções de validação
const validateRequired = (value: any) => value !== null && value !== undefined && value.toString().trim().length > 0;
const validateMinLength = (value: string, minLength: number) => value.trim().length >= minLength;
function validateCategoria(categoria: Categoria) {const errors: Record<string, string | undefined> = {};

  if (!validateRequired(categoria.nome)) {
    errors.nome = 'É necessário inserir o nome da categoria';
  } else if (!validateMinLength(categoria.nome, 2)) {
    errors.nome = 'O nome da categoria precisa ter mais do que 2 caracteres';
  }
  return errors;
}