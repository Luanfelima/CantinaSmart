const bcrypt = require('bcrypt');

const senhaInserida = '12345678p';
const hashNoBanco = '$2b$10$jlTX/0bDDLEUsnj94el2m.pgnz8rQILjqr8TZqgGYYA.dJOk.g0G2';

bcrypt.compare(senhaInserida, hashNoBanco, function(err, result) {
    if (result) {
        console.log('Senha correta!');
    } else {
        console.log('Senha incorreta!');
    }
});