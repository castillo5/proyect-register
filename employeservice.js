import fs from 'fs';
import csv from 'csv-parser';
import db from './db.js';

export const cargarCVS = (rutaCSV) => {
    fs.createReadStream(rutaCSV)
    .pipe(csv())
    .on('data', (row)=>{
        const {Name,Lastname,Lastname2,Email,Charge,City,Salary,Age} = row;

        const insertquery = `
            INSERT INTO employees(Name,Lastname,Lastname2,Email,Charge,City,Salary,Age) VALUES(?,?,?,?,?,?,?)         
        `;
        db.QUERY(
            insertquery,
            [Name,Lastname,Lastname2,Email,Charge,City,Salary,Age], (err,result)=>{
                if (err){
                    console.error('error al insertar fila',err.message)
                }
                console.log('se logro insertar con exito')

            }
        )

    });
}