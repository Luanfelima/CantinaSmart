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

// Define o tipo Categoria com os campos correspondentes
type Categoria = {
  id_categorias: number;
  nome: string;
  descricao: string;
};

// Componente principal que renderiza a tabela de categorias
const Example = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Define as colunas da tabela utilizando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<Categoria>[]>(
    () => [
      {
        accessorKey: 'nome', // Chave de acesso ao campo 'nome'
        header: 'Nome',      // Rótulo da coluna
        mantineEditTextInputProps: {
          required: true,                       // Campo obrigatório
          error: validationErrors?.nome,        // Exibe erro se houver
          onFocus: () => setValidationErrors({ ...validationErrors, nome: undefined }), // Limpa o erro ao focar
        },
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
    ],
    [validationErrors],
  );

  // Obtém a instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Usa o hook useGetCategorias para buscar as categorias
  const {
    data: fetchedCategorias = [],           // Dados das categorias
    isError: isLoadingCategoriasError,      // Indica se houve erro ao carregar
    isFetching: isFetchingCategorias,       // Indica se está buscando dados
    isLoading: isLoadingCategorias,         // Indica se está carregando
  } = useGetCategorias();

  // Inicializa as mutações para criar, atualizar e deletar categorias
  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();
  const deleteCategoriaMutation = useDeleteCategoria();

  // Função para lidar com a criação de uma nova categoria
  const handleCreateCategoria: MRT_TableOptions<Categoria>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    // Valida os dados da categoria
    const newValidationErrors = validateCategoria(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await createCategoriaMutation.mutateAsync(values); // Realiza a mutação para criar a categoria
    exitCreatingMode(); // Sai do modo de criação
  };

  // Função para lidar com a atualização de uma categoria existente
  const handleSaveCategoria: MRT_TableOptions<Categoria>['onEditingRowSave'] = async ({ values, table }) => {
    // Valida os dados da categoria
    const newValidationErrors = validateCategoria(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await updateCategoriaMutation.mutateAsync(values); // Realiza a mutação para atualizar a categoria
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Função para abrir o modal de confirmação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Categoria>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir essa categoria?', // Título do modal
      children: (
        <Text>
          Tem certeza que você quer excluir a categoria {row.original.nome}? Essa ação não pode ser desfeita.
        </Text>
      ), // Conteúdo do modal
      labels: { confirm: 'Excluir', cancel: 'Cancelar' }, // Botões do modal
      confirmProps: { color: 'red' }, // Estilo do botão de confirmação
      onConfirm: () => deleteCategoriaMutation.mutateAsync(row.original.id_categorias), // Ação ao confirmar exclusão
    });

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedCategorias, // Dados das categorias buscadas
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal',   // Define que o formulário de edição será exibido em um modal
    enableEditing: true,        // Habilita a edição na tabela
    getRowId: (row) => String(row.id_categorias), // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingCategoriasError
      ? { color: 'red', children: 'Erro ao carregar dados' } // Exibe uma mensagem de erro se houver problema ao carregar os dados
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } }, // Define a altura mínima da tabela
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateCategoria,           // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}),  // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveCategoria,              // Função para salvar a edição
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar nova categoria</Title>
        {internalEditComponents} {/* Componentes internos de edição */}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} /> {/* Botões de ação */}
        </Flex>
      </Stack>
    ),
    renderEditRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Editar Categoria</Title>
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar nova categoria</Button> /* Botão para criar nova categoria */
    ),
    state: {
      isLoading: isLoadingCategorias,                 // Estado de carregamento
      isSaving: false,                                // Estado de salvamento
      showAlertBanner: isLoadingCategoriasError,      // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingCategorias,         // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD

// Hook para criar categoria
function useCreateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoria: Omit<Categoria, 'id_categorias'>) => {
      // Realiza uma requisição POST para criar uma categoria
      const response = await axios.post('http://localhost:3000/categorias', categoria);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das categorias atualizadas
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

// Hook para obter categorias
function useGetCategorias() {
  return useQuery<Categoria[]>({
    queryKey: ['categorias'], // Chave da query
    queryFn: async () => {
      // Realiza uma requisição GET para obter as categorias
      const response = await axios.get('http://localhost:3000/categorias');
      return response.data;
    },
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Hook para atualizar categoria
function useUpdateCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoria: Categoria) => {
      // Realiza uma requisição PUT para atualizar a categoria
      await axios.put(`http://localhost:3000/categorias/${categoria.id_categorias}`, categoria);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das categorias atualizadas
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
    },
  });
}

// Hook para deletar categoria
function useDeleteCategoria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoriaId: number) => {
      // Realiza uma requisição DELETE para deletar a categoria
      await axios.delete(`http://localhost:3000/categorias/${categoriaId}`);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das categorias atualizadas
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
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

// Valida o nome da categoria (não deve conter números e deve ter no mínimo 3 caracteres)
const validateNomeCategoria = (nome: string) => {
  return /^[^\d]+$/.test(nome.trim()) && validateMinLength(nome, 3);
};

// Função que valida todos os campos da categoria
function validateCategoria(categoria: Categoria) {
  const errors: Record<string, string | undefined> = {};

  // Validação do nome da categoria
  if (!validateRequired(categoria.nome)) {
    errors.nomeCategoria = 'É necessário inserir o nome da categoria';
  } else if (!validateNomeCategoria(categoria.nome)) {
    errors.nomeCategoria = 'O nome da categoria precisa ter mais do que 2 caracteres e não conter números';
  }

  // Validação da descrição (pode ser adicionada se necessário)
  if (!validateRequired(categoria.descricao)) {
    errors.descricao = 'É necessário inserir a descrição da categoria';
  } else if (!validateMinLength(categoria.descricao, 5)) {
    errors.descricao = 'A descrição deve ter pelo menos 5 caracteres';
  }

  return errors;
}