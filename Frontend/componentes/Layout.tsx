import React, { ReactNode } from 'react';
import { AppShell, Burger, Group, NavLink, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import LogoClaro from './Logo';

interface LayoutProps {
  children: ReactNode;
}

const data = [
  { label: '🏠 Página inicial', link: '/Dashboard/dashboard' },
  { label: '🏬 Unidades', link: '/CadastroUnidadesInformacoes/CadastroUnidadesInformacoes' },
  { label: '💼 Funcionários', link: '/CadastroFuncionario/Funcionarios' },
  { label: '🥦 Produtos', link: '/CadastroProduto/Produtos' },
  { label: '📊 Estoque', link: '/CadastroEstoque/Estoque' },
  { label: '💲 Vendas', link: '/Vendas/Vendas' },
  { label: '📋 Categorias', link: '/CadastroCategoria/Categorias' },
];

export const NavbarLeft = () => {

  return (

    <Stack h={1000} w={280} ff={"sans-serif"} align='stretch' justify='space-between' gap={'xl'}>
      
      <div>
        {data.map((item) => (
          <NavLink
          key={item.label}
          href={item.link}
          label={<span style={{ fontSize: '1.0 rem' }}>{item.label}</span>}
          variant="subtle"
          active
        />
        ))}
      </div>
      
      <div>
      <NavLink
        href="/FormularioLogin/login"
        label={<span style={{ fontSize: '1.0 rem' }}>❌ Sair</span>}
        variant="subtle"
        active
        color='red'
        />
      </div>
    </Stack>
  );
};

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
          <LogoClaro />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavbarLeft />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
};

export default Layout;