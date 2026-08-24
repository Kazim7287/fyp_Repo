require("dotenv").config();

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  ssl: {
    rejectUnauthorized: false
  }
});

const createSuperAdmin = async () => {
  try {
    const name = process.env.SUPER_ADMIN_NAME;
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;

    if (!name || !email || !password) {
      throw new Error(
        "SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are required"
      );
    }

    if (password.length < 12) {
      throw new Error(
        "Super Admin password must be at least 12 characters"
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await pool.query(
      `
      SELECT id, role
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      throw new Error(
        `User with email ${normalizedEmail} already exists`
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        email,
        role,
        is_active,
        created_at
      `,
      [
        name.trim(),
        normalizedEmail,
        passwordHash,
        "super_admin",
        true
      ]
    );

    console.log("\nSuper Admin created successfully.\n");

    console.table(result.rows[0]);

  } catch (error) {
    console.error("\nFailed to create Super Admin:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

createSuperAdmin();