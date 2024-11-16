import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { MRT_Localization_PT_BR } from 'mantine-react-table/locales/pt-BR/index.cjs';
import { useMemo, useState, useEffect } from 'react';
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

// Define o tipo Gestor com os campos correspondentes
type Gestor = {
  nome: string;
  sobrenome: string;
  matricula_gestor: number;
  email: string;
  telefone: string;
  senha: string;
};

// Função para gerar um número aleatório de 1 a 1000
const generateRandomMatricula = () => Math.floor(Math.random() * 1000) + 1;

// Componente principal de cadastro de gestores
const CadastroGestor = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const [randomMatricula, setRandomMatricula] = useState<number | null>(null);

  useEffect(() => {
    // Gera e define a matrícula ao inicializar o componente
    setRandomMatricula(generateRandomMatricula());
  }, []);

  // Definição das colunas da tabela de gestores
  const columns = useMemo<MRT_ColumnDef<Gestor>[]>(() => [
    {
      accessorKey: 'id_gestor',
      header: 'ID',
      enableEditing: false,
      size: 0,
      mantineTableHeadCellProps: { style: { display: 'none' } },
      mantineTableBodyCellProps: { style: { display: 'none' } },
    },
    {
      accessorKey: 'matricula_gestor',
      header: 'Matrícula do Gestor',
      enableEditing: false,
      mantineEditTextInputProps: {
        value: randomMatricula || '',
        readOnly: true,
        required: true,
        error: validationErrors?.matricula_gestor,
      },
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
      accessorKey: 'sobrenome',
      header: 'Sobrenome',
      mantineEditTextInputProps: {
        required: true,
        error: validationErrors?.sobrenome,
        onFocus: () => setValidationErrors({ ...validationErrors, sobrenome: undefined }),
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
  ], [randomMatricula, validationErrors]);

  const queryClient = useQueryClient();
  const { data: fetchedGestor = [], isError: isLoadingGestorError, isFetching: isFetchingGestor, isLoading: isLoadingGestor } = useGetGestor();

  const createGestorMutation = useCreateGestor();
  const updateGestorMutation = useUpdateGestor();
  const deleteGestorMutation = useDeleteGestor();

  // Função para criar um novo gestor
  const handleCreateGestor: MRT_TableOptions<Gestor>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    values.matricula_gestor = randomMatricula || generateRandomMatricula(); // Define a matrícula para o novo gestor
    const newValidationErrors = validateGestor(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    console.log('Criando novo gestor:', { ...values, senha: '[PROTECTED]' }); // Log do novo gestor criado
    await createGestorMutation.mutateAsync(values);
    setRandomMatricula(generateRandomMatricula()); // Gera nova matrícula para o próximo cadastro
    exitCreatingMode();
  };

  const handleSaveGestor: MRT_TableOptions<Gestor>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateGestor(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    console.log('Atualizando gestor:', { ...values, senha: '[PROTECTED]' }); // Log da atualização do gestor
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
      onConfirm: () => {
        console.log('Deletando gestor:', row.original.matricula_gestor); // Log da exclusão do gestor
        deleteGestorMutation.mutateAsync(row.original.matricula_gestor);
      },
    });

  const table = useMantineReactTable({
    localization: MRT_Localization_PT_BR,
    columns,
    data: fetchedGestor,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.matricula_gestor),
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

// Define a URL base do backend usando a variável de ambiente
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Funções que lidam com as mutações e queries de dados usando Axios
function useCreateGestor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Gestor: Omit<Gestor, 'matricula_gestor'>) => {
      const response = await axios.post(`${backendUrl}/gestor`, Gestor); // Usa a URL do backend
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
      const response = await axios.get(`${backendUrl}/gestor`); // Usa a URL do backend
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useUpdateGestor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (Gestor: Gestor) => {
      await axios.put(`${backendUrl}/gestor/${Gestor.matricula_gestor}`, Gestor); // Usa a URL do backend
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] });
    },
  });
}

function useDeleteGestor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (matricula_gestor: number) => {
      await axios.delete(`${backendUrl}/gestor/${matricula_gestor}`); // Usa a URL do backend
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Gestor'] });
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
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength; // Valida se o valor possui o comprimento mínimo especificado
const validateMaxLength = (value: string, maxLength: number) => !!value && value.length <= maxLength; // Valida se o valor possui o comprimento máximo especificado
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length; // Verifica se o valor é obrigatório (não nulo, indefinido ou vazio)
const validateNome = (nome: string) => { const regex = /^[^0-9]+$/; return regex.test(nome) && validateMinLength(nome, 3);}; // Permite qualquer texto sem números e Valida nomes: deve ter pelo menos 3 caracteres e não conter números
// Valida sobrenomes: deve ter pelo menos 4 caracteres e não conter números
const validateSobrenome = (sobrenome: string) => { const regex = /^[^0-9]+$/; return regex.test(sobrenome) && validateMinLength(sobrenome, 4);}; // Permite qualquer texto sem números
const validateEmail = (email: string) => {const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{3,}$/; return !!email.length && regex.test(email.toLowerCase());}; // Valida o formato de email com regex, permitindo letras, números e caracteres válidos
const validateTelefone = (telefone: string) => {const cleanTelefone = telefone.replace(/\D/g, '');return !!cleanTelefone.length && /^[0-9]{10,11}$/.test(cleanTelefone);}; // Remove caracteres não numéricos // Valida telefone: remove caracteres não numéricos e verifica se tem 10 ou 11 dígitos

// Função para validar todos os campos do gestor
const validateGestor = (values: Gestor) => {
  const errors: Record<string, string | undefined> = {};

  // Validação do nome
  if (!validateRequired(values.nome)) {
    errors.nome = 'Nome é obrigatório';
  } else if (!validateNome(values.nome)) {
    errors.nome = 'Nome deve ter no mínimo 3 caracteres, sem números';
  } else if (!validateMaxLength(values.nome, 20)) {
    errors.nome = 'Nome inválido, deve ter menos de 20 caracteres';
  }
  // Validação do sobrenome
  if (!validateRequired(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome é obrigatório';
  } else if (!validateSobrenome(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome deve ter no mínimo 4 caracteres, sem números';
  } else if (!validateMaxLength(values.sobrenome, 40)) {
    errors.sobrenome = 'Sobrenome inválido, deve ter menos de 40 caracteres';
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
    errors.telefone = 'Telefone inválido, use formato válido com DDD';
  }
  // Validação da senha
  if (!validateRequired(values.senha)) {
    errors.senha = 'Senha é obrigatória';
  } else if (!validateMinLength(values.senha, 8)) {
    errors.senha = 'A senha deve conter no mínimo 8 caracteres';
  }

  return errors;
};