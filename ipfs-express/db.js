import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: "web3user",
  host: "localhost",
  database: "web3university",
  password: "securepassword",
  port: 5432,
});

export default pool;
