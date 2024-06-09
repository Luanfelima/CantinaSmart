import React, { ReactNode } from 'react';
import { NavbarSimpleColored } from './NavbarSimpleColored';
import { Container, Grid } from '@mantine/core';


interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
  <Grid grow gutter="xs">
    <Grid.Col span={2}><NavbarSimpleColored /></Grid.Col>
    <Grid.Col span={9}>{children}</Grid.Col>
  </Grid>
  );
};

export default Layout;