import { useState } from 'react';
import { Checkbox, Combobox, Group, TextInput, useCombobox } from '@mantine/core';
import classes from './Tarefas.module.css';
import { Container } from '@mantine/core';
import { Title } from '@mantine/core';
import { Space } from '@mantine/core';

const groceries = ['📄 Revisão dos itens em falta', '📄 Verificação do inventário', '📄 Realizar novas compras', '📄 Balanço', '📄 Adicionar novos funcionários'];

export function ListaTarefas() {
  const combobox = useCombobox();

  const [value, setValue] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const handleValueSelect = (val: string) =>
    setValue((current) =>
      current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
    );

  const options = groceries
    .filter((item) => item.toLowerCase().includes(search.toLowerCase().trim()))
    .map((item) => (
      <Combobox.Option
        value={item}
        key={item}
        active={value.includes(item)}
        onMouseOver={() => combobox.resetSelectedOption()}
      >
        <Group gap="sm">
          <Checkbox
            checked={value.includes(item)}
            onChange={() => {}}
            aria-hidden
            tabIndex={-1}
            style={{ pointerEvents: 'none' }}
          />
          <span>{item}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Container size='responsive'>
      <Title order={2}>
        5 tarefas ativas
      </Title>
      <Space h="xs" />
      <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
        <Combobox.EventsTarget>
        <TextInput
        placeholder="Pesquisar tarefas"
        classNames={{ input: classes.input }}
        value={search}
        onChange={(event) => {
          setSearch(event.currentTarget.value);
          combobox.updateSelectedOptionIndex();
        }}
      />
      </Combobox.EventsTarget>

     <div className={classes.list}>
      <Combobox.Options>
        {options.length > 0 ? options : <Combobox.Empty>Nenhum resultado</Combobox.Empty>}
      </Combobox.Options>
      </div>
    </Combobox>
  </Container>      
  );
}

export default ListaTarefas;