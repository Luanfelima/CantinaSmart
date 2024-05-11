import React, { useState } from 'react';
import { Group, Code } from '@mantine/core';
import {
  IconBellRinging,
  IconFingerprint,
  IconKey,
  IconReceipt2,
  IconSwitchHorizontal,
  IconLogout,
  IconList,
} from '@tabler/icons-react';
import classes from './NavbarSimpleColored.module.css';

const data = [
  { link: '', label: 'Página inicial', icon: IconBellRinging },
  { link: '', label: 'Produtos', icon: IconReceipt2 },
  { link: '', label: 'Categorias', icon: IconList },
  { link: '', label: 'Funcionários', icon: IconFingerprint },
  { link: '', label: 'Unidades', icon: IconKey },
];

export function NavbarSimpleColored() {
  const [active, setActive] = useState('Billing');

  const links = data.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      href={item.link}
      key={item.label}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <span>CantinaSmart</span>
          <Code fw={700} className={classes.version}>
            v0.0.0,2
          </Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSwitchHorizontal className={classes.linkIcon} stroke={1.5} />
          <span>Configurações</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Sair</span>
        </a>
      </div>
    </nav>
  );
}