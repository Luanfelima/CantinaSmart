// Importa os estilos necessários para os componentes do Mantine e da tabela
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';

// Importa hooks e funções do React e outras bibliotecas
import { useMemo, useState } from 'react';

// Importa componentes e tipos do Mantine React Table
import {
  MRT_EditActionButtons,
  MantineReactTable,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';

// Importa componentes do Mantine para a interface do usuário
import {
  ActionIcon,
  Button,
  Flex,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';

// Importa o provedor de modais e a função de modais do Mantine
import { ModalsProvider, modals } from '@mantine/modals';

// Importa ícones da biblioteca Tabler Icons
import { IconEdit, IconTrash } from '@tabler/icons-react';

// Importa funções e hooks do React Query para gerenciamento de dados assíncronos
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

// Importa a instância de API personalizada (neste caso, axios)
import axios from 'axios';

// Definição do tipo Produto com os campos correspondentes
type Produto = {
  id_produto: number;
  nome_p: string;
  categoria: string;
  preco: number;
  perecivel: boolean;
  descricao: string;
  unidade_medida: string;
};

// Componente principal que renderiza a tabela de produtos
const Example = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Define as colunas da tabela utilizando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<Produto>[]>(
    () => [
      {
        accessorKey: 'nome_p', // Chave de acesso ao campo 'nome_p' do produto
        header: 'Nome do Produto', // Rótulo da coluna
        mantineEditTextInputProps: {
          required: true, // Campo obrigatório
          error: validationErrors?.nome_p, // Exibe erro se houver
          onFocus: () => setValidationErrors({ ...validationErrors, nome_p: undefined }), // Limpa o erro ao focar
        },
      },
      {
        accessorKey: 'categoria',
        header: 'Categoria',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.categoria,
          onFocus: () => setValidationErrors({ ...validationErrors, categoria: undefined }),
        },
      },
      {
        accessorKey: 'preco',
        header: 'Preço',
        mantineEditTextInputProps: {
          type: 'number',
          required: true,
          error: validationErrors?.preco,
          onFocus: () => setValidationErrors({ ...validationErrors, preco: undefined }),
        },
      },
      {
        accessorKey: 'perecivel',
        header: 'Perecível',
        editVariant: 'select', // Define que este campo será um seletor
        mantineEditSelectProps: {
          data: [
            { value: 'true', label: 'Sim' },
            { value: 'false', label: 'Não' },
          ], // Opções disponíveis no seletor
          required: true,
          error: validationErrors?.perecivel,
          onFocus: () => setValidationErrors({ ...validationErrors, perecivel: undefined }),
        },
        Cell: ({ cell }) => (cell.getValue<boolean>() ? 'Sim' : 'Não'), // Formata a exibição na célula
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
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.unidade_medida,
          onFocus: () => setValidationErrors({ ...validationErrors, unidade_medida: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  // Obtém a instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Usa o hook useGetProdutos para buscar os produtos
  const {
    data: fetchedProdutos = [],               // Dados dos produtos
    isError: isLoadingProdutosError,          // Indica se houve erro ao carregar
    isFetching: isFetchingProdutos,           // Indica se está buscando dados
    isLoading: isLoadingProdutos,             // Indica se está carregando
  } = useGetProdutos();

  // Inicializa as mutações para criar, atualizar e deletar produtos
  const createProdutoMutation = useCreateProduto();
  const updateProdutoMutation = useUpdateProduto();
  const deleteProdutoMutation = useDeleteProduto();

  // Função para lidar com a criação de um novo produto
  const handleCreateProduto: MRT_TableOptions<Produto>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    // Valida os dados do produto
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação

    // Prepara o objeto produto, garantindo que 'perecivel' seja um booleano
    const newProduto = {
      ...values,
      perecivel: values.perecivel === 'true',
    };

    await createProdutoMutation.mutateAsync(newProduto); // Realiza a mutação para criar o produto
    exitCreatingMode(); // Sai do modo de criação
  };

  // Função para lidar com a atualização de um produto existente
  const handleSaveProduto: MRT_TableOptions<Produto>['onEditingRowSave'] = async ({ values, table }) => {
    // Valida os dados do produto
    const newValidationErrors = validateProduto(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação

    // Prepara o objeto produto, garantindo que 'perecivel' seja um booleano
    const updatedProduto = {
      ...values,
      perecivel: values.perecivel === 'true' || values.perecivel === true,
    };

    await updateProdutoMutation.mutateAsync(updatedProduto); // Realiza a mutação para atualizar o produto
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Função para abrir o modal de confirmação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Produto>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir este produto?', // Título do modal
      children: (
        <Text>
          Tem certeza que você quer excluir o produto {row.original.nome_p}? Essa ação não pode ser desfeita.
        </Text>
      ), // Conteúdo do modal
      labels: { confirm: 'Excluir', cancel: 'Cancelar' }, // Botões do modal
      confirmProps: { color: 'red' }, // Estilo do botão de confirmação
      onConfirm: () => handleDeleteProduto(row.original.id_produto), // Ação ao confirmar exclusão
    });

  // Função para deletar um produto
  const handleDeleteProduto = async (produtoId: number) => {
    try {
      if (!produtoId && produtoId !== 0) {
        console.error('ID do produto é inválido:', produtoId);
        return;
      }

      await deleteProdutoMutation.mutateAsync(produtoId); // Realiza a mutação para deletar o produto
    } catch (error) {
      console.error('Erro ao excluir o produto:', error);
    }
  };

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedProdutos, // Dados dos produtos buscados
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal',   // Define que o formulário de edição será exibido em um modal
    enableEditing: true,        // Habilita a edição na tabela
    getRowId: (row) => String(row.id_produto), // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingProdutosError
      ? { color: 'red', children: 'Erro ao carregar dados' } // Exibe uma mensagem de erro se houver problema ao carregar os dados
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } }, // Define a altura mínima da tabela
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateProduto,             // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}),  // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveProduto,                // Função para salvar a edição
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar novo produto</Title>
        {internalEditComponents} {/* Componentes internos de edição */}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} /> {/* Botões de ação */}
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
            <IconEdit /> {/* Ícone de edição */}
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Apagar">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash /> {/* Ícone de exclusão */}
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo produto</Button> /* Botão para criar novo produto */
    ),
    state: {
      isLoading: isLoadingProdutos,                 // Estado de carregamento
      isSaving: false,                              // Estado de salvamento
      showAlertBanner: isLoadingProdutosError,      // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingProdutos,         // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD

// Hook para obter produtos
function useGetProdutos() {
  return useQuery<Produto[]>({
    queryKey: ['produtos'], // Chave da query
    queryFn: async () => {
      // Realiza uma requisição GET para obter os produtos
      const response = await axios.get('http://localhost:3000/produtos');
      return response.data;
    },
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Hook para criar produto
function useCreateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: Omit<Produto, 'id_produto'>) => {
      // Realiza uma requisição POST para criar um produto
      const response = await axios.post('http://localhost:3000/produtos', produto);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos produtos atualizados
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

// Hook para atualizar produto
function useUpdateProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: Produto) => {
      // Realiza uma requisição PUT para atualizar o produto
      await axios.put(`http://localhost:3000/produtos/${produto.id_produto}`, produto);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos produtos atualizados
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

// Hook para deletar produto
function useDeleteProduto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produtoId: number) => {
      if (!produtoId && produtoId !== 0) {
        throw new Error('ID do produto é inválido.');
      }
      // Realiza uma requisição DELETE para deletar o produto
      await axios.delete(`http://localhost:3000/produtos/${produtoId}`);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos produtos atualizados
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
    },
  });
}

// Cria uma instância do QueryClient para gerenciar o cache
const queryClient = new QueryClient();

// Componente que envolve o Example com os provedores necessários
const ExampleWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Example />
    </ModalsProvider>
  </QueryClientProvider>
);

