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
import db, { testConnection, createTableIfNotExists } from './db.js';

export const insertEmployee = async (employee) => {
  try {
    const { Name, Lastname, Lastname2, Email, Charge, City, Salary, Age } = employee;
    const insertQuery = `
      INSERT INTO employees (Name, Lastname, Lastname2, Email, Charge, City, Salary, Age)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [Name, Lastname, Lastname2, Email, Charge, City, Salary, Age];
    const [result] = await db.execute(insertQuery, params);
    return result;
  } catch (error) {
    console.error('Error insertando empleado:', error.message);
    throw error;
  }
};

export const getAllEmployees = async () => {
  try {
    console.log("Getting all employees from database");
    const [rows] = await db.execute('SELECT * FROM employees ORDER BY id DESC');
    console.log(`Found ${rows.length} employees`);
    return rows;
  } catch (error) {
    console.error('Error obteniendo empleados:', error.message);
    throw error;
  }
};

export const getEmployeeById = async (id) => {
  try {
    const [rows] = await db.execute('SELECT * FROM employees WHERE id = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error obteniendo empleado por ID:', error.message);
    throw error;
  }
};

export const updateEmployee = async (id, employee) => {
  try {
    const { Name, Lastname, Lastname2, Email, Charge, City, Salary, Age } = employee;
    const updateQuery = `
      UPDATE employees
      SET Name=?, Lastname=?, Lastname2=?, Email=?, Charge=?, City=?, Salary=?, Age=?
      WHERE id = ?
    `;
    const params = [Name, Lastname, Lastname2, Email, Charge, City, Salary, Age, id];
    const [result] = await db.execute(updateQuery, params);
    return result;
  } catch (error) {
    console.error('Error actualizando empleado:', error.message);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    const [result] = await db.execute('DELETE FROM employees WHERE id = ?', [id]);
    return result;
  } catch (error) {
    console.error('Error eliminando empleado:', error.message);
    throw error;
  }
};

// Cargar CSV y guardar filas (ruta en disco)
export const cargarCsv = (rutaCSV) => {
  return new Promise((resolve, reject) => {
    const inserted = [];
    let totalRows = 0;
    let successfulInserts = 0;
    
    console.log(`Iniciando carga de CSV: ${rutaCSV}`);
    
    fs.createReadStream(rutaCSV)
      .pipe(csv())
      .on('data', async (row) => {
        totalRows++;
        // Mapea campos según tu CSV (asegúrate que coincidan los nombres)
        const employee = {
          Name: row.Name || row.name || '',
          Lastname: row.Lastname || row.lastname || '',
          Lastname2: row.Lastname2 || row.lastname2 || '',
          Email: row.Email || row.email || '',
          Charge: row.Charge || row.charge || '',
          City: row.City || row.city || '',
          Salary: parseFloat(row.Salary || row.salary || 0),
          Age: parseInt(row.Age || row.age || 0)
        };
        
        try {
          const res = await insertEmployee(employee);
          inserted.push(res);
          successfulInserts++;
          console.log(`Empleado insertado: ${employee.Name} ${employee.Lastname}`);
        } catch (err) {
          console.error(`Error al insertar fila CSV (${employee.Name}):`, err.message);
        }
      })
      .on('end', () => {
        console.log(`CSV procesado: ${successfulInserts}/${totalRows} empleados insertados`);
        resolve(inserted);
      })
      .on('error', (err) => {
        console.error('Error leyendo CSV:', err.message);
        reject(err);
      });
  });
};

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  const connected = await testConnection();
  if (connected) {
    await createTableIfNotExists();
    return true;
  }
  return false;
};
