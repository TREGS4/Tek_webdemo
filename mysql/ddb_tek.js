const mysql = require('mysql2');

const serverip = "localhost";
const username = "tek";
const password = "1234";
const database = "Tek";


const connection = mysql.createConnection({
   host: serverip,
   user: username,
   password: password,
   database: database
 });


module.exports = connection;