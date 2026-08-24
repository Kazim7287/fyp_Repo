const bcrypt = require("bcrypt");

const pool = require("../config/database");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken
} = require("../utils/jwt");

async function registerUser({
  name,
  email,
  password,
  role = "viewer"
}) {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    `,
    [normalizedEmail]
  );

  if (existingUser.rowCount > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const result = await pool.query(
    `
    INSERT INTO users
    (
      name,
      email,
      password_hash,
      role
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      name,
      email,
      role,
      is_active,
      created_at
    `,
    [
      name,
      normalizedEmail,
      passwordHash,
      role
    ]
  );

  return result.rows[0];
}


async function loginUser(email, password) {
  const normalizedEmail =
    email.toLowerCase().trim();

  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      is_active
    FROM users
    WHERE email = $1
    `,
    [normalizedEmail]
  );

  if (result.rowCount === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  if (!user.is_active) {
    throw new Error("User account is disabled");
  }

  const passwordValid =
    await bcrypt.compare(
      password,
      user.password_hash
    );

  if (!passwordValid) {
    throw new Error("Invalid email or password");
  }

  const accessToken =
    generateAccessToken(user);

  const refreshToken =
    generateRefreshToken(user);

  const tokenHash =
    hashToken(refreshToken);

  await pool.query(
    `
    INSERT INTO refresh_tokens
    (
      user_id,
      token_hash,
      expires_at
    )
    VALUES (
      $1,
      $2,
      NOW() + INTERVAL '7 days'
    )
    `,
    [
      user.id,
      tokenHash
    ]
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    accessToken,
    refreshToken
  };
}


async function revokeRefreshToken(
  refreshToken
) {
  const tokenHash =
    hashToken(refreshToken);

  await pool.query(
    `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = $1
    `,
    [tokenHash]
  );
}


module.exports = {
  registerUser,
  loginUser,
  revokeRefreshToken
};