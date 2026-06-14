const dns = require('dns').promises;

dns.lookup('google.com')
  .then(console.log)
  .catch(console.error);