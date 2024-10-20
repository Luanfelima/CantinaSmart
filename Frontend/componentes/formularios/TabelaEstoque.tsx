import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; // Importar estilos do seletor de data Mantine se utilizado
import 'mantine-react-table/styles.css'; // Importar estilos do Mantine React Table
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
import { useForm } from '@mantine/form';
import { ModalsProvider, modals } from '@mantine/modals';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Definição de tipo para o item de estoque
type Estoque = {
  id: string;
  nomeProduto: string;
  quantidade: string;
};

// Função do componente principal
const Example = () => {
  // Estado para erros de validação
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  // Definir colunas para a tabela
  const columns = useMemo<MRT_ColumnDef<Estoque>[]>(
    () => [
      {
        accessorKey: 'nomeProduto',
        header: 'Nome do Produto',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.nomeProduto,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nomeProduto: undefined,
            }),
        },
      },
      {
        accessorKey: 'quantidade',
        header: 'Quantidade',
        mantineEditTextInputProps: {
          type: 'String',
          required: true,
          error: validationErrors?.quantidade,
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              quantidade: undefined,
            }),
        },
      },
    ],
    [validationErrors],
  );

  // Usar hooks personalizados para operações CRUD
  const { mutateAsync: createUser, isPending: isCreatingUser } = useCreateUser();
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  const { mutateAsync: updateUser, isPending: isUpdatingUser } = useUpdateUser();
  const { mutateAsync: deleteUser, isPending: isDeletingUser } = useDeleteUser();

  // Lidar com a criação de um novo item de estoque
  const handleCreateUser: MRT_TableOptions<Estoque>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateEstoque(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    exitCreatingMode();
  };

  // Lidar com a atualização de um item de estoque existente
  const handleSaveUser: MRT_TableOptions<Estoque>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateEstoque(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); // Sair do modo de edição
  };

  // Abrir modal de confirmação antes de excluir um item de estoque
  const openDeleteConfirmModal = (row: MRT_Row<Estoque>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir a quantidade do produto?',
      children: (
        <Text>
          Tem certeza que você quer excluir {row.original.nomeProduto}? Essa ação
          não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUser(row.original.id),
    });

  // Inicializar a tabela com configurações e manipuladores de eventos
  const table = useMantineReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'red',
          children: 'Error loading data',
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar estoque</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar estoque do produto</Title>
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
          table.setCreatingRow(true); // Abrir o modal de criação de linha
        }}
      >
        Cadastrar novo estoque
      </Button>
    ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  // Renderizar o componente da tabela
  return <MantineReactTable table={table} />;
};

// Hook CREATE para enviar novo item de estoque para a API
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Estoque) => {
      // Simular chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    // Atualização otimista no lado do cliente
    onMutate: (newUserInfo: Estoque) => {
      queryClient.setQueryData(
        ['users'],
        (prevUsers: any) =>
          [
            ...prevUsers,
            {
              ...newUserInfo,
              id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Estoque[],
      );
    },
    // Recarregar usuários após mutação (desativado para demonstração)
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

// Hook READ para obter itens de estoque da API
function useGetUsers() {
  return useQuery<Estoque[]>({
    queryKey: ['users'],
    refetchOnWindowFocus: false,
  });
}

// Hook UPDATE para atualizar item de estoque na API
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: Estoque) => {
      // Simular chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    // Atualização otimista no lado do cliente
    onMutate: (newUserInfo: Estoque) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.map((prevUser: Estoque) =>
          prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
        ),
      );
    },
    // Recarregar usuários após mutação (desativado para demonstração)
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

// Hook DELETE para excluir item de estoque na API
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      // Simular chamada à API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return Promise.resolve();
    },
    // Atualização otimista no lado do cliente
    onMutate: (userId: string) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.filter((user: Estoque) => user.id !== userId),
      );
    },
    // Recarregar usuários após mutação (desativado para demonstração)
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

const queryClient = new QueryClient();

// Componente com providers para react-query e modais
const ExampleWithProviders = () => (
  // Coloque esses providers próximo à raiz do seu aplicativo
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);

export default ExampleWithProviders;

// Funções de validação
const validateRequired = (value: any) => {return value !== null && value !== undefined && !!value.length;};
const validateMinLength = (value: string, minLength: number) => {return !!value && value.length >= minLength;};
const validateSomenteTexto = (value: string) => {return /^[^\d]+$/.test(value);};
const validateQuantidade = (quantidade: string) => {return /^[1-9]\d{0,2}$/.test(quantidade);}; // Regex para inteiros positivos maiores que zero, até três dígitos

// Função para validar campos do item de estoque
function validateEstoque(user: Estoque) {
  const errors: Record<string, string | undefined> = {};
  
  if (!validateRequired(user.nomeProduto)) {
    errors.nomeProduto = 'Nome do produto é obrigatório';
  } else if (!validateMinLength(user.nomeProduto, 2)) {
    errors.nomeProduto = 'Nome do produto inválido';
  } else if (!validateSomenteTexto(user.nomeProduto)) {
    errors.nomeProduto = 'Nome do produto inválido';
  }
  if (!validateRequired(user.quantidade)) {
    errors.quantidade = 'Quantidade obrigatória';
  } else if (!validateQuantidade(user.quantidade)) {
    errors.quantidade = 'Quantidade inválida';
  }
  return errors;
}