import sql from "mssql";

const config = {
  user: "shavi_SQLLogin_1",
  password: "nraq1gx3wq",
  server: "dbforttcs.mssql.somee.com",
  database: "dbforttcs",
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  port: 1433
};

let pool;

export async function connectDB() {
  if (!pool) {
    pool = await sql.connect(config);
  }
  return pool;
}

