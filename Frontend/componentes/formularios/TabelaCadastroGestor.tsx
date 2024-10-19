import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { useMemo, useState } from 'react'; // Importa hooks para gerenciamento de estado e memoização
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table'; // Importa componentes da tabela MantineReactTable
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'; // Importa componentes de layout e interface do Mantine
import { ModalsProvider, modals } from '@mantine/modals'; // Importa provedores e funções de modais do Mantine
import { IconEdit, IconTrash } from '@tabler/icons-react'; // Importa ícones de edição e exclusão
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'; // Importa ferramentas de query e mutações do React Query
import axios from 'axios'; // Axios para requisições HTTP

// Define o tipo Gestor com os campos correspondentes
type Gestor = {
  nome: string;
  sobrenome: string;
  cpf_gestor: number;
  email: string;
  telefone: string;
  senha: string;
};

// Componente principal de cadastro de gestores
const CadastroGestor = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Definição das colunas da tabela de gestores
  const columns = useMemo<MRT_ColumnDef<Gestor>[]>(
    () => [
      {
        accessorKey: 'id_gestor', // Coluna para ID do gestor, desativada para edição
        header: 'ID',
        enableEditing: false,
        size: 0,
        mantineTableHeadCellProps: { style: { display: 'none' } }, // Oculta a coluna
        mantineTableBodyCellProps: { style: { display: 'none' } },
      },
      // Demais colunas configuradas com validação de entrada de dados
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
        accessorKey: 'sobrenome',
        header: 'Sobrenome',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.sobrenome,
          onFocus: () => setValidationErrors({ ...validationErrors, sobrenome: undefined }),
        },
      },
      {
        accessorKey: 'cpf_gestor',
        header: 'CPF',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.cpf_gestor,
          onFocus: () => setValidationErrors({ ...validationErrors, cpf_gestor: undefined }),
        },
      },
      {
        accessorKey: 'email',
        header: 'E-mail',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.email,
          onFocus: () => setValidationErrors({ ...validationErrors, email: undefined }),
        },
      },
      {
        accessorKey: 'telefone',
        header: 'Telefone',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.telefone,
          onFocus: () => setValidationErrors({ ...validationErrors, telefone: undefined }),
        },
      },
      {
        accessorKey: 'senha',
        header: 'Senha',
        mantineEditTextInputProps: {
          type: 'password',
          required: true,
          error: validationErrors?.senha,
          onFocus: () => setValidationErrors({ ...validationErrors, senha: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  // Obtém as funções de query e mutação para trabalhar com os dados
  const queryClient = useQueryClient();
  const {
    data: fetchedGestor = [], // Busca os gestores existentes
    isError: isLoadingGestorError,
    isFetching: isFetchingGestor,
    isLoading: isLoadingGestor,
  } = useGetGestor();

  const createGestorMutation = useCreateGestor();
  const updateGestorMutation = useUpdateGestor();
  const deleteGestorMutation = useDeleteGestor();

  // Função para criar um novo gestor
  const handleCreateGestor: MRT_TableOptions<Gestor>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateGestor(values); // Valida os dados
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createGestorMutation.mutateAsync(values); // Realiza a mutação para criar
    exitCreatingMode(); // Sai do modo de criação
  };

  // Função para salvar as alterações feitas em um gestor existente
  const handleSaveGestor: MRT_TableOptions<Gestor>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateGestor(values); // Valida os dados antes de salvar
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateGestorMutation.mutateAsync(values); // Atualiza os dados do gestor
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Função para confirmar a exclusão de um gestor
  const openDeleteConfirmModal = (row: MRT_Row<Gestor>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir esse Gestor?',
      children: (
        <Text>
          Tem certeza que você quer excluir o Gestor {row.original.nome}? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteGestorMutation.mutateAsync(row.original.cpf_gestor), // Deleta o gestor
    });

  // Configura a tabela MantineReactTable
  const table = useMantineReactTable({
    columns,
    data: fetchedGestor,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.cpf_gestor), // Define a chave única de cada linha
    mantineToolbarAlertBannerProps: isLoadingGestorError
      ? { color: 'red', children: 'Erro ao carregar dados.' }
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateGestor,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveGestor,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar novo Gestor</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar Gestor</Title>
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo Gestor</Button> // Botão para criar um novo gestor
    ),
    state: {
      isLoading: isLoadingGestor,
      isSaving: false,
      showAlertBanner: isLoadingGestorError,
      showProgressBars: isFetchingGestor,
    },
  });

  return <MantineReactTable table={table} />;
};

