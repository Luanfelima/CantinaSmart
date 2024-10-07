const bcrypt = require('bcrypt');

const senha = '125';
bcrypt.hash(senha, 10, (err, hash) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Novo hash:', hash);
  }
});