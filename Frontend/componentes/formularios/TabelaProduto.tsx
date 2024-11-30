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

// Tipo Produto
type Produto = {
  id_produto: number;
  nome_p: string;
  categoria: string;
  quantidade_produto: number,
  preco: number;
  perecivel: boolean;
  descricao: string;
  unidade_medida: string;
};

const CadastroProduto = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const queryClient = useQueryClient();

  const {
    data: fetchedProdutos = [],
    isError: isLoadingProdutosError,
    isFetching: isFetchingProdutos,
    isLoading: isLoadingProdutos,
  } = useGetProdutos();

  // Verifica erro ao carregar produtos
  if (isLoadingProdutosError) {
    console.error('Erro ao carregar produtos:', isLoadingProdutosError);
    return <div>Erro ao carregar os produtos. Tente novamente mais tarde.</div>;
  }

  // Definição das colunas da tabela de produtos
  const columns = useMemo<MRT_ColumnDef<Produto>[]>(() => [
    {
      accessorKey: 'id_produto',
      header: 'ID Produto',
      enableEditing: false, // Desativa a edição
      size: 0, // Tamanho zero para ocultar
      mantineTableHeadCellProps: { style: { display: 'none' } }, // Oculta no cabeçalho
      mantineTableBodyCellProps: { style: { display: 'none' } }, // Oculta no corpo
    },
    {
      accessorKey: 'nome_p',
      header: 'Nome do Produto',
      mantineEditTextInputProps: {
        required: true,
        error: validationErrors?.nome_p,
        onFocus: () => setValidationErrors({ ...validationErrors, nome_p: undefined }),
      },
    },
    {
      accessorKey: 'categoria',
      header: 'Categoria',
      editVariant: 'select',
      mantineEditSelectProps: {
        data: [ 'Bebidas', 'Salgados', 'Lanches', 'Doces', 'PFs', 'Diversos'],  
        required: true,
        error: validationErrors?.categoria,
        onFocus: () => setValidationErrors({ ...validationErrors, categoria: undefined }),
      },
    },
    {
      accessorKey: 'quantidade_produto',
      header: 'Quantidade',
      mantineEditTextInputProps: {
        type: 'number',
        required: true,
        error: validationErrors?.quantidade_produto,
        onFocus: () => setValidationErrors({ ...validationErrors, quantidade_produto: undefined }),
      },
    },
    {
      accessorKey: 'preco',
      header: 'Preço',
      mantineEditTextInputProps: {
        type: 'number',
        required: true,
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
    {
      accessorKey: 'perecivel',
      header: 'Perecível',
      editVariant: 'select',
      mantineEditSelectProps: {
        data: [
          { value: 'true', label: 'Sim' },
          { value: 'false', label: 'Não' },
        ],
        required: true,
        error: validationErrors?.perecivel,
        onFocus: () => setValidationErrors({ ...validationErrors, perecivel: undefined }),
      },
      Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sim' : 'Não'),
    },
    {
      accessorKey: 'descricao',
      header: 'Descrição',
      mantineEditTextInputProps: {
        required: true,
        error: validationErrors?.descricao,
        onFocus: () => setValidationErrors({ ...validationErrors, descricao: undefined }),
      },
    },
    {
      accessorKey: 'unidade_medida',
      header: 'Unidade de Medida',
      editVariant: 'select', // Torna o campo um seletor
      mantineEditSelectProps: {
        data: [ 'Unidade', 'Grama', 'Quilograma', 'Miligrama', 'Litro', 'Mililitro'], // Opções de Medidas
        required: true,
        error: validationErrors?.unidade_medida,
        onFocus: () => setValidationErrors({ ...validationErrors, unidade_medida: undefined }),
      },
    },
  ], [validationErrors]);

  // Mutations para criar, atualizar e excluir produtos
  const createProdutoMutation = useCreateProduto();
  const updateProdutoMutation = useUpdateProduto();
  const deleteProdutoMutation = useDeleteProduto();

  // Função para criar produto
  const handleCreateProduto: MRT_TableOptions<Produto>['onCreatingRowSave'] = async ({ values, exitCreatingMode }) => {
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createProdutoMutation.mutateAsync(values);
    exitCreatingMode();
  };

  // Função para salvar edição de produto
  const handleSaveProduto: MRT_TableOptions<Produto>['onEditingRowSave'] = async ({ values, table }) => {
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateProdutoMutation.mutateAsync(values);
    table.setEditingRow(null);
  };

  // Modal de confirmação para exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Produto>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir este produto?',
      children: (
        <Text>
          Tem certeza que você quer excluir o produto {row.original.nome_p}? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => handleDeleteProduto(row.original.id_produto),
    });

  // Função para deletar produto
  const handleDeleteProduto = async (produtoId: number) => {
    try {
      await deleteProdutoMutation.mutateAsync(produtoId);
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
    }
  };

  const table = useMantineReactTable({
    localization: MRT_Localization_PT_BR,
    columns,
    data: fetchedProdutos,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: true,
    getRowId: (row) => String(row.id_produto),
    mantineToolbarAlertBannerProps: isLoadingProdutosError
      ? { color: 'red', children: 'Erro ao carregar dados' }
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateProduto,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveProduto,
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar novo produto</Title>
        {internalEditComponents}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar Produto</Title>
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo produto</Button>
    ),
    state: {
      isLoading: isLoadingProdutos,
      isSaving: false,
      showAlertBanner: isLoadingProdutosError,
      showProgressBars: isFetchingProdutos,
    },
  });

  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD (Create, Read, Update, Delete)

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Função para obter produtos
function useGetProdutos() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useQuery<Produto[]>({
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

// Função para criar produto
function useCreateProduto() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useMutation({
    mutationFn: async (produto: Omit<Produto, 'id_produto'>) => {
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

// Função para atualizar produto
function useUpdateProduto() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useMutation({
    mutationFn: async (produto: Produto) => {
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
const CadastroProdutoWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroProduto />
    </ModalsProvider>
  </QueryClientProvider>
);

export default CadastroProdutoWithProviders;

// Funções de validação
const validateRequired = (value: any) => value !== null && value !== undefined && value.toString().trim().length > 0; // Verifica se o campo está preenchido.
const validateMinLength = (value: string, minLength: number) => value.trim().length >= minLength; // Valida comprimento mínimo.
const validateMaxLength = (value: string, maxLength: number) => value.trim().length <= maxLength; // Valida comprimento máximo.
const validateSomenteTexto = (value: string) => /^[a-zA-ZÀ-ÿ\s]+$/.test(value); // Permite apenas texto e espaços.
const validateSemCaractere = (value: any) => /^[a-zA-ZÀ-ÿ0-9\sç.,]*$/.test(value); // Permite texto, números, espaço, ., e ,.
const validatePreco = (preco: number) => {const precoStr = preco.toString().replace(",", ".");return !isNaN(Number(precoStr)) && Number(precoStr) >= 0 && /^(\d{1,3})(\.\d{1,2})?$/.test(precoStr);}; // Valida o preço, permitindo até três dígitos inteiros e dois decimais.
const validateQuantidade = (quantidade_produto: number) => {const quantidadeStr = quantidade_produto.toString();return /^[1-9]\d{0,2}$/.test(quantidadeStr);}; // Aplica a validação de números inteiros maiores que zero e até 3 dígitos

// Validações do produto
const validateProduto = (values: Produto) => {
  const errors: Record<string, string | undefined> = {};

  // Validação do Nome do Produto
  if (!validateRequired(values.nome_p)) {
    errors.nome_p = 'Nome do produto é obrigatório.';
  } else if (!validateMinLength(values.nome_p, 3)) {
    errors.nome_p = 'Nome do produto inválido, necessário ter no mínimo 3 caracteres.';
  } else if (!validateMaxLength(values.nome_p, 30)) {
    errors.nome_p = 'Nome do produto inválido, necessário ter menos de 30 caracteres.';
  } else if (!validateSomenteTexto(values.nome_p)) {
    errors.nome_p = 'Nome do produto inválido, necessário ter somente texto.';
  }
  // Validação da Categoria
  if (!validateRequired(values.categoria)) {
    errors.categoria = 'Categoria é obrigatória.';
  } else if (!validateMinLength(values.categoria, 2)) {
    errors.categoria = 'Categoria inválida, necessário ter no mínimo 2 caracteres.';
  } else if (!validateMaxLength(values.categoria, 20)) {
    errors.categoria = 'Categoria inválida, necessário ter menos de 20 caracteres.';
  } else if (!validateSomenteTexto(values.categoria)) {
    errors.categoria = 'Categoria inválida, necessário ter somente texto.';
  }
  // Validação da Quantidade
  if (!validateRequired(values.quantidade_produto)) {
    errors.quantidade = 'Quantidade é obrigatória.';
  } else if (!validateQuantidade(values.quantidade_produto)) {
    errors.quantidade = 'Quantidade inválida, necessário ser número inteiro.';
  }
  // Validação do Preço
  if (!validateRequired(values.preco)) {
    errors.preco = 'Preço é obrigatório.';
  } else if (!validatePreco(values.preco)) {
    errors.preco = 'Preço inválido, valor máximo 999.';
  }
  // Validação Perecível
  if (!validateRequired(values.perecivel)) {
    errors.perecivel = 'Campo obrigatório.';
  }
  // Validação da Descrição
  if (!validateRequired(values.descricao)) {
    errors.descricao = 'Descrição é obrigatória.';
  } else if (!validateMinLength(values.descricao, 3)) {
    errors.descricao = 'Descrição inválida, necessário ter no mínimo 3 caracteres.';
  } else if (!validateMaxLength(values.descricao, 120)) {
    errors.descricao = 'Descrição inválida, necessário ter menos de 120 caracteres.';
  } else if (!validateSemCaractere(values.descricao)) {
    errors.descricao = 'Descrição inválida, permitido apenas caracteres válidos.';
  }
  // Validação da Unidade de Medida
  if (!validateRequired(values.unidade_medida)) {
    errors.unidade_medida = 'Unidade de medida é obrigatória.';
  }

  return errors;
};