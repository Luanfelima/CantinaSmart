export type User = {
    id: string;
    polo: string;
    nomeUnidade: string;
    cep: string;
    cidade: string;
    numero: number;
    complemento: string;
    rua: string;
    estado: string;
  };
  
  export const fakeData: User[] = [
    {
      id: '9s41rp',
      polo: 'Conceiçao',
      nomeUnidade: 'RangoBravo',
      cep: '09530-060',
      cidade: 'São Caetano do Sul',
      numero: 321,
      complemento: 'Proximo do Atacadão',
      rua: 'R. Conceição, Santo Antônio',
      estado: 'São Paulo',
    },
    {
      id: '4fds4a',
      polo: 'Barcelona',
      nomeUnidade: 'ComFomeNovamente',
      cep: '09550-051',
      cidade: 'São Caetano do Sul',
      numero: 3400,
      complemento: 'Ao lado a um monte de bar, um monte mesmo',
      rua: 'Av. Goiás, Barcelona',
      estado: 'São Paulo',
    },
    {
      id: '123asb',
      polo: 'Centro',
      nomeUnidade: 'MataFome',
      cep: '09521-160',
      cidade: 'São Caetano do Sul',
      numero: 50,
      complemento: 'Próximo da Estaçao de SCS',
      rua: 'R. Santo Antonio, Centro',
      estado: 'São Paulo',
    },
    {
      id: '999hhh',
      polo: 'São Paulo',
      nomeUnidade: 'FinalizaApetite',
      cep: '01327-000',
      cidade: 'São Paulo',
      numero: 681,
      complemento: '',
      rua: 'Rua Treze de Maio, Bela Vista',
      estado: 'São Paulo',
    },
    {
        id: '9s69gi',
        polo: 'Conceiçao',
        nomeUnidade: 'FomeSemFim',
        cep: '09530-060',
        cidade: 'São Caetano do Sul',
        numero: 321,
        complemento: 'Proximo do Atacadão',
        rua: 'R. Conceição, Santo Antônio',
        estado: 'São Paulo',
      },
  ];

  export const PolosPreDefinidos = [
    'Centro',
    'Conceiçao',
    'Barcelona',
    'São Paulo',
  ]