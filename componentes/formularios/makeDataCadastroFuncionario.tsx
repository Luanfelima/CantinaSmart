export type User = {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    cargo: string;
    senha: string;
  };
  
  export const fakeData: User[] = [
    {
      id: '9s41rp',
      nome: 'Fernando Rigon',
      email: 'fernando.Rigon@gmail.com',
      telefone: '(11) 94845-4582',
      cpf: '500.524.200-85',
      cargo: 'Gestor(a)',
      senha: '*****',
    },
    {
      id: '4fds4a',
      nome: 'Joice Maria Pereira',
      email: 'joicem.Per@gmail.com',
      telefone: '(11) 96852-8541',
      cpf: '698.632.500-41',
      cargo: 'Funcionário(a)',
      senha: '*******',
    },
    {
      id: '123asb',
      nome: 'Caio Marcone Junior',
      email: 'marconecaio.@gmail.com',
      telefone: '(11) 91254-3698',
      cpf: '001.200.300-80',
      cargo: 'Funcionário(a)',
      senha: '******',
    },
    {
      id: '999hhh',
      nome: 'Jonathan Oliveira de Castro',
      email: 'jholivecastro@gmail.com',
      telefone: '(11) 99552-7845',
      cpf: '006.980.120-74',
      cargo: 'Funcionário(a)',
      senha: '*****',
    },
    {
        id: '9s69gi',
        nome: 'Catarina de Paula',
        email: 'paulacat@gmail.com',
        telefone: '(11) 95452-9764',
        cpf: '123.468.975-11',
        cargo: 'Funcionário(a)',
        senha: '********',
      },
  ];

  export const CargosPreDefinidos = [
    'Gestor(a)',
    'Funcionário(a)',
  ]