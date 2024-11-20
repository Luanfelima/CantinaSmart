import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { MRT_Localization_PT_BR } from 'mantine-react-table/locales/pt-BR/index.cjs';
import { Input } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import {
  ActionIcon,
  Flex,
  Stack,
  Notification,
  Title,
  Tooltip,
} from '@mantine/core';
import { ModalsProvider, } from '@mantine/modals';
import { IconCurrencyReal } from '@tabler/icons-react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

// Tipo Estoque
type Estoque = {
  id_produto: number;
  nome_p: string;
  quantidade: number;
  preco: number;
};

const CadastroEstoque = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const queryClient = useQueryClient();

  const {
    data: fetchedEstoque = [],
    isError: isLoadingEstoqueError,
    isFetching: isFetchingEstoque,
    isLoading: isLoadingEstoque,
  } = useGetEstoque();

  // Verifica erro ao carregar Estoque
  if (isLoadingEstoqueError) {
    console.error('Erro ao carregar produtos:', isLoadingEstoqueError);
    return <div>Erro ao carregar os produtos. Tente novamente mais tarde.</div>;
  }

  // Definição das colunas da tabela de Estoque
  const columns = useMemo<MRT_ColumnDef<Estoque>[]>(() => [
    {
      accessorKey: 'id_produto',
      header: 'ID Produto',
      enableEditing: false,
      size: 0,
      mantineTableHeadCellProps: { style: { display: 'none' } },
      mantineTableBodyCellProps: { style: { display: 'none' } },
    },
    {
      accessorKey: 'nome_p',
      header: 'Nome do produto',
      enableEditing: false,
      mantineEditTextInputProps: {
        error: validationErrors?.nome_p,
        onFocus: () => setValidationErrors({ ...validationErrors, nome_p: undefined }),
      },
    },
    {
        accessorKey: 'quantidade',
        header: 'Quantidade',
        mantineEditTextInputProps: {
          type: 'number',
          required: true,
          error: validationErrors?.quantidade,
          onFocus: () => setValidationErrors({ ...validationErrors, quantidade: undefined }),
        },
      },
    {
      accessorKey: 'preco',
      header: 'Preço',
      enableEditing: false,
      mantineEditTextInputProps: {
        type: 'number',
        error: validationErrors?.preco,
        placeholder: 'R$',
        onFocus: () => setValidationErrors({ ...validationErrors, preco: undefined }),
      },
      // Customiza o campo para exibir "R$" como prefixo
      Cell: ({ row }) => (
        <Input.Wrapper label="">
          <Input
            value={`R$ ${String(row.getValue("preco"))}`} // Exibe "R$" como prefixo
            readOnly // Mantém o campo sem edição, mas com estilo normal
            styles={{input: { color: 'black', cursor: 'default', border: 'white'}, // Mantém o texto visível e desabilita a edição
            }}
          />
        </Input.Wrapper>
      )
    },
  ], [validationErrors]);

  // Mutations para criar, atualizar e excluir Estoque
  const updateEstoqueMutation = useUpdateEstoque();

  // Função para salvar edição de Estoque
  const handleSaveEstoque: MRT_TableOptions<Estoque>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateEstoque(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateEstoqueMutation.mutateAsync(values);
    table.setEditingRow(null);
  };

  const table = useMantineReactTable({
    localization: MRT_Localization_PT_BR,
    columns,
    data: fetchedEstoque,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.id_produto),
    mantineToolbarAlertBannerProps: isLoadingEstoqueError
      ? { color: 'red', children: 'Erro ao carregar dados' }
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveEstoque,
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Registrar venda</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderRowActions: ({ row, table }) => (
      <Flex gap="md">
        <Tooltip label="Registrar venda">
          <ActionIcon color="green" onClick={() => table.setEditingRow(row)}> 
            <IconCurrencyReal />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    state: {
      isLoading: isLoadingEstoque,
      isSaving: false,
      showAlertBanner: isLoadingEstoqueError,
      showProgressBars: isFetchingEstoque,
    },
  });

  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD (Create, Read, Update, Delete)

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Função para obter produtos
function useGetEstoque() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useQuery<Estoque[]>({
    queryKey: ['produtos'],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token não encontrado');
      }
      const response = await axios.get(`${backendUrl}/produtos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
  });
}

// Função para criar Estoque
function useCreateEstoque() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useMutation({
    mutationFn: async (produto: Omit<Estoque, 'id_produto'>) => {
      if (!token) {
        throw new Error('Token não encontrado');
      }
      const response = await axios.post(`${backendUrl}/produtos`, produto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

// Função para atualizar Estoque
function useUpdateEstoque() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useMutation({
    mutationFn: async (produto: Estoque) => {
      if (!token) {
        throw new Error('Token não encontrado');
      }
      await axios.put(`${backendUrl}/produtos/${produto.id_produto}`, produto, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

// Função para deletar produto
function useDeleteProduto() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useMutation({
    mutationFn: async (produtoId: number) => {
      if (!token) {
        throw new Error('Token não encontrado');
      }
      await axios.delete(`${backendUrl}/produtos/${produtoId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

const queryClient = new QueryClient();
const EstoqueWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroEstoque />
    </ModalsProvider>
  </QueryClientProvider>
);

export default EstoqueWithProviders;

// Funções de validação
const validateRequired = (value: any) => value !== null && value !== undefined && value.toString().trim().length > 0; // Verifica se o campo está preenchido.
const validateQuantidade = (quantidade: number) => {const quantidadeStr = quantidade.toString();return /^[1-9]\d{0,2}$/.test(quantidadeStr);}; // Aplica a validação de números inteiros maiores que zero e até 3 dígitos

// Validações do Estoque
const validateEstoque = (values: Estoque) => {
  const errors: Record<string, string | undefined> = {};

  // Validação de Quantidade
  if (!validateRequired(values.quantidade)) {
    errors.quantidade = 'Quantidade é obrigatória.';
  } else if (!validateQuantidade(values.quantidade)) {
    errors.quantidade = 'Quantidade inválida, necessário ser número inteiro.';
  }

  return errors;
};