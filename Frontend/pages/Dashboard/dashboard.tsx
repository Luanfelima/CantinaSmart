import { Container } from '@mantine/core';
import Layout from '../../componentes/Layout';
import TableauEmbed from '../../componentes/tableauDashboard';


export function LeadGrid() {
  return (
    <Layout>
          <Container fluid>
            <TableauEmbed />
          </Container>
    </Layout>
  );
}

export default LeadGrid;  