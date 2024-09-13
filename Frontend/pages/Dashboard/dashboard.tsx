import { Grid } from '@mantine/core';
import Layout from '../../componentes/Layout';
import Grafico from '../../componentes/Grafico';
import ListaTarefas from '../../componentes/Tarefas';
import Calendario from '../../componentes/Calendario';

export function LeadGrid() {
  return (
    <Layout>
          <Grid grow gutter="xl">
            <Grid.Col span={4}><ListaTarefas /></Grid.Col>
            <Grid.Col span={2} offset={3}><Calendario /></Grid.Col>
            <Grid.Col span={12}></Grid.Col>
            <Grid.Col span={12}></Grid.Col>
            <Grid.Col span={8}><Grafico /></Grid.Col>
            <Grid.Col span={3}></Grid.Col>
          </Grid>
    </Layout>
  );
}

export default LeadGrid;