import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; //if using mantine date picker features
import 'mantine-react-table/styles.css'; //make sure MRT styles were imported in your app root (once)
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
import { type User, CargosPreDefinidos } from './makeDataCadastroFuncionario';

const Example = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'nome',
        header: 'Nome',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.nome,
          onFocus: () => setValidationErrors({ ...validationErrors, nome: undefined }),
        },
      },
      {
        accessorKey: 'email',
        header: 'E-mail',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.email,
          onFocus: () => setValidationErrors({ ...validationErrors, email: undefined }),
        },
      },
      {
        accessorKey: 'telefone',
        header: 'Telefone',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.telefone,
          onFocus: () => setValidationErrors({ ...validationErrors, telefone: undefined }),
        },
      },
      {
        accessorKey: 'cpf',
        header: 'CPF',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.cpf,
          onFocus: () => setValidationErrors({ ...validationErrors, cpf: undefined }),
        },
      },
      {
        accessorKey: 'cargo',
        header: 'Cargo',
        editVariant: 'select',
        mantineEditSelectProps: {
          data: CargosPreDefinidos,
          required: true,
          error: validationErrors?.cargo,
          onFocus: () => setValidationErrors({ ...validationErrors, cargo: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  const { mutateAsync: createUser } = useCreateUser();
  const { data: fetchedUsers = [], isError: isLoadingUsersError, isFetching: isFetchingUsers, isLoading: isLoadingUsers } = useGetUsers();
  const { mutateAsync: updateUser } = useUpdateUser();
  const { mutateAsync: deleteUser } = useDeleteUser();

  const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({ values, exitCreatingMode }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    exitCreatingMode();
  };

  const handleSaveUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateUser(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); // exit editing mode
  };

  const openDeleteConfirmModal = (row: MRT_Row<User>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir esse funcionário?',
      children: (
        <Text>Tem certeza que você quer excluir o funcionário {row.original.nome}? Essa ação não pode ser desfeita.</Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUser(row.original.id),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingUsersError ? { color: 'red', children: 'Error loading data' } : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar novo funcionário</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar Funcionário</Title>
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo funcionário</Button>
    ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: false,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return <MantineReactTable table={table} />;
};

function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (user: User) => {
      try {
        // Validação básica dos dados
        if (!user.nome || !user.email || !user.telefone || !user.cpf || !user.cargo) {
          throw new Error('Todos os campos são obrigatórios.');
        }
        
        // Chamada de API POST
        const response = await axios.post('http://localhost:3000/funcionarios', user);

        // Retorna os dados da resposta do servidor
        return response.data;
      } catch (error: any) {
        // Tratamento de erro
        console.error('Erro ao criar novo funcionário:', error);
        throw new Error('Falha ao criar o funcionário. Verifique os dados e tente novamente.');
      }
    },
    onMutate: (newUserInfo: User) => {
      // Atualiza a cache otimistamente antes da resposta do servidor
      queryClient.setQueryData(['users'], (prevUsers: User[] | undefined) => [
        ...(prevUsers || []),
        { ...newUserInfo, id: (Math.random() + 1).toString(36).substring(7) },
      ]);
    },
    onSuccess: () => {
      // Invalida a query para garantir que os dados mais recentes são buscados após a criação
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log('Novo funcionário criado com sucesso no banco de dados!');
    },
    onError: (error: any) => {
      // Mostra uma mensagem de erro no caso de falha
      console.error('Erro ao criar o funcionário no backend:', error.message);
    },
  });
}

function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/funcionarios'); // chamada de API GET
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      try {
        console.log('Enviando dados para atualização:', user);
        const response = await axios.put(`http://localhost:3000/funcionarios/${user.id}`, user); // chamada de API PUT
        console.log('Resposta do servidor após atualização:', response.data); // Log da resposta do servidor
        return response.data;
      } catch (error) {
        console.error('Erro ao enviar a atualização ao servidor:', error);
        throw new Error('Falha ao atualizar o funcionário');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log(`Funcionário ${variables.nome} atualizado com sucesso no banco de dados!`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar o usuário no backend:', error);
    },
  });
}

function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      try {
        console.log('Iniciando a exclusão do usuário:', userId);
        const response = await axios.delete(`http://localhost:3000/funcionarios/${userId}`); // chamada de API DELETE
        console.log('Resposta do servidor após exclusão:', response.data); // Log da resposta do servidor
        return response.data;
      } catch (error) {
        console.error('Erro ao enviar a exclusão ao servidor:', error);
        throw new Error('Falha ao excluir o funcionário');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      console.log(`Funcionário com ID ${variables} excluído com sucesso no banco de dados!`);
    },
    onError: (error) => {
      console.error('Erro ao excluir o usuário no backend:', error);
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

const validateRequired = (value: any) => value !== null && !!value.length;
const validateEmail = (email: string) =>
  !!email.length && email.toLowerCase().match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
const validateCpf = (cpf: string) =>
  !!cpf.length && cpf.replace(/\D/g, '').match(/^[0-9]{11}$/);
const validateTelefone = (telefone: string) =>
  !!telefone.length && telefone.replace(/\D/g, '').match(/^[0-9]{10,11}$/);

const validateUser = (values: User) => {
  const errors: Record<string, string | undefined> = {
    nome: validateRequired(values.nome) ? undefined : 'Nome é obrigatório',
    email: validateEmail(values.email) ? undefined : 'E-mail inválido',
    cpf: validateCpf(values.cpf) ? undefined : 'CPF inválido',
    telefone: validateTelefone(values.telefone) ? undefined : 'Telefone inválido',
    cargo: validateRequired(values.cargo) ? undefined : 'Cargo é obrigatório',
  };
  return errors;
};