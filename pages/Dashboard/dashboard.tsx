import { Grid } from '@mantine/core';
import Layout from '../../componentes/Layout';
import Grafico from '../../componentes/Grafico';
import ListaTarefas from '../../componentes/Tarefas';
import Calendario from '../../componentes/Calendario';
import InfoUsuario from '../../componentes/IndicadorUsuarioAtivo';
import Eventos from '../../componentes/ProximosEventos';

export function LeadGrid() {
  return (
    <Layout>
          <Grid grow gutter="xl">
            <Grid.Col span={12}></Grid.Col>
            <Grid.Col span={4}><ListaTarefas /></Grid.Col>
            <Grid.Col span={2} offset={4}><InfoUsuario /></Grid.Col>
            <Grid.Col span={2} offset={9}><Calendario /></Grid.Col>
            <Grid.Col span={8}><Grafico /></Grid.Col>
            <Grid.Col span={2}><Eventos /></Grid.Col>
          </Grid>
    </Layout>
  );
}

export default LeadGrid;

//IMPORTANTE: Sobra espaço em branco no fim da página pelo tamanho do navbar, que deveria também ser responsivo; ajustar depois 