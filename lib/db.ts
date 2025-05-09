import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: "96.30.196.175",
  user: "app_task",
  password: "D56QbGpR90LA",
  database: "focalize_db",
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
})


// Função para obter uma conexão
export const getDbConnection = async () => {
  const connection = await pool.getConnection();
  return connection;
};

export default pool