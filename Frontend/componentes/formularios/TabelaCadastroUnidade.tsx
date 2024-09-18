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

// Definição do tipo Unidade
type Unidade = {
  id_unidade?: string;
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
  const [autoCompleteData, setAutoCompleteData] = useState({
    cidade: '',
    rua: '',
    estado: '',
    cep: '',
  });

  const columns = useMemo<MRT_ColumnDef<Unidade>[]>(
    () => [
      {
        accessorKey: 'polo',
        header: 'Polo',
        editVariant: 'select',
        mantineEditSelectProps: {
          data: ['Barcelona','Centro','Conceição', 'São Paulo'], // Ajuste aqui para dados reais
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
          onChange: async (e) => {
            const cepValue = (e.target as HTMLInputElement).value;
            setAutoCompleteData({ ...autoCompleteData, cep: cepValue });

            if (cepValue.length === 8) {
              try {
                const response = await axios.get(`https://viacep.com.br/ws/${cepValue}/json/`);
                const data = response.data;
                setAutoCompleteData({
                  cidade: data.localidade,
                  rua: data.logradouro,
                  estado: data.uf,
                  cep: cepValue,
                });
              } catch (error) {
                console.error('Erro ao buscar o CEP:', error);
              }
            }
          },
          onFocus: () => setValidationErrors({ ...validationErrors, cep: undefined }),
        },
      },
      {
        accessorKey: 'cidade',
        header: 'Cidade da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          value: autoCompleteData.cidade,
          disabled: true,
        },
      },
      {
        accessorKey: 'rua',
        header: 'Rua da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          value: autoCompleteData.rua,
          disabled: true,
        },
      },
      {
        accessorKey: 'estado',
        header: 'Estado da Unidade',
        mantineEditTextInputProps: {
          type: 'text',
          required: true,
          value: autoCompleteData.estado,
          disabled: true,
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
    [validationErrors, autoCompleteData],
  );

  const { mutateAsync: createUnidade } = useCreateUnidade();
  const { data: fetchedUnidades = [], isError: isLoadingUnidadesError, isFetching: isFetchingUnidades, isLoading: isLoadingUnidades } = useGetUnidades();
  const { mutateAsync: updateUnidade } = useUpdateUnidade();
  const { mutateAsync: deleteUnidade } = useDeleteUnidade();

  const handleCreateUnidade: MRT_TableOptions<Unidade>['onCreatingRowSave'] = async ({ values, exitCreatingMode }) => {
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUnidade({ ...values, ...autoCompleteData }); // Inclui os dados preenchidos automaticamente
    exitCreatingMode();
  };

  const handleSaveUnidade: MRT_TableOptions<Unidade>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUnidade({ ...values, ...autoCompleteData });
    table.setEditingRow(null);
  };

  const openDeleteConfirmModal = (row: MRT_Row<Unidade>) => {
    const id_unidade = row.original.id_unidade;

    if (id_unidade) {
      modals.openConfirmModal({
        title: 'Tem certeza que você quer excluir esta unidade?',
        children: (
          <Text>
            Tem certeza que você quer excluir a unidade {row.original.nome_unidade}? Essa ação não
            pode ser desfeita.
          </Text>
        ),
        labels: { confirm: 'Excluir', cancel: 'Cancelar' },
        confirmProps: { color: 'red' },
        onConfirm: () => deleteUnidade(id_unidade),
      });
    } else {
      console.error('ID da unidade é inválido ou indefinido.');
    }
  };

  const table = useMantineReactTable({
    columns,
    data: fetchedUnidades,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => row.id_unidade,
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

// Função para obter Unidades
function useGetUnidades() {
  return useQuery<Unidade[]>({
    queryKey: ['unidades'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:3000/unidades');
      return response.data;
    },
    refetchOnWindowFocus: false,
  });
}

// Função para atualizar Unidade
function useUpdateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Unidade) => {
      try {
        console.log('Enviando dados para atualização:', unidade);
        const response = await axios.put(
          `http://localhost:3000/unidades/${unidade.id_unidade}`,
          unidade,
        );
        console.log('Resposta do servidor após atualização:', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro ao atualizar a unidade no servidor:', error);
        throw new Error('Falha ao atualizar a unidade.');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
      console.log(`Unidade ${variables.nome_unidade} atualizada com sucesso!`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar a unidade:', error);
    },
  });
}

// Função para deletar Unidade
function useDeleteUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id_unidade: string) => {
      try {
        console.log('Iniciando exclusão da unidade:', id_unidade);
        const response = await axios.delete(`http://localhost:3000/unidades/${id_unidade}`);
        console.log('Resposta do servidor após exclusão:', response.data);
        return response.data;
      } catch (error) {
        console.error('Erro ao excluir a unidade no servidor:', error);
        throw new Error('Falha ao excluir a unidade.');
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
      console.log(`Unidade com ID ${variables} excluída com sucesso!`);
    },
    onError: (error) => {
      console.error('Erro ao excluir a unidade:', error);
    },
  });
}

// Função de criação da unidade
function useCreateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Unidade) => {
      try {
        const response = await axios.post('http://localhost:3000/unidades', unidade);
        return response.data;
      } catch (error: any) {
        console.error('Erro ao criar unidade:', error.message);
        throw new Error('Falha ao criar a unidade.');
      }
    },
    onMutate: (newUnidadeInfo: Unidade) => {
      queryClient.setQueryData(['unidades'], (prevUnidades: Unidade[] | undefined) => [
        ...(prevUnidades || []),
        { ...newUnidadeInfo, id_unidade: (Math.random() + 1).toString(36).substring(7) },
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
      console.log('Nova unidade criada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao criar unidade:', error.message);
    },
  });
}

// Função de validação
const validateUnidade = (values: Unidade) => {
  const errors: Record<string, string | undefined> = {
    polo: values.polo ? undefined : 'Polo é obrigatório',
    nome_unidade: values.nome_unidade ? undefined : 'Nome da unidade é obrigatório',
    cep: values.cep ? undefined : 'CEP é obrigatório',
    cidade: values.cidade ? undefined : 'Cidade é obrigatória',
    rua: values.rua ? undefined : 'Rua é obrigatória',
    estado: values.estado ? undefined : 'Estado é obrigatório',
    numero: values.numero ? undefined : 'Número é obrigatório',
  };
  return errors;
};

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);

export default ExampleWithProviders;
