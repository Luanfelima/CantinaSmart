import { Container } from "@mantine/core";
import Layout from "../../componentes/Layout";
import TabelaCategorias from "../../componentes/formularios/TabelaCategorias";

function Categorias() {
    return (
        <Layout>
            <Container size='xl'>
                <TabelaCategorias />
            </Container>
        </Layout>
    )
}

export default Categorias;