import { Container } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import '@mantine/dates/styles.css'

function Calendario() {
  return (
    <Container size='responsive'>
      <Calendar />
    </Container>
  )
}

export default Calendario;