import { BarChart } from '@mantine/charts';
import { data } from './Data';
import { Container, Title } from '@mantine/core';
import '@mantine/charts/styles.css';

function Grafico() {
    return (
      <Container size="responsive">
        <Title order={2}>
          Resumo de vendas
        </Title>
        <BarChart
      h={300}
      data={data}
      dataKey="month"
      series={[
        { name: 'Vendas', color: 'violet.3' },
        { name: 'Estoque', color: 'blue.3' },
        { name: 'Gastos', color: 'teal.3' },
      ]}
      tickLine="none"
      gridAxis="xy"
    />
      </Container>
    );
  }

export default Grafico;