// Importa os estilos necessários para os componentes do Mantine e da tabela
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css'; // se estiver usando recursos de date picker do Mantine
import 'mantine-react-table/styles.css'; // certifique-se de que os estilos do MRT foram importados na raiz do seu app

// Importa hooks e funções do React e outras bibliotecas
import { useMemo, useState } from 'react';

// Importa componentes e tipos do Mantine React Table
import {
  MRT_EditActionButtons,
  MantineReactTable,
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

// Componente principal que renderiza a tabela de estoque
const Example = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  // Define as colunas da tabela utilizando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'nomeProduto', // Chave de acesso ao campo 'nomeProduto'
        header: 'Nome do Produto',   // Rótulo da coluna
        mantineEditTextInputProps: {
          type: 'text',
          required: true,                      // Campo obrigatório
          error: validationErrors?.nomeProduto, // Exibe erro se houver
          onFocus: () =>
            setValidationErrors({
              ...validationErrors,
              nomeProduto: undefined,
            }), // Limpa o erro ao focar
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

  // Chama o hook CREATE
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();

  // Chama o hook READ
  const {
    data: fetchedUsers = [],                // Dados dos usuários (estoque)
    isError: isLoadingUsersError,           // Indica se houve erro ao carregar
    isFetching: isFetchingUsers,            // Indica se está buscando dados
    isLoading: isLoadingUsers,              // Indica se está carregando
  } = useGetUsers();

  // Chama o hook UPDATE
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();

  // Chama o hook DELETE
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  // Ação de CREATE
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
    await createUser(values); // Realiza a mutação para criar o estoque
    exitCreatingMode();       // Sai do modo de criação
  };

  // Ação de UPDATE
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
    await updateUser(values); // Realiza a mutação para atualizar o estoque
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Ação de DELETE
  const openDeleteConfirmModal = (row: MRT_Row<User>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir a quantidade do produto?', // Título do modal
      children: (
        <Text>
          Tem certeza que você quer excluir {row.original.nomeProduto}?
          Essa ação não pode ser desfeita.
        </Text>
      ), // Conteúdo do modal
      labels: { confirm: 'Excluir', cancel: 'Cancelar' }, // Botões do modal
      confirmProps: { color: 'red' }, // Estilo do botão de confirmação
      onConfirm: () => deleteUser(row.original.id), // Ação ao confirmar exclusão
    });

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedUsers, // Dados do estoque buscados
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal',   // Define que o formulário de edição será exibido em um modal
    enableEditing: true,        // Habilita a edição na tabela
    getRowId: (row) => row.id,  // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'red',
          children: 'Erro ao carregar dados',
        }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateUser,               // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveUser,                  // Função para salvar a edição
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
          table.setCreatingRow(true); // Abre o modal de criação sem valores padrão
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
      isLoading: isLoadingUsers,                                  // Estado de carregamento
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser, // Estado de salvamento
      showAlertBanner: isLoadingUsersError,                       // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingUsers,                          // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Hook CREATE (cria novo usuário na API)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      // Envia a requisição de criação para a API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chamada API
      return Promise.resolve();
    },
    // Atualização otimista no cliente
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
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), // Refaz o fetch após a mutação (desabilitado para o demo)
  });
}

// Hook READ (obtém usuários da API)
function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ['users'], // Chave da query
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Hook UPDATE (atualiza usuário na API)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: User) => {
      // Envia a requisição de atualização para a API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chamada API
      return Promise.resolve();
    },
    // Atualização otimista no cliente
    onMutate: (newUserInfo: User) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.map((prevUser: User) =>
          prevUser.id === newUserInfo.id ? newUserInfo : prevUser,
        ),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), // Refaz o fetch após a mutação (desabilitado para o demo)
  });
}

// Hook DELETE (deleta usuário na API)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      // Envia a requisição de exclusão para a API
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simula chamada API
      return Promise.resolve();
    },
    // Atualização otimista no cliente
    onMutate: (userId: string) => {
      queryClient.setQueryData(['users'], (prevUsers: any) =>
        prevUsers?.filter((user: User) => user.id !== userId),
      );
    },
    // onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }), // Refaz o fetch após a mutação (desabilitado para o demo)
  });
}

// Cria uma instância do QueryClient para gerenciar o cache
const queryClient = new QueryClient();

// Componente que envolve o Example com os provedores necessários
const ExampleWithProviders = () => (
  // Coloque isso junto com seus outros provedores do React Query próximo à raiz do seu app
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

// Valida se o valor contém apenas texto (sem números)
const validateSomenteTexto = (value: string) => {
  return /^[^\d]+$/.test(value);
};

// Valida a quantidade (números naturais positivos maiores que zero com até 3 dígitos)
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