import { Container } from "@mantine/core";
import Layout from "../../componentes/Layout";
import TabelaCadastroGestor from "../../componentes/formularios/TabelaCadastroGestor";

function Gestor() {
    return (
        <Layout>
            <Container size='xl'>
                <TabelaCadastroGestor />
            </Container>
        </Layout>
    )
}
export default Gestor;