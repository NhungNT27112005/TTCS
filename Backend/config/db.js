import dotenv from 'dotenv';
import mssql from 'mssql';
import sql from 'mssql';
dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  port: parseInt(process.env.DB_PORT) 
};

let pool;

export async function connectDB() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

