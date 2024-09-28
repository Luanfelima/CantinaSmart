import { Container } from "@mantine/core";
import Layout from "../../componentes/Layout";
import TabelaCadastroFuncionario from "../../componentes/formularios/TabelaCadastroFuncionario";

function Funcionarios() {
    return (
        <Layout>
            <Container size='xl'>
                <TabelaCadastroFuncionario />
            </Container>
        </Layout>
    )
}

export default Funcionarios;