import React, { ReactNode } from 'react';
import { AppShell, Burger, Group, Autocomplete, Avatar, Button, NavLink } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import LogoClaro from './Logo';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <LogoClaro/>
          <Autocomplete
          placeholder="🔍 Pesquisa"
          data={[
            { group: 'Dashboard', items: ['Tela Inicial'] },
            { group: 'Unidades', items: ['Gerenciar estoque', 'Gerenciar fluxo de caixa', 'Cadastrar nova unidade'] },
            { group: 'Funcionários', items: ['Cadastrar funcionário'] },
            { group: 'Produtos', items: ['Cadastrar produto', 'Gerenciar produtos'] }
      ]}
    />
          <Button variant="transparent"><Avatar variant="light" radius="lg" size="lg" color="rgba(83, 130, 224, 1)" src="PerfilUsuario" /></Button>
        </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md" > 
        <NavLink href="/Dashboard/dashboard" label="Tela Inicial"/>
      <NavLink
        href="#required-for-focus"
        label="Unidades"
        childrenOffset={28}variant="subtle"
      >
        <NavLink href="/CadastroUnidadesInformacoes/CadastroUnidadesInformacoes" label="Cadastrar nova unidade" />
        <NavLink href="#required-for-focus" label="Gerenciar estoque" />
        <NavLink label="Gerenciar fluxo de caixa" href="#required-for-focus" />
        
      </NavLink>

      <NavLink href="/CadastroFuncionario/Funcionarios" label="Funcionários" />
      <NavLink href="/CadastroProduto/Produtos" label="Produto" />
      <NavLink href="/CadastroCategoria/Categorias" label="Categorias" />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default Layout;