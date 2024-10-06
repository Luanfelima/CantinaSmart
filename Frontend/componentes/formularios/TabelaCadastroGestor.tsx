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

// Define o tipo Gestor com os campos correspondentes
type Gestor = {
  nome: string;
  sobrenome: string;
  cpf_gestor: string; // CPF do gestor como string
  email: string;
  telefone: string;
  senha: string;
};

// Componente principal para cadastro de gestores
const CadastroGestor = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Define as colunas da tabela utilizando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<Gestor>[]>(
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
        accessorKey: 'sobrenome',
        header: 'Sobrenome',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.sobrenome,
          onFocus: () => setValidationErrors({ ...validationErrors, sobrenome: undefined }),
        },
      },
      {
        accessorKey: 'cpf_gestor',
        header: 'CPF',
        mantineEditTextInputProps: {
          required: true,
          error: validationErrors?.cpf_gestor,
          onFocus: () => setValidationErrors({ ...validationErrors, cpf_gestor: undefined }),
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
          type: 'password', // Campo do tipo senha
          required: true,
          error: validationErrors?.senha,
          onFocus: () => setValidationErrors({ ...validationErrors, senha: undefined }),
        },
      },
    ],
    [validationErrors],
  );

  // Obtém a instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Usa o hook useGetGestores para buscar os gestores
  const {
    data: fetchedGestores = [],
    isError: isLoadingGestoresError,
    isFetching: isFetchingGestores,
    isLoading: isLoadingGestores,
  } = useGetGestores();

  // Inicializa as mutações para criar, atualizar e deletar gestores
  const createGestorMutation = useCreateGestor();
  const updateGestorMutation = useUpdateGestor();
  const deleteGestorMutation = useDeleteGestor();

  // Função para lidar com a criação de um novo gestor
  const handleCreateGestor: MRT_TableOptions<Gestor>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    // Valida os dados do gestor
    const newValidationErrors = validateGestor(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await createGestorMutation.mutateAsync(values); // Realiza a mutação para criar o gestor
    exitCreatingMode(); // Sai do modo de criação
  };

  // Função para lidar com a atualização de um gestor existente
  const handleSaveGestor: MRT_TableOptions<Gestor>['onEditingRowSave'] = async ({ values, table }) => {
    // Valida os dados do gestor
    const newValidationErrors = validateGestor(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação
    await updateGestorMutation.mutateAsync(values); // Realiza a mutação para atualizar o gestor
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Função para abrir o modal de confirmação de exclusão
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
      onConfirm: () => deleteGestorMutation.mutateAsync(row.original.cpf_gestor), // Realiza a mutação para deletar o gestor
    });

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedGestores, // Dados dos gestores buscados
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal', // Define que o formulário de edição será exibido em um modal
    enableEditing: true, // Habilita a edição na tabela
    getRowId: (row) => String(row.cpf_gestor), // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingGestoresError
      ? { color: 'red', children: 'Erro ao carregar dados.' } // Exibe uma mensagem de erro se houver problema ao carregar os dados
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } }, // Define a altura mínima da tabela
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateGestor, // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveGestor, // Função para salvar a edição
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar novo Gestor</Title>
        {internalEditComponents} {/* Componentes internos de edição */}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} /> {/* Botões de ação */}
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar novo Gestor</Button> // Botão para criar novo gestor
    ),
    state: {
      isLoading: isLoadingGestores, // Estado de carregamento
      isSaving: false, // Estado de salvamento
      showAlertBanner: isLoadingGestoresError, // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingGestores, // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Função para obter gestores
function useGetGestores() {
  return useQuery<Gestor[]>({
    queryKey: ['gestor'], // Chave da query
    queryFn: async () => {
      // Realiza uma requisição GET para obter os gestores
      const response = await axios.get('http://localhost:3000/gestor');
      return response.data;
    },
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Função para criar gestor
function useCreateGestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gestor: Gestor) => {
      // Realiza uma requisição POST para criar um gestor
      const response = await axios.post('http://localhost:3000/gestor', gestor);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos gestores atualizados
      queryClient.invalidateQueries({ queryKey: ['gestor'] });
    },
  });
}

