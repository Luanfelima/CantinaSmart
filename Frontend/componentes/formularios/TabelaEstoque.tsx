// Importa os estilos necessários para os componentes do Mantine e da tabela
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; // se estiver usando recursos de seletor de data do Mantine
import 'mantine-react-table/styles.css'; // certifique-se de que os estilos do MRT foram importados na raiz do seu aplicativo (uma vez)

// Importa hooks e funções do React e outras bibliotecas
import { useMemo, useState } from 'react';

// Importa componentes e tipos do Mantine React Table
import {
  MRT_EditActionButtons,
  MantineReactTable,
  // createRow, // comentado, pois não está sendo utilizado
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';

// Importa componentes do Mantine para a interface do usuário
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';

// Importa o hook useForm do Mantine (não está sendo utilizado neste código)
import { useForm } from '@mantine/form';

// Importa o provedor de modais e a função de modais do Mantine
import { ModalsProvider, modals } from '@mantine/modals';

// Importa ícones da biblioteca Tabler Icons
import { IconEdit, IconTrash } from '@tabler/icons-react';

// Importa funções e hooks do React Query para gerenciamento de dados assíncronos
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Define o tipo User com os campos correspondentes
type User = {
  id: string;
  nomeProduto: string;
  quantidade: string;
};

// Componente principal do exemplo
const Example = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  // Define as colunas da tabela usando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'nomeProduto', // Chave de acesso ao campo 'nomeProduto'
        header: 'Nome do Produto', // Rótulo da coluna
        mantineEditTextInputProps: {
          type: 'text',
          required: true, // Campo obrigatório
          error: validationErrors?.nomeProduto, // Exibe erro se houver

          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nomeProduto: undefined, // Limpa o erro ao focar
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

  // Chama o hook de criação (CREATE)
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();

  // Chama o hook de leitura (READ)
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();

  // Chama o hook de atualização (UPDATE)
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();

  // Chama o hook de exclusão (DELETE)
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  // Ação de criação
  const handleCreateUser: MRT_TableOptions<User>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    // Valida os dados do estoque
    const newValidationErrors = validateEstoque(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await createUser(values); // Realiza a mutação para criar o usuário
    exitCreatingMode(); // Sai do modo de criação
  };

  // Ação de atualização
  const handleSaveUser: MRT_TableOptions<User>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    // Valida os dados do estoque
    const newValidationErrors = validateEstoque(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await updateUser(values); // Realiza a mutação para atualizar o usuário
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Ação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<User>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir a quantidade do produto?',
      children: (
        <Text>
          Tem certeza que você quer excluir {row.original.nomeProduto}?
          Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUser(row.original.id), // Realiza a mutação para deletar o usuário
    });

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedUsers, // Dados dos usuários buscados
    createDisplayMode: 'modal', // Modo de exibição ao criar (padrão)
    editDisplayMode: 'modal', // Modo de exibição ao editar (padrão)
    enableEditing: true, // Habilita a edição na tabela
    getRowId: (row) => row.id, // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'red',
          children: 'Erro ao carregar dados', // Mensagem de erro se houver problema ao carregar os dados
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px', // Define a altura mínima da tabela
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateUser, // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveUser, // Função para salvar a edição
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar estoque</Title>
        {internalEditComponents} {/* Componentes internos de edição */}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} /> {/* Botões de ação */}
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
            <IconEdit /> {/* Ícone de edição */}
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Apagar">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash /> {/* Ícone de exclusão */}
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        onClick={() => {
          table.setCreatingRow(true); // Forma mais simples de abrir o modal de criação sem valores padrão
          // ou você pode passar um objeto de linha para definir valores padrão com a função `createRow`
          // table.setCreatingRow(
          //   createRow(table, {
          //     // opcionalmente passe valores padrão para a nova linha, útil para dados aninhados ou outros cenários complexos
          //   }),
          // );
        }}
      >
        Cadastrar novo estoque
      </Button>
    ),
    state: {
      isLoading: isLoadingUsers, // Estado de carregamento
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser, // Estado de salvamento
      showAlertBanner: isLoadingUsersError, // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingUsers, // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Hook de criação (CREATE) - envia um novo usuário para a API
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      // Envia a requisição de criação para a API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chamada de API
      return Promise.resolve();
    },
    // Atualização otimista no lado do cliente
    onMutate: (newUserInfo: User) => {
      queryClient.setQueryData(
        ['users'],
        (prevUsers: any) =>
          [
            ...prevUsers,
            {
              ...newUserInfo,
              id: (Math.random() + 1).toString(36).substring(7), // Gera um ID aleatório
            },
          ] as User[],
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), // Refaz o fetch dos usuários após a mutação (desabilitado para o demo)
  });
}

// Hook de leitura (READ) - obtém usuários da API
function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Hook de atualização (UPDATE) - atualiza o usuário na API
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      // Envia a requisição de atualização para a API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chamada de API
      return Promise.resolve();
    },
    // Atualização otimista no lado do cliente
    onMutate: (newUserInfo: User) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.map((prevUser: User) =>
          prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
        ),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), // Refaz o fetch dos usuários após a mutação (desabilitado para o demo)
  });
}

// Hook de exclusão (DELETE) - deleta o usuário na API
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      // Envia a requisição de exclusão para a API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chamada de API
      return Promise.resolve();
    },
    // Atualização otimista no lado do cliente
    onMutate: (userId: string) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.filter((user: User) => user.id !== userId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), // Refaz o fetch dos usuários após a mutação (desabilitado para o demo)
  });
}

// Cria uma instância do QueryClient para gerenciar o cache
const queryClient = new QueryClient();

// Componente que envolve o Example com os provedores necessários
const ExampleWithProviders = () => (
  // Coloque isso com seus outros provedores do react-query próximo à raiz do seu aplicativo
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);

// Exporta o componente padrão
export default ExampleWithProviders;

// Funções de validação

// Valida se o valor é obrigatório (não nulo, não indefinido e não vazio)
const validateRequired = (value: any) => {
  return value !== null && value !== undefined && !!value.length;
};

// Valida se o valor tem um comprimento mínimo
const validateMinLength = (value: string, minLength: number) => {
  return !!value && value.length >= minLength;
};

// Valida se o valor contém somente texto (sem dígitos)
const validateSomenteTexto = (value: string) => {
  return /^[^\d]+$/.test(value);
};

// Valida a quantidade (números naturais positivos maiores que zero, até 3 dígitos)
const validateQuantidade = (quantidade: string) => {
  return /^[1-9]\d{0,2}$/.test(quantidade);
};

// Função que valida todos os campos do estoque
function validateEstoque(user: User) {
  const errors: Record<string, string | undefined> = {};

  // Validação do nome do produto
  if (!validateRequired(user.nomeProduto)) {
    errors.nomeProduto = 'Nome do produto é obrigatório';
  } else if (!validateMinLength(user.nomeProduto, 2)) {
    errors.nomeProduto = 'Nome do produto inválido';
  } else if (!validateSomenteTexto(user.nomeProduto)) {
    errors.nomeProduto = 'Nome do produto inválido';
  }

  // Validação da quantidade
  if (!validateRequired(user.quantidade)) {
    errors.quantidade = 'Quantidade obrigatória';
  } else if (!validateQuantidade(user.quantidade)) {
    errors.quantidade = 'Quantidade inválida';
  }

  return errors;
}