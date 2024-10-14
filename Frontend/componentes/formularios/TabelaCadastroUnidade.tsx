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

// Definição do tipo Unidade
type Unidade = {
  id_unidade: number;
  polo: string;
  nome_unidade: string;
  cep: string;
  cidade: string;
  rua: string;
  estado: string;
  numero: string;
  complemento?: string;
};

const Example = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  const columns = useMemo<MRT_ColumnDef<Unidade>[]>(
    () => [
      {
        accessorKey: 'id_unidade',
        header: 'ID',
        enableEditing: false, // Desativa a edição
        size: 0, // Define o tamanho da coluna como zero
        mantineTableHeadCellProps: { style: { display: 'none' } }, // Oculta no cabeçalho
        mantineTableBodyCellProps: { style: { display: 'none' } }, // Oculta no corpo
      },
      {
        accessorKey: 'polo',
        header: 'Polo',
        editVariant: 'select',
        mantineEditSelectProps: {
          data: ['Barcelona', 'Centro', 'Conceição', 'São Paulo'], // Ajuste aqui para dados reais
          required: true,
          error: validationErrors?.polo,
          onFocus: () => setValidationErrors({ ...validationErrors, polo: undefined }),
        },
      },
      {
        accessorKey: 'nome_unidade',
        header: 'Nome da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.nome_unidade,
          onFocus: () => setValidationErrors({ ...validationErrors, nome_unidade: undefined }),
        },
      },
      {
        accessorKey: 'cep',
        header: 'CEP',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.cep,
          onFocus: () => setValidationErrors({ ...validationErrors, cep: undefined }),
        },
      },
      {
        accessorKey: 'cidade',
        header: 'Cidade da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.cidade,
          onFocus: () => setValidationErrors({ ...validationErrors, cidade: undefined }),
        },
      },
      {
        accessorKey: 'rua',
        header: 'Rua da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.rua,
          onFocus: () => setValidationErrors({ ...validationErrors, rua: undefined }),
        },
      },
      {
        accessorKey: 'estado',
        header: 'Estado da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          error: validationErrors?.estado,
          onFocus: () => setValidationErrors({ ...validationErrors, estado: undefined }),
        },
      },
      {
        accessorKey: 'numero',
        header: 'Número da Unidade',
        mantineEditTextInputProps: {
          type: 'number',
          required: true,
          error: validationErrors?.numero,
          onFocus: () => setValidationErrors({ ...validationErrors, numero: undefined }),
        },
      },
      {
        accessorKey: 'complemento',
        header: 'Complemento da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
        },
      },
    ],
    [validationErrors],
  );

  const queryClient = useQueryClient();

  const {
    data: fetchedUnidades = [],
    isError: isLoadingUnidadesError,
    isFetching: isFetchingUnidades,
    isLoading: isLoadingUnidades,
  } = useGetUnidades();

  const createUnidadeMutation = useCreateUnidade();
  const updateUnidadeMutation = useUpdateUnidade();
  const deleteUnidadeMutation = useDeleteUnidade();

  const handleCreateUnidade: MRT_TableOptions<Unidade>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    console.log('Iniciando criação de unidade com valores:', values);
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    try {
      await createUnidadeMutation.mutateAsync(values);
      console.log('Unidade criada com sucesso');
      exitCreatingMode();
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
    }
  };

  const handleSaveUnidade: MRT_TableOptions<Unidade>['onEditingRowSave'] = async ({ values, table }) => {
    console.log('Iniciando atualização de unidade com valores:', values);
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});

    try {
      await updateUnidadeMutation.mutateAsync(values);
      console.log('Unidade atualizada com sucesso');
      table.setEditingRow(null);
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
    }
  };

  const openDeleteConfirmModal = (row: MRT_Row<Unidade>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir essa unidade?',
      children: (
        <Text>
          Tem certeza que você quer excluir a unidade {row.original.nome_unidade}? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUnidadeMutation.mutateAsync(row.original.id_unidade),
    });

  const table = useMantineReactTable({
    columns,
    data: fetchedUnidades,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.id_unidade),
    mantineToolbarAlertBannerProps: isLoadingUnidadesError
      ? { color: 'red', children: 'Erro ao carregar dados' }
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateUnidade,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUnidade,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar nova unidade</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar Unidade</Title>
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar nova unidade</Button>
    ),
    state: {
      isLoading: isLoadingUnidades,
      isSaving: false,
      showAlertBanner: isLoadingUnidadesError,
      showProgressBars: isFetchingUnidades,
    },
  });

  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD
function useGetUnidades() {
  return useQuery<Unidade[]>({
    queryKey: ['unidades'],
    queryFn: async () => {
      const response = await api.get('/unidades');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

function useCreateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Omit<Unidade, 'id_unidade'>) => {
      console.log('Enviando requisição para criar unidade:', unidade);
      const response = await api.post('/unidades', unidade);
      console.log('Resposta do backend:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
    onError: (error) => {
      console.error('Erro na mutação de criação de unidade:', error);
    },
  });
}

function useUpdateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Unidade) => {
      console.log('Enviando requisição para atualizar unidade:', unidade);
      await api.put(`/unidades/${unidade.id_unidade}`, unidade);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
    onError: (error) => {
      console.error('Erro na mutação de atualização de unidade:', error);
    },
  });
}

function useDeleteUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidadeId: number) => {
      console.log('Enviando requisição para deletar unidade com ID:', unidadeId);
      await api.delete(`/unidades/${unidadeId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
    onError: (error) => {
      console.error('Erro na mutação de exclusão de unidade:', error);
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

// Funções de validação
const validateNomeUnidade = (value: string) => /^[^\d]+$/.test(value);
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;
const validateCep = (cep: string) => /^\d{8}$/.test(cep);
const validateNumero = (numero: string) => /^-?\d+(\.\d+)?$/.test(numero);

const validateUnidade = (values: Unidade) => {
  const errors: Record<string, string | undefined> = {};
  // Polo é obrigatório
  if (!validateRequired(values.polo)) {
    errors.polo = 'Polo é obrigatório';
  }
  // Nome da unidade
  if (!validateRequired(values.nome_unidade)) {
    errors.nome_unidade = 'Nome da unidade é obrigatório';
  } else if (!validateNomeUnidade(values.nome_unidade)) {
    errors.nome_unidade = 'Nome inválido';
  } else if (!validateMinLength(values.nome_unidade, 2)) {
    errors.nome_unidade = 'Nome inválido';
  }
  // CEP
  if (!validateRequired(values.cep)) {
    errors.cep = 'CEP é obrigatório';
  } else if (!validateCep(values.cep)) {
    errors.cep = 'CEP inválido. Digite sem o "-" ';
  }
  // Cidade
  if (!validateRequired(values.cidade)) {
    errors.cidade = 'Cidade é obrigatória';
  }
  // Rua
  if (!validateRequired(values.rua)) {
    errors.rua = 'Rua é obrigatória';
  }
  // Estado
  if (!validateRequired(values.estado)) {
    errors.estado = 'Estado é obrigatório';
  }
  // Número
  if (!validateRequired(values.numero)) {
    errors.numero = 'Número é obrigatório';
  } else if (!validateNumero(values.numero)) {
    errors.numero = 'Número inválido';
  }
  return errors;
};
