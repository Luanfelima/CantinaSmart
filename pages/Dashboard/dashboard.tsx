import { Grid } from '@mantine/core';
import Layout from '../../componentes/Layout';
import Grafico from '../../componentes/Grafico';
import ListaTarefas from '../../componentes/Tarefas';
import Calendario from '../../componentes/Calendario';

export function LeadGrid() {
  return (
    <Layout>
        <Grid grow gutter="xs">
        <Grid.Col span={6}><ListaTarefas /></Grid.Col>
        <Grid.Col span={6}><Calendario /></Grid.Col>
        <Grid.Col span={12}><Grafico /></Grid.Col>
        </Grid>
    </Layout>
  );
}

export default LeadGrid;