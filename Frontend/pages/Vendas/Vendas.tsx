import { Container } from "@mantine/core";
import Layout from "../../componentes/Layout";
import CadastroVendasWithProviders from "../../componentes/formularios/Vendas";

function Vendas() {
    return (
        <Layout>
            <Container size='xl'>
                <CadastroVendasWithProviders />
            </Container>
        </Layout>
    )
}

export default Vendas;