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

// Definição do tipo Unidade com os campos correspondentes
type Unidade = {
  id_unidade: number;
  polo: string;
  nome_unidade: string;
  cep: string;
  cidade: string;
  rua: string;
  estado: string;
  numero: string;
  complemento?: string; // Campo opcional
};

// Componente principal que renderiza a tabela de unidades
const Example = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Define as colunas da tabela utilizando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<Unidade>[]>(
    () => [
      {
        accessorKey: 'polo', // Chave de acesso ao campo 'polo'
        header: 'Polo',       // Rótulo da coluna
        editVariant: 'select', // Define que este campo será um seletor
        mantineEditSelectProps: {
          data: ['Barcelona', 'Centro', 'Conceição', 'São Paulo'], // Opções disponíveis no seletor
          required: true,
          error: validationErrors?.polo, // Exibe erro se houver
          onFocus: () => setValidationErrors({ ...validationErrors, polo: undefined }), // Limpa o erro ao focar
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

  // Obtém a instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Usa o hook useGetUnidades para buscar as unidades
  const {
    data: fetchedUnidades = [],          // Dados das unidades
    isError: isLoadingUnidadesError,     // Indica se houve erro ao carregar
    isFetching: isFetchingUnidades,      // Indica se está buscando dados
    isLoading: isLoadingUnidades,        // Indica se está carregando
  } = useGetUnidades();

  // Inicializa as mutações para criar, atualizar e deletar unidades
  const createUnidadeMutation = useCreateUnidade();
  const updateUnidadeMutation = useUpdateUnidade();
  const deleteUnidadeMutation = useDeleteUnidade();

  // Função para lidar com a criação de uma nova unidade
  const handleCreateUnidade: MRT_TableOptions<Unidade>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    console.log('Iniciando criação de unidade com valores:', values);
    // Valida os dados da unidade
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação

    try {
      await createUnidadeMutation.mutateAsync(values); // Realiza a mutação para criar a unidade
      console.log('Unidade criada com sucesso');
      exitCreatingMode(); // Sai do modo de criação
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
    }
  };

  // Função para lidar com a atualização de uma unidade existente
  const handleSaveUnidade: MRT_TableOptions<Unidade>['onEditingRowSave'] = async ({ values, table }) => {
    console.log('Iniciando atualização de unidade com valores:', values);
    // Valida os dados da unidade
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação

    try {
      await updateUnidadeMutation.mutateAsync(values); // Realiza a mutação para atualizar a unidade
      console.log('Unidade atualizada com sucesso');
      table.setEditingRow(null); // Sai do modo de edição
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
    }
  };

  // Função para abrir o modal de confirmação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Unidade>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir essa unidade?', // Título do modal
      children: (
        <Text>
          Tem certeza que você quer excluir a unidade {row.original.nome_unidade}? Essa ação não pode ser desfeita.
        </Text>
      ), // Conteúdo do modal
      labels: { confirm: 'Excluir', cancel: 'Cancelar' }, // Botões do modal
      confirmProps: { color: 'red' }, // Estilo do botão de confirmação
      onConfirm: () => deleteUnidadeMutation.mutateAsync(row.original.id_unidade), // Ação ao confirmar exclusão
    });

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedUnidades, // Dados das unidades buscadas
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal',   // Define que o formulário de edição será exibido em um modal
    enableEditing: true,        // Habilita a edição na tabela
    getRowId: (row) => String(row.id_unidade), // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingUnidadesError
      ? { color: 'red', children: 'Erro ao carregar dados' } // Exibe uma mensagem de erro se houver problema ao carregar os dados
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } }, // Define a altura mínima da tabela
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateUnidade,             // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}),  // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveUnidade,                // Função para salvar a edição
    renderCreateRowModalContent: ({ table, row, internalEditComponents }) => (
      <Stack>
        <Title order={3}>Cadastrar nova unidade</Title>
        {internalEditComponents} {/* Componentes internos de edição */}
        <Flex justify="flex-end" mt="xl">
          <MRT_EditActionButtons variant="text" table={table} row={row} /> {/* Botões de ação */}
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar nova unidade</Button> /* Botão para criar nova unidade */
    ),
    state: {
      isLoading: isLoadingUnidades,                 // Estado de carregamento
      isSaving: false,                              // Estado de salvamento
      showAlertBanner: isLoadingUnidadesError,      // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingUnidades,         // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD

// Hook para obter unidades
function useGetUnidades() {
  return useQuery<Unidade[]>({
    queryKey: ['unidades'], // Chave da query
    queryFn: async () => {
      // Realiza uma requisição GET para obter as unidades usando a instância de API personalizada
      const response = await api.get('/unidades');
      return response.data;
    },
    refetchOnWindowFocus: false, // Não refaz o fetch ao focar na janela
  });
}

// Hook para criar unidade
function useCreateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Omit<Unidade, 'id_unidade'>) => {
      console.log('Enviando requisição para criar unidade:', unidade);
      // Realiza uma requisição POST para criar uma unidade
      const response = await api.post('/unidades', unidade);
      console.log('Resposta do backend:', response.data);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das unidades atualizadas
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
    onError: (error) => {
      console.error('Erro na mutação de criação de unidade:', error);
    },
  });
}

