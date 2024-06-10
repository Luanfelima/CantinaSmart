import { Text, Group } from '@mantine/core';
import { IconPhoneCall, IconAt } from '@tabler/icons-react';
import classes from './IndicadorUsuarioAtivo.module.css';
import { Skeleton } from '@mantine/core';

export function InfoUsuario() {
  return (
    <div>
      <Group wrap="nowrap">
        <Skeleton height={75} circle mb="xl" />
        <div>
          <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            Gestor
          </Text>

          <Text fz="lg" fw={500} className={classes.name}>
            Lucca Mrachna
          </Text>

          <Group wrap="nowrap" gap={10} mt={3}>
            <IconAt stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              email@provedor.com
            </Text>
          </Group>

          <Group wrap="nowrap" gap={10} mt={5}>
            <IconPhoneCall stroke={1.5} size="1rem" className={classes.icon} />
            <Text fz="xs" c="dimmed">
              +55 (11) 91234-5678
            </Text>
          </Group>
        </div>
      </Group>
    </div>
  );
}

export default InfoUsuario;