import React, { useMemo } from 'react';
import { MantineReactTable, MRT_ColumnDef } from 'mantine-react-table';
import { Title, Text, Alert } from '@mantine/core';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-react-table/styles.css';

// Define o tipo Estoque
type Estoque = {
  nome: string;
  quantidade: number;
  preco: number;
};

// Função para buscar dados do estoque
async function fetchEstoque(): Promise<Estoque[]> {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/estoque`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    console.info('[Frontend] Estoque recebido do backend:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[Frontend] Erro durante a requisição ao backend:', error);
    if (error.response) {
      console.error('[Frontend] Detalhes do erro:', error.response.data);
    }
    throw error;
  }
}

const TabelaEstoque = () => {
  // Hook do React Query para buscar os dados do estoque
  const { data: estoque, isLoading, isError, error } = useQuery<Estoque[]>({
    queryKey: ['estoque'],
    queryFn: fetchEstoque,
    refetchOnWindowFocus: false,
  });

  // Definição das colunas da tabela
  const columns = useMemo<MRT_ColumnDef<Estoque>[]>(
    () => [
      { accessorKey: 'nome', header: 'Nome do Produto' },
      { accessorKey: 'quantidade', header: 'Quantidade' },
      {
        accessorKey: 'preco',
        header: 'Preço',
        Cell: ({ cell }) => `R$ ${cell.getValue<number>().toFixed(2)}`,
      },
    ],
    [],
  );

  return (
    <div>
      <Title order={2} mb="md">
        Estoque
      </Title>

      {/* Exibe um alerta em caso de erro */}
      {isError && (
        <Alert title="Erro" color="red">
          <Text>{`Erro ao carregar o estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`}</Text>
        </Alert>
      )}

      {/* Tabela do MantineReactTable */}
      <MantineReactTable
        columns={columns}
        data={estoque || []}
        state={{ isLoading }}
        enablePagination={false}
        mantineTableContainerProps={{ style: { minHeight: '300px' } }}
      />
    </div>
  );
};

// Encapsula o QueryClientProvider no mesmo arquivo
const queryClient = new QueryClient();

const EstoqueWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <TabelaEstoque />
  </QueryClientProvider>
);

export default EstoqueWithProviders;