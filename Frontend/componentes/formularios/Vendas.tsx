import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';
import { MRT_Localization_PT_BR } from 'mantine-react-table/locales/pt-BR/index.cjs';
import { useEffect, useMemo, useState } from 'react';
import {
  MantineReactTable,
  type MRT_ColumnDef,
  MRT_Row,
  useMantineReactTable,
} from 'mantine-react-table';
import { ModalsProvider } from '@mantine/modals';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios from 'axios';

import { jsPDF } from 'jspdf'; //or use your library of choice here
import autoTable from 'jspdf-autotable';
import { Box, Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

// Tipo Vendas
type Vendas = {
  id_venda: number;
  nome_produto: string;
  valor_venda: number;
  lucro_venda: number,
  data_venda: any;  
};

const Vendas = () => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string | undefined>>({});
  const queryClient = useQueryClient();

  const {
    data: fetchedVendas = [],
    isError: isLoadingVendasError,
    isFetching: isFetchingVendas,
    isLoading: isLoadingVendas,
  } = useGetVendas();

  // Verifica erro ao carregar Vendas
  if (isLoadingVendasError) {
    console.error('Erro ao carregar Vendas:', isLoadingVendasError);
    return <div>Erro ao carregar as Vendas. Tente novamente mais tarde.</div>;
  }

  // Definição das colunas da tabela de vendas
  const columns = useMemo<MRT_ColumnDef<Vendas>[]>(() => [
    {
      accessorKey: 'id_venda',
      header: 'ID Vendas',
      enableEditing: false, // Desativa a edição
      size: 0, // Tamanho zero para ocultar
      mantineTableHeadCellProps: { style: { display: 'none' } }, // Oculta no cabeçalho
      mantineTableBodyCellProps: { style: { display: 'none' } }, // Oculta no corpo
    },
    {
      accessorKey: 'nome_produto',
      header: 'Nome do produto',
      enableEditing: false,
      mantineEditTextInputProps: {
        type: 'text',
      },
    },
    {
      accessorKey: 'valor_venda',
      header: 'Valor da Venda',
      enableEditing: false,
      mantineEditTextInputProps: {
        type: 'number',
      },
    },
    {
      accessorKey: 'lucro_venda',
      header: 'Lucro da Venda',
      enableEditing: false,
      mantineEditTextInputProps: {
        type: 'number',
      },
    },
    {
      accessorKey: 'data_venda',
      header: 'Data da Venda',
      enableEditing: false,
      mantineEditTextInputProps: {
        type: 'text',
      },
      Cell: ({ cell }) => {
        const rawDate = cell.getValue<string>(); // Use string aqui
        const formattedDate = new Date(rawDate).toLocaleDateString('pt-BR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        return formattedDate;
      },
    }
  ], [validationErrors]);

  const handleExportRows = (rows: MRT_Row<Vendas>[]) => {
    const doc = new jsPDF();
    const tableData = rows.map((row) => Object.values(row.original));
    const tableHeaders = columns.map((c) => c.header);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
    });

    doc.save('vendas.pdf');
  };

  const table = useMantineReactTable({
    localization: MRT_Localization_PT_BR,
    columns,
    data: fetchedVendas,
    enableRowSelection: true,
    getRowId: (row) => String(row.id_venda),
    mantineToolbarAlertBannerProps: isLoadingVendasError
      ? { color: 'red', children: 'Erro ao carregar dados' }
      : undefined,
    mantineTableContainerProps: { style: { minHeight: '500px' } },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box style={{ display: 'flex', gap: '16px', padding: '8px', flexWrap: 'wrap' }}>
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0}
          onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
          leftSection={<IconDownload />}
          variant="filled"
        >
          Exportar Todas
        </Button>
        <Button
          disabled={table.getRowModel().rows.length === 0}
          onClick={() => handleExportRows(table.getRowModel().rows)}
          leftSection={<IconDownload />}
          variant="filled"
        >
          Exportar Página
        </Button>
        <Button
          disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
          onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
          leftSection={<IconDownload />}
          variant="filled"
        >
          Exportar Selecionadas
        </Button>
      </Box>
    ),
    
    state: {
      isLoading: isLoadingVendas,
      isSaving: false,
      showAlertBanner: isLoadingVendasError,
      showProgressBars: isFetchingVendas,
    },
  });

  return <MantineReactTable table={table} />;
};

// Funções auxiliares de CRUD (Create, Read, Update, Delete)

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

// Função para obter produtos
function useGetVendas() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useQuery<Vendas[]>({
    queryKey: ['vendas'],
    queryFn: async () => {
      if (!token) {
        throw new Error('Token não encontrado');
      }
      const response = await axios.get(`${backendUrl}/vendas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    enabled: !!token,
    refetchOnWindowFocus: false,
  });
}

// Função para criar produto
function useCreateVendas() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useMutation({
    mutationFn: async (vendas: Omit<Vendas, 'id_venda'>) => {
      if (!token) {
        throw new Error('Token não encontrado');
      }
      const response = await axios.post(`${backendUrl}/vendas`, vendas, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });
}

// Função para atualizar Vendas
function useUpdateVendas() {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const jwtToken = localStorage.getItem('token');
      setToken(jwtToken);
    }
  }, []);

  return useMutation({
    mutationFn: async (vendas: Vendas) => {
      if (!token) {
        throw new Error('Token não encontrado');
      }
      await axios.put(`${backendUrl}/vendas/${vendas.id_venda}`, vendas, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });
}

// Função para deletar Vendas
function useDeleteVendas() {
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
const CadastroVendasWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <ModalsProvider>
      <Vendas />
    </ModalsProvider>
  </QueryClientProvider>
);

export default CadastroVendasWithProviders;

function handleExportRows(rows: MRT_Row<Vendas>[]): void {
  throw new Error('Função não implementada.');
}