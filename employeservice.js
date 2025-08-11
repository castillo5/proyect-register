// import fs from 'fs';
// import csv from 'csv-parser';
// import db from './db.js';

// export const cargarCVS = (rutaCSV) => {
//     fs.createReadStream(rutaCSV)
//     .pipe(csv())
//     .on('data', (row)=>{
//         const {Name,Lastname,Lastname2,Email,Charge,City,Salary,Age} = row;

//         const insertquery = `
//             INSERT INTO employees(Name,Lastname,Lastname2,Email,Charge,City,Salary,Age) VALUES(?,?,?,?,?,?,?)         
//         `;
//         db.QUERY(
//             insertquery,
//             [Name,Lastname,Lastname2,Email,Charge,City,Salary,Age], (err,result)=>{
//                 if (err){
//                     console.error('error al insertar fila',err.message)
//                 }
//                 console.log('se logro insertar con exito')

//             }
//         )

//     });
// }

// employeservice.js
// employeservice.js
import fs from 'fs';
import csv from 'csv-parser';
import db from './db.js';

export const insertEmployee = async (employee) => {
  const { Name, Lastname, Lastname2, Email, Charge, City, Salary, Age } = employee;
  const insertQuery = `
    INSERT INTO employees (Name, Lastname, Lastname2, Email, Charge, City, Salary, Age)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [Name, Lastname, Lastname2, Email, Charge, City, Salary, Age];
  const [result] = await db.execute(insertQuery, params);
  return result;
};

export const getAllEmployees = async () => {
  console.log("Getting all employees from database");
  const [rows] = await db.execute('SELECT * FROM employees ORDER BY id DESC');
  return rows;
};

export const getEmployeeById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [id]);
  return rows[0];
};

export const updateEmployee = async (id, employee) => {
  const { Name, Lastname, Lastname2, Email, Charge, City, Salary, Age } = employee;
  const updateQuery = `
    UPDATE employees
    SET Name=?, Lastname=?, Lastname2=?, Email=?, Charge=?, City=?, Salary=?, Age=?
    WHERE id = ?
  `;
  const params = [Name, Lastname, Lastname2, Email, Charge, City, Salary, Age, id];
  const [result] = await db.execute(updateQuery, params);
  return result;
};

export const deleteEmployee = async (id) => {
  const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
  return result;
};

// Cargar CSV y guardar filas (ruta en disco)
export const cargarCsv = (rutaCSV) => {
  return new Promise((resolve, reject) => {
    const inserted = [];
    fs.createReadStream(rutaCSV)
      .pipe(csv())
      .on('data', async (row) => {
        // Mapea campos según tu CSV (asegúrate que coincidan los nombres)
        const employee = {
          Name: row.Name || row.name || '',
          Lastname: row.Lastname || row.lastname || '',
          Lastname2: row.Lastname2 || row.lastname2 || '',
          Email: row.Email || row.email || '',
          Charge: row.Charge || row.charge || '',
          City: row.City || row.city || '',
          Salary: row.Salary || row.salary || 0,
          Age: row.Age || row.age || 0
        };
        try {
          const res = await insertEmployee(employee);
          inserted.push(res);
        } catch (err) {
          console.error('Error al insertar fila CSV:', err.message);
        }
      })
      .on('end', () => resolve(inserted))
      .on('error', (err) => reject(err));
  });
};
