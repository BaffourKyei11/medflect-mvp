const { getQuery } = require('./database');

// Fetch a user by ID and normalize fields to match middleware expectations
async function getUserById(id) {
  if (!id) return null;
  const row = await getQuery(
    `SELECT id, email, first_name, last_name, role, department, license_number, phone, is_active, last_login
     FROM users WHERE id = ?`,
    [id]
  );
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    department: row.department,
    licenseNumber: row.license_number,
    phone: row.phone,
    isActive: !!row.is_active,
    lastLogin: row.last_login
  };
}

module.exports = { getUserById };
