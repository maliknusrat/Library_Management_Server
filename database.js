var mysql = require('mysql');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '190144Mnn#',
    database: 'libary_database'
  });

  module.exports = db;