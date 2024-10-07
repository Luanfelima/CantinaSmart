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

// Importa a instância de API personalizada (provavelmente uma configuração do axios)
import api from '../../api/api';

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

  // Obtém a instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Usa o hook useGetFuncionarios para buscar os funcionários
  const {
    data: fetchedFuncionarios = [], // Dados dos funcionários
    error,                          // Possível erro na requisição
    isError: isLoadingFuncionariosError, // Indica se houve erro ao carregar
    isFetching: isFetchingFuncionarios,  // Indica se está buscando dados
    isLoading: isLoadingFuncionarios,    // Indica se está carregando
  } = useGetFuncionarios();

  // Se houver um erro ao carregar os funcionários, exibe uma mensagem de erro
  if (isLoadingFuncionariosError) {
    console.error('Erro ao buscar funcionários:', error);
    return <div>Erro ao carregar os funcionários. Por favor, tente novamente mais tarde.</div>;
  }

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
    try {
      await createFuncionarioMutation.mutateAsync(values); // Realiza a mutação para criar o funcionário
      exitCreatingMode(); // Sai do modo de criação
    } catch (error) {
      console.error('Erro ao criar funcionário:', error);
    }
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
    try {
      await updateFuncionarioMutation.mutateAsync(values); // Realiza a mutação para atualizar o funcionário
      table.setEditingRow(null); // Sai do modo de edição
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error);
    }
  };

  // Função para abrir o modal de confirmação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Funcionario>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir esse funcionário?', // Título do modal
      children: (
        <Text>
          Tem certeza que você quer excluir o funcionário {row.original.nome}? Essa ação não pode ser desfeita.
        </Text>
      ), // Conteúdo do modal
      labels: { confirm: 'Excluir', cancel: 'Cancelar' }, // Botões do modal
      confirmProps: { color: 'red' }, // Estilo do botão de confirmação
      onConfirm: async () => {
        // Ação ao confirmar exclusão
        try {
          await deleteFuncionarioMutation.mutateAsync(row.original.id_func); // Realiza a mutação para deletar o funcionário
        } catch (error) {
          console.error('Erro ao excluir funcionário:', error);
        }
      },
    });

  // Define as colunas da tabela utilizando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<Funcionario>[]>(
    () => [
      {
        accessorKey: 'nome', // Chave de acesso ao campo 'nome'
        header: 'Nome',      // Rótulo da coluna
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

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedFuncionarios, // Dados dos funcionários buscados
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal',   // Define que o formulário de edição será exibido em um modal
    enableEditing: true,        // Habilita a edição na tabela
    getRowId: (row) => String(row.id_func), // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingFuncionariosError
      ? { color: 'red', children: 'Erro ao carregar dados' } // Exibe uma mensagem de erro se houver problema ao carregar os dados
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } }, // Define a altura mínima da tabela
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateFuncionario,         // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}),  // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveFuncionario,            // Função para salvar a edição
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo funcionário</Button> /* Botão para criar novo funcionário */
    ),
    state: {
      isLoading: isLoadingFuncionarios,                 // Estado de carregamento
      isSaving: false,                                  // Estado de salvamento
      showAlertBanner: isLoadingFuncionariosError,      // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingFuncionarios,         // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela ou a mensagem de erro
  return (
    <>
      {isLoadingFuncionariosError ? (
        <div>Erro ao carregar os funcionários. Por favor, tente novamente mais tarde.</div>
      ) : (
        <MantineReactTable table={table} />
      )}
    </>
  );
};

// Função para obter funcionários
function useGetFuncionarios() {
  return useQuery<Funcionario[], Error>({
    queryKey: ['funcionarios'], // Chave da query
    queryFn: async () => {
      // Realiza uma requisição GET para obter os funcionários usando a instância de API personalizada
      const response = await api.get('/funcionarios');
      return response.data;
    },
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Função para criar funcionário
function useCreateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation<Funcionario, Error, Omit<Funcionario, 'id_func'>>({
    mutationFn: async (funcionario) => {
      // Realiza uma requisição POST para criar um funcionário
      const response = await api.post('/funcionarios', funcionario);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos funcionários atualizados
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
    onError: (error) => {
      console.error('Erro ao criar funcionário:', error);
    },
  });
}

// Função para atualizar funcionário
function useUpdateFuncionario() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Funcionario>({
    mutationFn: async (funcionario) => {
      // Realiza uma requisição PUT para atualizar o funcionário
      await api.put(`/funcionarios/${funcionario.id_func}`, funcionario);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos funcionários atualizados
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar funcionário:', error);
    },
  });
}

// Função para deletar funcionário
function useDeleteFuncionario() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: async (funcionarioId) => {
      // Realiza uma requisição DELETE para deletar o funcionário
      await api.delete(`/funcionarios/${funcionarioId}`);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos funcionários atualizados
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    },
    onError: (error) => {
      console.error('Erro ao excluir funcionário:', error);
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

// Valida se o valor tem um comprimento mínimo
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;

// Valida se o valor é obrigatório (não nulo, não indefinido e não vazio)
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;

// Valida o nome (não deve conter números e deve ter no mínimo 4 caracteres)
const validateNome = (nome: string) => {
  const regex = /^[^0-9]+$/;
  return regex.test(nome) && validateMinLength(nome, 4);
};

// Valida o e-mail usando uma expressão regular
const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return !!email.length && regex.test(email.toLowerCase());
};

// Valida o CPF (deve ter 11 dígitos numéricos e não conter '.' ou '-')
const validateCpf = (cpf: string) => {
  if (cpf.includes('.') || cpf.includes('-')) {
    return false;
  }
  return /^[0-9]{11}$/.test(cpf);
};

// Valida o telefone (deve ter 10 ou 11 dígitos numéricos)
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