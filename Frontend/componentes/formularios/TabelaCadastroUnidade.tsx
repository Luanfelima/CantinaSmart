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

// Importa a instância de API personalizada
import api from '../../api/api';

// Define o tipo Unidade com os campos correspondentes
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

// Componente principal do exemplo
const Example = () => {
  // Estado para armazenar erros de validação
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});

  // Estado para armazenar dados de preenchimento automático (autoComplete)
  const [autoCompleteData, setAutoCompleteData] = useState({
    cidade: '',
    rua: '',
    estado: '',
    cep: '',
  });

  // Define as colunas da tabela usando useMemo para otimização
  const columns = useMemo<MRT_ColumnDef<Unidade>[]>(
    () => [
      {
        accessorKey: 'polo', // Chave de acesso ao campo 'polo'
        header: 'Polo', // Rótulo da coluna
        editVariant: 'select', // Tipo de edição (seletor)
        mantineEditSelectProps: {
          data: ['Barcelona', 'Centro', 'Conceição', 'São Paulo'], // Opções disponíveis
          required: true, // Campo obrigatório
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
          onChange: async (e) => {
            // Atualiza o estado de autoCompleteData com o valor do CEP digitado
            const cepValue = (e.target as HTMLInputElement).value;
            setAutoCompleteData({ ...autoCompleteData, cep: cepValue });

            // Se o CEP tiver 8 dígitos, busca os dados de endereço na API viacep
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
          value: autoCompleteData.cidade, // Valor preenchido automaticamente
          disabled: true, // Campo desabilitado para edição manual
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
    [validationErrors, autoCompleteData], // Dependências para recomputar as colunas
  );

  // Obtém a instância do QueryClient para gerenciar o cache das requisições
  const queryClient = useQueryClient();

  // Utiliza o hook useGetUnidades para buscar as unidades
  const {
    data: fetchedUnidades = [],
    isError: isLoadingUnidadesError,
    isFetching: isFetchingUnidades,
    isLoading: isLoadingUnidades,
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
    // Valida os dados da unidade
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação

    await createUnidadeMutation.mutateAsync(values); // Realiza a mutação para criar a unidade
    exitCreatingMode(); // Sai do modo de criação
  };

  // Função para lidar com a atualização de uma unidade existente
  const handleSaveUnidade: MRT_TableOptions<Unidade>['onEditingRowSave'] = async ({ values, table }) => {
    // Valida os dados da unidade
    const newValidationErrors = validateUnidade(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors); // Define os erros de validação
      return;
    }
    setValidationErrors({}); // Limpa os erros de validação

    await updateUnidadeMutation.mutateAsync(values); // Realiza a mutação para atualizar a unidade
    table.setEditingRow(null); // Sai do modo de edição
  };

  // Função para abrir o modal de confirmação de exclusão
  const openDeleteConfirmModal = (row: MRT_Row<Unidade>) =>
    modals.openConfirmModal({
      title: 'Tem certeza que você quer excluir essa unidade?',
      children: (
        <Text>
          Tem certeza que você quer excluir a unidade {row.original.nome_unidade}? Essa ação não pode ser desfeita.
        </Text>
      ),
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => deleteUnidadeMutation.mutateAsync(row.original.id_unidade), // Realiza a mutação para deletar a unidade
    });

  // Configura o uso do MantineReactTable com as opções necessárias
  const table = useMantineReactTable({
    columns, // Colunas definidas anteriormente
    data: fetchedUnidades, // Dados das unidades buscadas
    createDisplayMode: 'modal', // Define que o formulário de criação será exibido em um modal
    editDisplayMode: 'modal', // Define que o formulário de edição será exibido em um modal
    enableEditing: true, // Habilita a edição na tabela
    getRowId: (row) => String(row.id_unidade), // Define o identificador único de cada linha
    mantineToolbarAlertBannerProps: isLoadingUnidadesError
      ? { color: 'red', children: 'Erro ao carregar dados' } // Exibe uma mensagem de erro se houver problema ao carregar os dados
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } }, // Define a altura mínima da tabela
    onCreatingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a criação
    onCreatingRowSave: handleCreateUnidade, // Função para salvar a criação
    onEditingRowCancel: () => setValidationErrors({}), // Limpa erros ao cancelar a edição
    onEditingRowSave: handleSaveUnidade, // Função para salvar a edição
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
      <Button onClick={() => table.setCreatingRow(true)}>Cadastrar nova unidade</Button> // Botão para criar nova unidade
    ),
    state: {
      isLoading: isLoadingUnidades, // Estado de carregamento
      isSaving: false, // Estado de salvamento
      showAlertBanner: isLoadingUnidadesError, // Exibe banner de alerta se houver erro
      showProgressBars: isFetchingUnidades, // Exibe barra de progresso durante o fetch
    },
  });

  // Renderiza a tabela
  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD

// Hook para obter a lista de unidades
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

// Hook para criar uma unidade
function useCreateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Omit<Unidade, 'id_unidade'>) => {
      // Realiza uma requisição POST para criar uma unidade
      const response = await axios.post('http://localhost:3000/unidades', unidade);
      return response.data;
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das unidades atualizadas
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
  });
}

// Hook para atualizar uma unidade
function useUpdateUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidade: Unidade) => {
      // Realiza uma requisição PUT para atualizar a unidade
      await axios.put(`http://localhost:3000/unidades/${unidade.id_unidade}`, unidade);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das unidades atualizadas
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
    },
  });
}

// Hook para deletar uma unidade
function useDeleteUnidade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unidadeId: number) => {
      // Realiza uma requisição DELETE para deletar a unidade
      await axios.delete(`http://localhost:3000/unidades/${unidadeId}`);
    },
    onSuccess: () => {
      // Invalida a query para refazer o fetch das unidades atualizadas
      queryClient.invalidateQueries({ queryKey: ['unidades'] });
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

// Valida se o nome da unidade não contém dígitos
const validateNomeUnidade = (value: string) => {
  return /^[^\d]+$/.test(value);
};

// Valida se o valor tem um comprimento mínimo
const validateMinLength = (value: string, minLength: number) => {
  return !!value && value.length >= minLength;
};

// Valida se o valor é obrigatório (não nulo e não vazio)
const validateRequired = (value: any) => {
  return value !== null && value !== undefined && !!value.length;
};

// Valida o CEP (deve ter 8 dígitos numéricos e não conter '-')
const validateCep = (cep: string) => {
  if (cep.includes('-')) {
    return false;
  }
  return /^\d{8}$/.test(cep);
};

// Valida o número (pode ser negativo, decimal)
const validateNumero = (numero: string) => {
  return /^-?\d+(\.\d+)?$/.test(numero);
};

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
  return errors;
};