// Função para atualizar gestor
function useUpdateGestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gestor: Gestor) => {
      // Realiza uma requisição PUT para atualizar o gestor
      await axios.put(`http://localhost:3000/gestor/${gestor.cpf_gestor}`, gestor);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos gestores atualizados
      queryClient.invalidateQueries({ queryKey: ['gestor'] });
    },
  });
}

// Função para deletar gestor
function useDeleteGestor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cpf_gestor: string) => {
      // Realiza uma requisição DELETE para deletar o gestor
      await axios.delete(`http://localhost:3000/gestor/${cpf_gestor}`);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch dos gestores atualizados
      queryClient.invalidateQueries({ queryKey: ['gestor'] });
    },
  });
}

// Cria uma instância do QueryClient para gerenciar o cache
const queryClient = new QueryClient();

// Componente que envolve o CadastroGestor com os provedores necessários
const CadastroGestorWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <CadastroGestor />
    </ModalsProvider>
  </QueryClientProvider>
);

// Exporta o componente padrão
export default CadastroGestorWithProviders;

// Funções de validação

// Valida se o valor tem um comprimento mínimo
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;

// Valida se o valor é obrigatório (não nulo e não vazio)
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;

// Valida o nome (não deve conter números e deve ter no mínimo 4 caracteres)
const validateNome = (nome: string) => {
  const regex = /^[^0-9]+$/;
  return regex.test(nome) && validateMinLength(nome, 4);
};

// Valida o sobrenome (não deve conter números e deve ter no mínimo 4 caracteres)
const validateSobrenome = (sobrenome: string) => {
  const regex = /^[^0-9]+$/;
  return regex.test(sobrenome) && validateMinLength(sobrenome, 4);
};

// Valida o CPF (deve ter 11 dígitos numéricos e não conter '.' ou '-')
const validateCpf = (cpf_gestor: string) => {
  if (cpf_gestor.includes('.') || cpf_gestor.includes('-')) {
    return false;
  }
  return /^[0-9]{11}$/.test(cpf_gestor);
};

// Valida o e-mail
const validateEmail = (email: string) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return !!email.length && regex.test(email.toLowerCase());
};

// Valida o telefone (deve ter 10 ou 11 dígitos numéricos)
const validateTelefone = (telefone: string) => {
  const cleanTelefone = telefone.replace(/\D/g, '');
  return !!cleanTelefone.length && /^[0-9]{10,11}$/.test(cleanTelefone);
};

// Função que valida todos os campos do gestor
const validateGestor = (values: Gestor) => {
  const errors: Record<string, string | undefined> = {};

  // Validação do nome
  if (!validateRequired(values.nome)) {
    errors.nome = 'Nome é obrigatório';
  } else if (!validateNome(values.nome)) {
    errors.nome = 'Nome deve ter no mínimo 4 caracteres e não pode conter números';
  }

  // Validação do sobrenome
  if (!validateRequired(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome é obrigatório';
  } else if (!validateSobrenome(values.sobrenome)) {
    errors.sobrenome = 'Sobrenome deve ter no mínimo 4 caracteres e não pode conter números';
  }

  // Validação do CPF
  if (!validateRequired(values.cpf_gestor)) {
    errors.cpf_gestor = 'CPF é obrigatório';
  } else if (!validateCpf(values.cpf_gestor)) {
    errors.cpf_gestor = 'CPF inválido. Digite sem traços e pontos';
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

  // Validação da senha
  if (!validateRequired(values.senha)) {
    errors.senha = 'Senha é obrigatória';
  } else if (!validateMinLength(values.senha, 8)) {
    errors.senha = 'A senha deve conter no mínimo 8 caracteres';
  }

  return errors;
};