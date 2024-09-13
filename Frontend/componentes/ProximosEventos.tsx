import React from 'react';
import { Stack, Text, Button } from '@mantine/core';

const Eventos = () => {
  return(
    <Stack
    h={300}
    bg="var(--mantine-color-body)"
    justify="space-around"
    gap="xl"
    >
      <Text fz='lg' ta='center' fw='700'>
        Próximos eventos
      </Text>
      <Text ta='center' c="dimmed">Nenhum evento agendado</Text>
    </Stack>
  );
};

export default Eventos;
