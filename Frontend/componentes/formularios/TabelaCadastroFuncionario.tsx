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

// Importa a biblioteca axios para fazer requisições HTTP
import axios from 'axios';

// Define o tipo Funcionario com os campos correspondentes
type Funcionario = {
  id_func: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  cargo: string;
};

// Componente principal para cadastro de funcionários
const CadastroFuncionario = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Define as colunas da tabela utilizando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<Funcionario>[]>(
    () => [
      {
        accessorKey: 'nome', // Chave de acesso ao campo 'nome'
        header: 'Nome', // Rótulo da coluna
        mantineEditTextInputProps: {
          required: true, // Campo obrigatório
          error: validationErrors?.nome, // Exibe erro se houver
          onFocus: () => setValidationErrors({ ...validationErrors, nome: undefined }), // Limpa o erro ao focar
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
        editVariant: 'select', // Define que este campo será um seletor
        mantineEditSelectProps: {
          data: ['Gestor(a)', 'Funcionário(a)'], // Opções disponíveis no seletor
          required: true,
          error: validationErrors?.cargo,
          onFocus: () => setValidationErrors({ ...validationErrors, cargo: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  // Obtém a instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Utiliza o hook useGetFuncionarios para buscar os funcionários
  const {
    data: fetchedFuncionarios = [],
    isError: isLoadingFuncionariosError,
    isFetching: isFetchingFuncionarios,
    isLoading: isLoadingFuncionarios,
  } = useGetFuncionarios();

  // Inicializa as mutações para criar, atualizar e deletar funcionários
  const createFuncionarioMutation = useCreateFuncionario();
  const updateFuncionarioMutation = useUpdateFuncionario();
  const deleteFuncionarioMutation = useDeleteFuncionario();

  // Função para lidar com a criação de um novo funcionário
  const handleCreateFuncionario: MRT_TableOptions<Funcionario>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    // Valida os dados do funcionário
    const newValidationErrors = validateFuncionario(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await createFuncionarioMutation.mutateAsync(values); // Realiza a mutação para criar o funcionário
    exitCreatingMode(); // Sai do modo de criação
  };

  // Função para lidar com a atualização de um funcionário existente
  const handleSaveFuncionario: MRT_TableOptions<Funcionario>['onEditingRowSave'] = async ({ values, table }) => {
    // Valida os dados do funcionário
    const newValidationErrors = validateFuncionario(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await updateFuncionarioMutation.mutateAsync(values); // Realiza a mutação para atualizar o funcionário
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Função para abrir o modal de confirmação de exclusão
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
      onConfirm: () => deleteFuncionarioMutation.mutateAsync(row.original.id_func), // Realiza a mutação para deletar o funcionário
    });

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedFuncionarios, // Dados dos funcionários buscados
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal', // Define que o formulário de edição será exibido em um modal
    enableEditing: true, // Habilita a edição na tabela
    getRowId: (row) => String(row.id_func), // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingFuncionariosError
      ? { color: 'red', children: 'Erro ao carregar dados' } // Exibe uma mensagem de erro se houver problema ao carregar os dados
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } }, // Define a altura mínima da tabela
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateFuncionario, // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveFuncionario, // Função para salvar a edição
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar novo funcionário</Title>
        {internalEditComponents} {/* Componentes internos de edição */}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} /> {/* Botões de ação */}
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo funcionário</Button> // Botão para criar novo funcionário
    ),
    state: {
      isLoading: isLoadingFuncionarios, // Estado de carregamento
      isSaving: false, // Estado de salvamento
      showAlertBanner: isLoadingFuncionariosError, // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingFuncionarios, // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Hook para criar um funcionário
function useCreateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (funcionario: Omit<Funcionario, 'id_func'>) => {
      // Realiza uma requisição POST para criar um funcionário
      const response = await axios.post('http://localhost:3000/funcionarios', funcionario);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos funcionários atualizados
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

// Hook para obter a lista de funcionários
function useGetFuncionarios() {
  return useQuery<Funcionario[]>({
    queryKey: ['funcionarios'], // Chave da query
    queryFn: async () => {
      // Realiza uma requisição GET para obter os funcionários
      const response = await axios.get('http://localhost:3000/funcionarios');
      return response.data;
    },
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Hook para atualizar um funcionário
function useUpdateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (funcionario: Funcionario) => {
      // Realiza uma requisição PUT para atualizar o funcionário
      await axios.put(`http://localhost:3000/funcionarios/${funcionario.id_func}`, funcionario);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos funcionários atualizados
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

// Hook para deletar um funcionário
function useDeleteFuncionario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (funcionarioId: number) => {
      // Realiza uma requisição DELETE para deletar o funcionário
      await axios.delete(`http://localhost:3000/funcionarios/${funcionarioId}`);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos funcionários atualizados
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
  });
}

// Cria uma instância do QueryClient para gerenciar o cache
const queryClient = new QueryClient();

// Componente que envolve o CadastroFuncionario com os provedores necessários
const CadastroFuncionarioWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroFuncionario />
    </ModalsProvider>
  </QueryClientProvider>
);

// Exporta o componente padrão
export default CadastroFuncionarioWithProviders;

// Funções de validação
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;

const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;

const validateNome = (nome: string) => {
  const regex = /^[^0-9]+$/; // Regex para não permitir números
  return regex.test(nome) && validateMinLength(nome, 4);
};

const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return !!email.length && regex.test(email.toLowerCase());
};

const validateCpf = (cpf: string) => {
  if (cpf.includes('.') || cpf.includes('-')) {
    return false;
  }
  return /^[0-9]{11}$/.test(cpf);
};

const validateTelefone = (telefone: string) => {
  const cleanTelefone = telefone.replace(/\D/g, ''); // Remove caracteres não numéricos
  return !!cleanTelefone.length && /^[0-9]{10,11}$/.test(cleanTelefone);
};

// Função que valida todos os campos do funcionário
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
