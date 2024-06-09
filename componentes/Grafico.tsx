import { LineChart } from '@mantine/charts';
import { dados } from './Dados';

function Grafico() {
    return (
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
    );
  }

export default Grafico;