// Hook para atualizar unidade
function useUpdateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Unidade) => {
      console.log('Enviando requisição para atualizar unidade:', unidade);
      // Realiza uma requisição PUT para atualizar a unidade
      await api.put(`/unidades/${unidade.id_unidade}`, unidade);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das unidades atualizadas
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
    onError: (error) => {
      console.error('Erro na mutação de atualização de unidade:', error);
    },
  });
}

// Hook para deletar unidade
function useDeleteUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidadeId: number) => {
      console.log('Enviando requisição para deletar unidade com ID:', unidadeId);
      // Realiza uma requisição DELETE para deletar a unidade
      await api.delete(`/unidades/${unidadeId}`);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das unidades atualizadas
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
    onError: (error) => {
      console.error('Erro na mutação de exclusão de unidade:', error);
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

// Valida se o nome da unidade não contém números
const validateNomeUnidade = (value: string) => /^[^\d]+$/.test(value);

// Valida se o valor tem um comprimento mínimo
const validateMinLength = (value: string, minLength: number) => !!value && value.length >= minLength;

// Valida se o valor é obrigatório (não nulo, não indefinido e não vazio)
const validateRequired = (value: any) => value !== null && value !== undefined && !!value.length;

// Valida o CEP (deve ter 8 dígitos numéricos)
const validateCep = (cep: string) => /^\d{8}$/.test(cep);

// Valida se o número é um número válido (inteiro ou decimal)
const validateNumero = (numero: string) => /^-?\d+(\.\d+)?$/.test(numero);

// Função que valida todos os campos da unidade
const validateUnidade = (values: Unidade) => {
  const errors: Record<string, string | undefined> = {};

  // Validação do polo
  if (!validateRequired(values.polo)) {
    errors.polo = 'Polo é obrigatório';
  }

  // Validação do nome da unidade
  if (!validateRequired(values.nome_unidade)) {
    errors.nome_unidade = 'Nome da unidade é obrigatório';
  } else if (!validateNomeUnidade(values.nome_unidade)) {
    errors.nome_unidade = 'Nome inválido';
  } else if (!validateMinLength(values.nome_unidade, 2)) {
    errors.nome_unidade = 'Nome inválido';
  }

  // Validação do CEP
  if (!validateRequired(values.cep)) {
    errors.cep = 'CEP é obrigatório';
  } else if (!validateCep(values.cep)) {
    errors.cep = 'CEP inválido. Digite sem o "-" ';
  }

  // Validação da cidade
  if (!validateRequired(values.cidade)) {
    errors.cidade = 'Cidade é obrigatória';
  }

  // Validação da rua
  if (!validateRequired(values.rua)) {
    errors.rua = 'Rua é obrigatória';
  }

  // Validação do estado
  if (!validateRequired(values.estado)) {
    errors.estado = 'Estado é obrigatório';
  }

  // Validação do número
  if (!validateRequired(values.numero)) {
    errors.numero = 'Número é obrigatório';
  } else if (!validateNumero(values.numero)) {
    errors.numero = 'Número inválido';
  }

  // O campo 'complemento' é opcional, mas pode ser validado se necessário

  return errors;
};