// Exporta o componente padrão
export default ExampleWithProviders;

// Funções de validação

// Valida se o valor é obrigatório (não nulo, não indefinido e não vazio)
const validateRequired = (value: any) => {
  return value !== null && value !== undefined && value.toString().trim().length > 0;
};

// Valida se o valor tem um comprimento mínimo
const validateMinLength = (value: string, minLength: number) => {
  return value.trim().length >= minLength;
};

// Valida o nome do produto (não deve conter números e deve ter no mínimo 3 caracteres)
const validateNomeProduto = (nome: string) => {
  return /^[^\d]+$/.test(nome.trim()) && validateMinLength(nome, 3);
};

// Valida o preço (deve ser um número positivo)
const validatePreco = (preco: any) => {
  const numberPreco = Number(preco);
  return !isNaN(numberPreco) && numberPreco >= 0;
};

// Valida a descrição (deve ter no mínimo 4 caracteres)
const validateDescricao = (descricao: string) => {
  return validateMinLength(descricao, 4);
};

// Função que valida todos os campos do produto
const validateProduto = (values: Produto) => {
  const errors: Record<string, string | undefined> = {};

  // Validação do nome do produto
  if (!validateRequired(values.nome_p)) {
    errors.nome_p = 'Nome do produto é obrigatório';
  } else if (!validateNomeProduto(values.nome_p)) {
    errors.nome_p = 'Nome do produto inválido';
  }

  // Validação da categoria
  if (!validateRequired(values.categoria)) {
    errors.categoria = 'Categoria é obrigatória';
  } else if (!validateMinLength(values.categoria, 3)) {
    errors.categoria = 'Categoria inválida';
  }

  // Validação do preço
  if (!validateRequired(values.preco)) {
    errors.preco = 'Preço é obrigatório';
  } else if (!validatePreco(values.preco)) {
    errors.preco = 'Preço inválido';
  }

  // Validação do campo perecível
  if (values.perecivel === null || values.perecivel === undefined) {
    errors.perecivel = 'Campo perecível é obrigatório';
  }

  // Validação da descrição
  if (!validateRequired(values.descricao)) {
    errors.descricao = 'Descrição é obrigatória';
  } else if (!validateDescricao(values.descricao)) {
    errors.descricao = 'Descrição deve ter no mínimo 10 caracteres';
  }

  // Validação da unidade de medida
  if (!validateRequired(values.unidade_medida)) {
    errors.unidade_medida = 'Unidade de medida é obrigatória';
  }

  return errors;
};