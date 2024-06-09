import { LineChart } from '@mantine/charts';
import { dados } from './Dados';
import { Container } from '@mantine/core';
import '@mantine/charts/styles.css';

function Grafico() {
    return (
      <Container size='responsive'>
        <LineChart
        h={300}
        data={dados}
        dataKey="date"
        yAxisProps={{ domain: [0, 100] }}
        referenceLines={[
          { y: 40, label: 'Média de vendas', color: 'red.6' },
          { x: 'Mar 25', label: 'Relatório' },
        ]}
        series={[{ name: 'Maças', color: 'indigo.6' }]}
      />
      </Container>
    );
  }

export default Grafico;