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

type Gestor = {
  nome: string;
  sobrenome: string;
  cpf_gestor: number;
  email: string;
  telefone: string;
  senha: string;
};

const CadastroGestor = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<Gestor>[]>(
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

  const queryClient = useQueryClient();

  const {
    data: fetchedGestor = [],
    isError: isLoadingGestorError,
    isFetching: isFetchingGestor,
    isLoading: isLoadingGestor,
  } = useGetGestor();

  const createGestorMutation = useCreateGestor();
  const updateGestorMutation = useUpdateGestor();
  const deleteGestorMutation = useDeleteGestor();

  const handleCreateGestor: MRT_TableOptions<Gestor>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateGestor(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createGestorMutation.mutateAsync(values);
    exitCreatingMode();
  };

  const handleSaveGestor: MRT_TableOptions<Gestor>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateGestor(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateGestorMutation.mutateAsync(values);
    table.setEditingRow(null);
  };

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
      onConfirm: () => deleteGestorMutation.mutateAsync(row.original.cpf_gestor),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedGestor,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.cpf_gestor),
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo Gestor</Button>
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

function useCreateGestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (Gestor: Omit<Gestor, 'cpf_gestor'>) => {
      const response = await axios.post('http://localhost:3000/gestor', Gestor);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] });
    },
  });
}

function useGetGestor() {
  return useQuery<Gestor[]>({
    queryKey: ['Gestor'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/gestor');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateGestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (Gestor: Gestor) => {
      await axios.put(`http://localhost:3000/gestor/${Gestor.cpf_gestor}`, Gestor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] });
    },
  });
}

function useDeleteGestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gestor_cpf: number) => {
      await axios.delete(`http://localhost:3000/Gestor/${gestor_cpf}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] });
    },
  });
}

const queryClient = new QueryClient();

const CadastroGestorWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroGestor />
    </ModalsProvider>
  </QueryClientProvider>
);

export default CadastroGestorWithProviders;

const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;
const validateNome = (nome: string) => {const regex = /^[^0-9]+$/; return regex.test(nome) && validateMinLength(nome, 4);};
const validateSobrenome = (sobrenome: string) => {const regex = /^[^0-9]+$/; return regex.test(sobrenome) && validateMinLength(sobrenome, 4);};
const validateCpf = (cpf_gestor: number) => {const cpfString = cpf_gestor.toString(); if (cpfString.includes('.') || cpfString.includes('-')) {return false;}return /^[0-9]{11}$/.test (cpfString);};
const validateEmail = (email: string) => {const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; return !!email.length && regex.test(email.toLowerCase());};
const validateTelefone = (telefone: string) => {const cleanTelefone = telefone.replace(/\D/g, ''); return !!cleanTelefone.length && /^[0-9]{10,11}$/.test(cleanTelefone);};

const validateGestor = (values: Gestor) => {
  const errors: Record<string, string | undefined> = {};
  
  // Validação do nome
  if (!validateRequired(values.nome)) {
    errors.nome = 'Nome é obrigatório';
  } else if (!validateNome(values.nome)) {
    errors.nome = 'Nome deve ter no mínimo 4 caracteres e não pode conter números';
  }
  // Validação do sobrenome
  if (!validateRequired(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome é obrigatório';
  } else if (!validateSobrenome(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome deve ter no mínimo 4 caracteres e não pode conter números';
  }
   // Validação do CPF
   if (!validateRequired(values.cpf_gestor)) {
    errors.cpf_gestor = 'CPF é obrigatório';
  } else if (!validateCpf(values.cpf_gestor)) {
    errors.cpf_gestor = 'CPF inválido. Digite sem traços e pontos';
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
  // Validação da senha
  if (!validateRequired(values.senha)) {
    errors.senha = 'Senha é obrigatória';
  } else if (!validateMinLength (values.senha, 8)) {
    errors.senha = 'A senha deve conter no mínimo 8 caracteres'
  }
  return errors;
};