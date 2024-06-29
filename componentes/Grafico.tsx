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
        { name: 'Smartphones', color: 'violet.6' },
        { name: 'Laptops', color: 'blue.6' },
        { name: 'Tablets', color: 'teal.6' },
      ]}
      tickLine="none"
      gridAxis="xy"
    />
      </Container>
    );
  }

export default Grafico;