import React, { useState } from 'react';
import { Group, Code } from '@mantine/core';
import Link from 'next/link';
import {
  //Aqui coloque todos os icons e dps coloque eles no icon abaixo      Pode olhar neste site para buscar icon: https://tabler.io/icons -- Size 24 e Stroke 2
  IconHome,
  IconFingerprint,
  IconReceipt2,
  IconSettings,
  IconLogout,
  IconList,
  IconBuildingCommunity,
} from '@tabler/icons-react';
import classes from './NavbarSimpleColored.module.css';

const data = [
  { link: '', label: 'Página inicial', icon: IconHome }, //icons ficam aqui e os links tbm
  { link: '', label: 'Produtos', icon: IconReceipt2 },
  { link: '', label: 'Categorias', icon: IconList },
  { link: '', label: 'Funcionários', icon: IconFingerprint },
  { link: '/GerenciamentoCadastroUnidades/GerenciamentoCadastroUnidades', label: 'Unidades', icon: IconBuildingCommunity },
];

export function NavbarSimpleColored() {
  const [active, setActive] = useState('Página inicial');

  const links = data.map((item) => (
    <a // Usando a tag <a> para criar links clicáveis
      href={item.link}
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      onClick={() => setActive(item.label)}
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
            v0.0.1
          </Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSettings className={classes.linkIcon} stroke={1.5} />
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