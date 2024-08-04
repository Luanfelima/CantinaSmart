import { Container } from "@mantine/core";
import Layout from "../../componentes/Layout";
import TabelaEstoque from "../../componentes/formularios/TabelaEstoque";

function Estoque() {
    return (
        <Layout>
            <Container size='xl'>
                <TabelaEstoque />
            </Container>
        </Layout>
    )
}
export default Estoque;