// Funções que lidam com as mutações e queries de dados usando Axios

// Função para criar gestor
function useCreateGestor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Gestor: Omit<Gestor, 'cpf_gestor'>) => {
      const response = await axios.post('http://localhost:3000/gestor', Gestor); // POST para criar gestor
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] }); // Refaz o fetch dos dados após criação
    },
  });
}

// Função para buscar gestores
function useGetGestor() {
  return useQuery<Gestor[]>({
    queryKey: ['Gestor'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/gestor'); // GET para buscar gestores
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

// Função para atualizar gestor
function useUpdateGestor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Gestor: Gestor) => {
      await axios.put(`http://localhost:3000/gestor/${Gestor.cpf_gestor}`, Gestor); // PUT para atualizar gestor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] }); // Refaz o fetch dos dados após atualização
    },
  });
}

// Função para deletar gestor
function useDeleteGestor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (gestor_cpf: number) => {
      await axios.delete(`http://localhost:3000/Gestor/${gestor_cpf}`); // DELETE para excluir gestor
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] }); // Refaz o fetch dos dados após exclusão
    },
  });
}

// Cria a instância do QueryClient e provê os componentes com os provedores de dados e modais
const queryClient = new QueryClient();

const CadastroGestorWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroGestor />
    </ModalsProvider>
  </QueryClientProvider>
);

export default CadastroGestorWithProviders;

// Funções de validação de campos
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;
const validateNome = (nome: string) => {const regex = /^[^0-9]+$/;return regex.test(nome) && validateMinLength(nome, 4);};
const validateSobrenome = (sobrenome: string) => {const regex = /^[^0-9]+$/;return regex.test(sobrenome) && validateMinLength(sobrenome, 4);};
const validateCpf = (cpf_gestor: number) => {const cpfString = cpf_gestor.toString();if (cpfString.includes('.') || cpfString.includes('-')) {return false;}return /^[0-9]{11}$/.test(cpfString);};
const validateEmail = (email: string) => {const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;return !!email.length && regex.test(email.toLowerCase());};
const validateTelefone = (telefone: string) => {const cleanTelefone = telefone.replace(/\D/g, '');return !!cleanTelefone.length && /^[0-9]{10,11}$/.test(cleanTelefone);};

// Função para validar todos os campos do gestor
const validateGestor = (values: Gestor) => {
  const errors: Record<string, string | undefined> = {};

  // Validações específicas para cada campo
  if (!validateRequired(values.nome)) {
    errors.nome = 'Nome é obrigatório';
  } else if (!validateNome(values.nome)) {
    errors.nome = 'Nome deve ter no mínimo 4 caracteres e não pode conter números';
  }
  if (!validateRequired(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome é obrigatório';
  } else if (!validateSobrenome(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome deve ter no mínimo 4 caracteres e não pode conter números';
  }
  if (!validateRequired(values.cpf_gestor)) {
    errors.cpf_gestor = 'CPF é obrigatório';
  } else if (!validateCpf(values.cpf_gestor)) {
    errors.cpf_gestor = 'CPF inválido. Digite sem traços e pontos';
  }
  if (!validateRequired(values.email)) {
    errors.email = 'E-mail é obrigatório';
  } else if (!validateEmail(values.email)) {
    errors.email = 'E-mail em formato inválido';
  }
  if (!validateRequired(values.telefone)) {
    errors.telefone = 'Telefone é obrigatório';
  } else if (!validateTelefone(values.telefone)) {
    errors.telefone = 'Telefone inválido';
  }
  if (!validateRequired(values.senha)) {
    errors.senha = 'Senha é obrigatória';
  } else if (!validateMinLength(values.senha, 8)) {
    errors.senha = 'A senha deve conter no mínimo 8 caracteres';
  }
  return errors;
};