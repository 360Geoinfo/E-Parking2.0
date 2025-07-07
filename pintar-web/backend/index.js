import express from 'express';
import cors from 'cors';
import oracledb from 'oracledb';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.options('*', cors());

app.use(express.json());

async function registerUser(email, password) {
  let connection;
  try {
    connection = await oracledb.getConnection({
      user: 'SYSTEM',
      password: '360geoinfo',
      connectionString: 'localhost:1521/XEPDB1'
    });

    await connection.execute(
      `INSERT INTO users (email, password) VALUES (:email, :password)`,
      [email, password],
      { autoCommit: true }
    );

    return { success: true, message: 'User registered' };
  } catch (err) {
    console.error('DB error:', err);
    return { success: false, error: err.message };
  } finally {
    if (connection) {
      try { await connection.close(); } catch {}
    }
  }
}

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

  const result = await registerUser(email, password);

  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(500).json({ error: result.error });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
