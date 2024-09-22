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

type Funcionario = {
  id_func: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cargo: string;
};

const CadastroFuncionario = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<Funcionario>[]>(
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
        editVariant: 'select',
        mantineEditSelectProps: {
          data: ['Gestor(a)','Funcionário(a)'], // Ajuste aqui para dados reais
          required: true,
          error: validationErrors?.cargo,
          onFocus: () => setValidationErrors({ ...validationErrors, cargo: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  const queryClient = useQueryClient();

  const {
    data: fetchedFuncionarios = [],
    isError: isLoadingFuncionariosError,
    isFetching: isFetchingFuncionarios,
    isLoading: isLoadingFuncionarios,
  } = useGetFuncionarios();

  const createFuncionarioMutation = useCreateFuncionario();
  const updateFuncionarioMutation = useUpdateFuncionario();
  const deleteFuncionarioMutation = useDeleteFuncionario();

  const handleCreateFuncionario: MRT_TableOptions<Funcionario>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateFuncionario(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createFuncionarioMutation.mutateAsync(values);
    exitCreatingMode();
  };

  const handleSaveFuncionario: MRT_TableOptions<Funcionario>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateFuncionario(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateFuncionarioMutation.mutateAsync(values);
    table.setEditingRow(null);
  };

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
      onConfirm: () => deleteFuncionarioMutation.mutateAsync(row.original.id_func),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedFuncionarios,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.id_func),
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

function useCreateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (funcionario: Omit<Funcionario, 'id_func'>) => {
      const response = await axios.post('http://localhost:3000/funcionarios', funcionario);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

function useGetFuncionarios() {
  return useQuery<Funcionario[]>({
    queryKey: ['funcionarios'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/funcionarios');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (funcionario: Funcionario) => {
      await axios.put(`http://localhost:3000/funcionarios/${funcionario.id_func}`, funcionario);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

function useDeleteFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (funcionarioId: number) => {
      await axios.delete(`http://localhost:3000/funcionarios/${funcionarioId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

const queryClient = new QueryClient();

const CadastroFuncionarioWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroFuncionario />
    </ModalsProvider>
  </QueryClientProvider>
);

export default CadastroFuncionarioWithProviders;

const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;
const validateNome = (nome: string) => {const regex = /^[^0-9]+$/; return regex.test(nome) && validateMinLength(nome, 4);};
const validateEmail = (email: string) => {const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; return !!email.length && regex.test(email.toLowerCase());};
const validateCpf = (cpf: string) => {if (cpf.includes('.') || cpf.includes('-')) {return false;} return /^[0-9]{11}$/.test(cpf);};
const validateTelefone = (telefone: string) => {const cleanTelefone = telefone.replace(/\D/g, ''); return !!cleanTelefone.length && /^[0-9]{10,11}$/.test(cleanTelefone);};

const validateFuncionario = (values: Funcionario) => {
  const errors: Record<string, string | undefined> = {};
  
  // Validação do nome
  if (!validateRequired(values.nome)) {
    errors.nome = 'Nome é obrigatório';
  } else if (!validateNome(values.nome)) {
    errors.nome = 'Nome deve ter no mínimo 4 caracteres e não conter números';
  }
  // Validação do email
  if (!validateRequired(values.email)) {
    errors.email = 'E-mail é obrigatório';
  } else if (!validateEmail(values.email)) {
    errors.email = 'E-mail em formato inválido';
  }
  // Validação do telefone
  if (!validateRequired(values.telefone)) {
    errors.telefone = 'Telefone é obrigatório';
  } else if (!validateTelefone(values.telefone)) {
    errors.telefone = 'Telefone inválido';
  }
  // Validação do CPF
  if (!validateRequired(values.cpf)) {
    errors.cpf = 'CPF é obrigatório';
  } else if (!validateCpf(values.cpf)) {
    errors.cpf = 'CPF inválido. Digite sem traços e pontos';
  }
  // Validação do cargo
  if (!validateRequired(values.cargo)) {
    errors.cargo = 'Cargo é obrigatório';
  }
  return errors;
};