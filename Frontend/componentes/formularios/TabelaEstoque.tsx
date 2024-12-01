import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { MRT_Localization_PT_BR } from 'mantine-react-table/locales/pt-BR/index.cjs';
import { Alert, Input } from '@mantine/core';
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
import { IconAlertCircle, IconAlertTriangle, IconCheck, IconCurrencyReal, IconInfoCircle } from '@tabler/icons-react';
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
  nivel_critico: number;
  id_produto: number;
  nome_p: string;
  quantidade: number;
  preco: number;
};

const CadastroEstoque = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const queryClient = useQueryClient();
  const [showAlert, setShowAlert] = useState(true);

  const {
    data: fetchedEstoque = [],
    isError: isLoadingEstoqueError,
    isFetching: isFetchingEstoque,
    isLoading: isLoadingEstoque,
  } = useGetEstoque();

  const hasCriticalStock = useMemo(() => 
    fetchedEstoque.some(item => item.quantidade <= item.nivel_critico), 
    [fetchedEstoque]
  );

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
        Cell: ({ row }) => {
          // Realiza o casting explícito para garantir o tipo correto
          const preco = Number(row.getValue('preco')) || 0;
          return (
            <Input.Wrapper label="">
              <Input
                value={`R$ ${preco.toFixed(2).replace('.', ',')}`} // Formata o valor como moeda brasileira
                readOnly // Mantém o campo sem edição
                styles={{
                  input: {
                    color: 'black',
                    cursor: 'default',
                    border: 'white', // Estiliza o campo
                  },
                }}
              />
            </Input.Wrapper>
          );
        },
      },
    {
      accessorKey: 'nivel_critico',
      header: 'Nível Crítico',
      enableEditing: false, // Desativa a edição no modal
      Cell: ({ row }) => {
        const quantidade = row.original.quantidade;
        const nivelCritico = row.original.nivel_critico;
  
        // Lógica para determinar o ícone e a cor
        let icon = <IconCheck color="green" />;
        let tooltip = "Estoque em nível aceitável";
  
        if (quantidade <= nivelCritico) {
          icon = <IconAlertCircle color="red" />;
          tooltip = "Estoque em nível crítico!";
        } else if (quantidade <= nivelCritico * 2) {
          icon = <IconAlertTriangle color="orange" />;
          tooltip = "Estoque próximo ao nível crítico!";
        }
  
        return (
          <Flex align="center" gap="sm">
            <Tooltip label={tooltip}>
              <ActionIcon variant="transparent">{icon}</ActionIcon>
            </Tooltip>
          </Flex>
        );
      },
      mantineEditTextInputProps: {
        style: { display: 'none' }, // Garante que não aparece no modal
      },
    },
  ], [validationErrors]);

  // Mutations para criar, atualizar e excluir Estoque
  const updateEstoqueMutation = useUpdateEstoque();

  // Função para salvar edição de Estoque
  const handleSaveEstoque: MRT_TableOptions<Estoque>['onEditingRowSave'] = async ({ values, table }) => {
    try {
      // Validações dos campos
      if (!values.quantidade || values.quantidade <= 0) {
        setValidationErrors({ quantidade: 'Quantidade inválida. Insira um número maior que zero.' });
        return;
      }
  
      if (!values.valor_venda || values.valor_venda <= 0) {
        setValidationErrors({ valor_venda: 'Valor de venda inválido. Insira um valor válido.' });
        return;
      }
  
      // Faz o POST para o backend
      await axios.post(
        `${backendUrl}/vendas`,
        {
          id_produto: values.id_produto,
          quantidade: values.quantidade,
          valorVenda: values.valor_venda,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Atualize o estado local ou refetch dos dados
      await queryClient.invalidateQueries({ queryKey: ['produtos'] });

      // Fecha o modal de edição
      table.setEditingRow(null);
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      setValidationErrors({ quantidade: 'Erro ao registrar a venda. Verifique os dados e tente novamente.' });
    }
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
        <Input
          type="number"
          required
          placeholder="Digite aqui o Valor da Venda"
          onChange={(event) =>
            row._valuesCache.valor_venda = parseFloat(event.target.value) || 0
          }
        />
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

  return (
    <>
      {hasCriticalStock && showAlert && (
        <Alert
          variant="filled"
          color="red"
          radius="md"
          withCloseButton
          title="Alerta de criticidade no estoque"
          icon={<IconInfoCircle />}
          onClose={() => setShowAlert(false)} // Fecha o alerta ao clicar no botão de fechar
        >
          Um ou mais itens do estoque estão em nível crítico
        </Alert>
      )}
      <MantineReactTable table={table} />
    </>
  );
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

      // Inclua o campo nivel_critico no mapeamento
      return response.data.map((produto: any) => ({
        id_produto: produto.id_produto,
        nome_p: produto.nome_p,
        preco: produto.preco,
        quantidade: produto.quantidade_produto, // Mapeia quantidade_produto para quantidade
        nivel_critico: produto.nivel_critico,   // Inclui o nivel_critico
      }));
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