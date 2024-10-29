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

// Definição do tipo Funcionario com os campos necessários
type Funcionario = {
  id_func: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cargo: string;
};

const CadastroFuncionario = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Hook para buscar os funcionários
  const {
    data: fetchedFuncionarios = [],
    error,
    isError: isLoadingFuncionariosError,
    isFetching: isFetchingFuncionarios,
    isLoading: isLoadingFuncionarios,
  } = useGetFuncionarios();

  // Exibe mensagem de erro se falhar ao buscar os dados
  if (isLoadingFuncionariosError) {
    console.error('Erro ao buscar funcionários:', error);
    return <div>Erro ao carregar os funcionários. Por favor, tente novamente mais tarde.</div>;
  }

  // Funções de criação, atualização e exclusão de funcionários usando React Query
  const createFuncionarioMutation = useCreateFuncionario();
  const updateFuncionarioMutation = useUpdateFuncionario();
  const deleteFuncionarioMutation = useDeleteFuncionario();

  // Função para criar um novo funcionário
  const handleCreateFuncionario: MRT_TableOptions<Funcionario>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    // Valida os campos antes de criar
    const newValidationErrors = validateFuncionario(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    try {
      await createFuncionarioMutation.mutateAsync(values);
      exitCreatingMode(); // Sai do modo de criação
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
    }
  };

  // Função para atualizar um funcionário existente
  const handleSaveFuncionario: MRT_TableOptions<Funcionario>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateFuncionario(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    try {
      await updateFuncionarioMutation.mutateAsync(values);
      table.setEditingRow(null); // Sai do modo de edição
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
    }
  };

  // Função para abrir modal de confirmação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Funcionario>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir esse funcionário?',
      children: (
        <Text>
          Tem certeza que você quer excluir o funcionário {row.original.nome}? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteFuncionarioMutation.mutateAsync(row.original.id_func);
        } catch (error) {
          console.error('Erro ao excluir funcionário:', error);
        }
      },
    });

  // Define as colunas da tabela
  const columns = useMemo<MRT_ColumnDef<Funcionario>[]>(() => [
    {
      accessorKey: 'id_func',
      header: 'ID',
      enableEditing: false, // Desativa a edição
      size: 0, // Define o tamanho da coluna como zero
      mantineTableHeadCellProps: { style: { display: 'none' } }, // Oculta no cabeçalho
      mantineTableBodyCellProps: { style: { display: 'none' } }, // Oculta no corpo
    },
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
      accessorKey: 'cpf',
      header: 'CPF',
      mantineEditTextInputProps: {
        required: true,
        error: validationErrors?.cpf,
        onFocus: () => setValidationErrors({ ...validationErrors, cpf: undefined }),
      },
    },
    {
      accessorKey: 'cargo',
      header: 'Cargo',
      editVariant: 'select', // Campo como seletor
      mantineEditSelectProps: {
        data: ['Gestor(a)', 'Funcionário(a)'],
        required: true,
        error: validationErrors?.cargo,
        onFocus: () => setValidationErrors({ ...validationErrors, cargo: undefined }),
      },
    },
  ], [validationErrors]);

  // Configuração da tabela MantineReactTable
  const table = useMantineReactTable({
    columns,
    data: fetchedFuncionarios,
    createDisplayMode: 'modal', // Modal para criação
    editDisplayMode: 'modal', // Modal para edição
    enableEditing: true, // Habilita edição
    getRowId: (row) => String(row.id_func), // Define o id único
    mantineToolbarAlertBannerProps: isLoadingFuncionariosError
      ? { color: 'red', children: 'Erro ao carregar dados' }
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateFuncionario,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveFuncionario,
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
      isLoading: isLoadingFuncionarios,
      isSaving: false,
      showAlertBanner: isLoadingFuncionariosError,
      showProgressBars: isFetchingFuncionarios,
    },
  });

  return <MantineReactTable table={table} />;
};

// Função para buscar os funcionários
function useGetFuncionarios() {
  return useQuery<Funcionario[], Error>({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      const response = await api.get('/funcionarios');
      return response.data;
    },
    refetchOnWindowFocus: false, // Evita refetch quando a janela recebe foco
  });
}

// Função para criar funcionário
function useCreateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation<Funcionario, Error, Omit<Funcionario, 'id_func'>>({
    mutationFn: async (funcionario) => {
      const response = await api.post('/funcionarios', funcionario);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
    onError: (error) => {
      console.error('Erro ao criar funcionário:', error);
    },
  });
}

// Função para atualizar funcionário
function useUpdateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Funcionario>({
    mutationFn: async (funcionario) => {
      await api.put(`/funcionarios/${funcionario.id_func}`, funcionario);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar funcionário:', error);
    },
  });
}

// Função para excluir funcionário
function useDeleteFuncionario() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (funcionarioId) => {
      await api.delete(`/funcionarios/${funcionarioId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir funcionário:', error);
    },
  });
}

// Inicializa o QueryClient para gerenciamento global de dados
const queryClient = new QueryClient();

const CadastroFuncionarioWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroFuncionario />
    </ModalsProvider>
  </QueryClientProvider>
);

export default CadastroFuncionarioWithProviders;

// Funções de validação de campos
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;
const validateMaxLength = (value: string, maxLength: number) => !!value && value.length <= maxLength;
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;
const validateNome = (nome: string) => {const regex = /^[^0-9]+$/;return regex.test(nome) && validateMinLength(nome, 3);};
const validateEmail = (email: string) => {const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/;return !!email.length && regex.test(email.toLowerCase());};
const validateCpf = (cpf: string) => {if (cpf.includes('.') || cpf.includes('-')) {return false;}return /^[0-9]{11}$/.test(cpf);};
const validateTelefone = (telefone: string) => {const cleanTelefone = telefone.replace(/\D/g, '');return !!cleanTelefone.length && /^[0-9]{10,11}$/.test(cleanTelefone);};
const validateSomenteTexto = (value: string) => {return /^[a-zA-ZÀ-ÿ\s]+$/.test(value);};

// Função que valida todos os campos do funcionário
const validateFuncionario = (values: Funcionario) => {
  const errors: Record<string, string | undefined> = {};

  if (!validateRequired(values.nome)) {
    errors.nome = 'Nome é obrigatório';
  } else if (!validateNome(values.nome)) {
    errors.nome = 'Nome inválido, necessário ter mais de 3 caracteres e não deve conter números';
  } else if (!validateMaxLength(values.nome, 40)) {
    errors.nome = 'Nome inválido, necessário ter menos de 40 caracteres';
  } else if (!validateSomenteTexto(values.nome)) {
    errors.nome = 'Nome inválido';
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
  if (!validateRequired(values.cpf)) {
    errors.cpf = 'CPF é obrigatório';
  } else if (!validateCpf(values.cpf)) {
    errors.cpf = 'CPF inválido. Digite sem traços e pontos';
  }
  if (!validateRequired(values.cargo)) {
    errors.cargo = 'Cargo é obrigatório';
  }
  return errors;
};