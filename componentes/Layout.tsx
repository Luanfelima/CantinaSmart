//components/Layout.tsx - Feito para aparecer o menu lateral nas páginas
import React, { ReactNode } from 'react';
import { NavbarSimpleColored } from './NavbarSimpleColored';
import { Grid } from '@mantine/core';


interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
  <Grid>
    <Grid.Col span={3}><NavbarSimpleColored /></Grid.Col>
    <Grid.Col span="auto">{children}</Grid.Col>
  </Grid>
  );
};

export default Layout;