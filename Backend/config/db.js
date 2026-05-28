import sql from "mssql";
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,

  port: Number( process.env.DB_PORT),

  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export const connectDB =
async () => {
   return await sql.connect(
     config
   );
};