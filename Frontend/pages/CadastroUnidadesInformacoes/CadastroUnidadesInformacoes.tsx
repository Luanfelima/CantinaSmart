import { Container } from "@mantine/core";
import Layout from "../../componentes/Layout";
import TabelaProduto from "../../componentes/formularios/TabelaCadastroUnidade";

function CadastroUnidadesInformacoes() {
    return (
        <Layout>
            <Container size='xl'>
                <TabelaProduto />
            </Container>
        </Layout>
    )
}

export default CadastroUnidadesInformacoes;