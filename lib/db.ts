import mysql from "mysql2/promise"

const pool = mysql.createPool({
  host: "96.30.196.175",
  user: "app_task",
  password: "FCkbGGv-DHh",
  database: "focalize_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

export default pool
