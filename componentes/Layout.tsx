//components/Layout.tsx - Feito para aparecer o menu lateral nas páginas
import React, { ReactNode } from 'react';
import { NavbarSimpleColored } from './NavbarSimpleColored';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <NavbarSimpleColored />
      <div>{children}</div>
    </div>
  );
};

export default Layout;