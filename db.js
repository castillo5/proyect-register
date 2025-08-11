// import mysql from 'mysql2';

// const db = mysql.createconnection({
//     host: 'localhost',
//     user: 'root',   
//     password: 'Jecg050505*',
//     database: 'postobon_01'
// });

// db.connet(err =>{
//     if(err) {
//         console.log('Error connecting to the database', err);
//         return;
//     }
//     console.log('conected to the database');
// });

// export default db;

// db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Jecg050505*',
  database: 'postobon_01',
  waitForConnections: true,
  connectionLimit: 10
});

export default pool;
