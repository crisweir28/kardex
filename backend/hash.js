// hash.js
const bcrypt = require('bcryptjs');
bcrypt.hash('pass123', 10).then(hash => console.log(hash));