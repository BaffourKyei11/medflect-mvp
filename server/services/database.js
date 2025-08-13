const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { logger } = require('../utils/logger');

let db;

// Initialize database
const initializeDatabase = async () => {
  try {
    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'medflect.db');
    
    logger.info(`Initializing database at: ${dbPath}`);

    // Create database connection
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error('Error opening database:', err);
        throw err;
      }
      logger.success('Database connection established');
    });

    // Enable foreign keys
    await runQuery('PRAGMA foreign_keys = ON');
    
    // Create tables
    await createTables();
    
    // Insert initial data
    await insertInitialData();
    
    logger.success('Database initialization completed');
    
  } catch (error) {
    logger.errorWithContext(error, 'database_initialization');
    throw error;
  }
};

// Create all tables
const createTables = async () => {
  const tables = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'patient')),
      department TEXT,
      license_number TEXT,
      phone TEXT,
      is_active BOOLEAN DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Patients table
    `CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      mrn TEXT UNIQUE NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender TEXT CHECK (gender IN ('male', 'female', 'other')),
      phone TEXT,
      email TEXT,
      address TEXT,
      emergency_contact TEXT,
      emergency_phone TEXT,
      blood_type TEXT,
      allergies TEXT,
      medical_history TEXT,
      insurance_info TEXT,
      consent_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Encounters table
    `CREATE TABLE IF NOT EXISTS encounters (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      encounter_type TEXT NOT NULL CHECK (encounter_type IN ('admission', 'consultation', 'emergency', 'follow_up')),
      status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
      chief_complaint TEXT,
      diagnosis TEXT,
      treatment_plan TEXT,
      notes TEXT,
      admission_date DATETIME,
      discharge_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (doctor_id) REFERENCES users (id)
    )`,

    // Vital signs table
    `CREATE TABLE IF NOT EXISTS vital_signs (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      temperature REAL,
      blood_pressure_systolic INTEGER,
      blood_pressure_diastolic INTEGER,
      heart_rate INTEGER,
      respiratory_rate INTEGER,
      oxygen_saturation REAL,
      weight REAL,
      height REAL,
      bmi REAL,
      pain_scale INTEGER CHECK (pain_scale >= 0 AND pain_scale <= 10),
      recorded_by TEXT NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (encounter_id) REFERENCES encounters (id),
      FOREIGN KEY (recorded_by) REFERENCES users (id)
    )`,

    // Medications table
    `CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      medication_name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      route TEXT CHECK (route IN ('oral', 'intravenous', 'intramuscular', 'subcutaneous', 'topical')),
      start_date DATE NOT NULL,
      end_date DATE,
      prescribed_by TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'completed')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (encounter_id) REFERENCES encounters (id),
      FOREIGN KEY (prescribed_by) REFERENCES users (id)
    )`,

    // Lab results table
    `CREATE TABLE IF NOT EXISTS lab_results (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      test_name TEXT NOT NULL,
      test_category TEXT,
      result_value TEXT,
      unit TEXT,
      reference_range TEXT,
      abnormal_flag TEXT CHECK (abnormal_flag IN ('normal', 'high', 'low', 'critical')),
      ordered_by TEXT NOT NULL,
      ordered_date DATETIME NOT NULL,
      result_date DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (encounter_id) REFERENCES encounters (id),
      FOREIGN KEY (ordered_by) REFERENCES users (id)
    )`,

    // AI summaries table
    `CREATE TABLE IF NOT EXISTS ai_summaries (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      encounter_id TEXT,
      summary_type TEXT NOT NULL CHECK (summary_type IN ('clinical', 'discharge', 'handoff', 'progress')),
      content TEXT NOT NULL,
      generated_by TEXT NOT NULL,
      model_version TEXT,
      confidence_score REAL,
      reviewed_by TEXT,
      reviewed_at DATETIME,
      is_approved BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (encounter_id) REFERENCES encounters (id),
      FOREIGN KEY (generated_by) REFERENCES users (id),
      FOREIGN KEY (reviewed_by) REFERENCES users (id)
    )`,

    // Blockchain audit table
    `CREATE TABLE IF NOT EXISTS blockchain_audit (
      id TEXT PRIMARY KEY,
      transaction_hash TEXT,
      action TEXT NOT NULL,
      user_id TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT NOT NULL,
      consent_token TEXT,
      metadata TEXT,
      block_number INTEGER,
      gas_used INTEGER,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      confirmed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,

    // Sync status table
    `CREATE TABLE IF NOT EXISTS sync_status (
      id TEXT PRIMARY KEY,
      table_name TEXT NOT NULL,
      record_id TEXT NOT NULL,
      operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
      sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed')),
      retry_count INTEGER DEFAULT 0,
      last_sync_attempt DATETIME,
      error_message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Appointments table
    `CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      doctor_id TEXT NOT NULL,
      appointment_type TEXT NOT NULL CHECK (appointment_type IN ('consultation', 'follow_up', 'emergency', 'procedure')),
      scheduled_date DATETIME NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (doctor_id) REFERENCES users (id)
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('appointment', 'lab_result', 'medication', 'alert', 'reminder')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN DEFAULT 0,
      priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
      scheduled_for DATETIME,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`,

    // AI Interactions table for audit logging
    `CREATE TABLE IF NOT EXISTS ai_interactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      patient_id TEXT,
      encounter_id TEXT,
      action TEXT NOT NULL CHECK (action IN ('clinical_summary', 'clinical_decision_support', 'patient_communication', 'medication_interaction_check', 'test')),
      input_length INTEGER NOT NULL,
      output_length INTEGER NOT NULL,
      tokens INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      confidence_score REAL,
      model TEXT,
      security_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (encounter_id) REFERENCES encounters (id)
    )`,

    // User-Patient Assignments table for access control
    `CREATE TABLE IF NOT EXISTS user_patient_assignments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      patient_id TEXT NOT NULL,
      assignment_type TEXT NOT NULL CHECK (assignment_type IN ('primary', 'secondary', 'consultant')),
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      assigned_by TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (patient_id) REFERENCES patients (id),
      FOREIGN KEY (assigned_by) REFERENCES users (id),
      UNIQUE(user_id, patient_id)
    )`
  ];

  for (const table of tables) {
    await runQuery(table);
  }

  logger.success('All tables created successfully');
};

// Insert initial data
const insertInitialData = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await getQuery('SELECT id FROM users WHERE email = ?', ['admin@medflect.ai']);
    
    if (!adminExists) {
      // Create default admin user
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      await runQuery(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, department)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        'admin-001',
        'admin@medflect.ai',
        passwordHash,
        'System',
        'Administrator',
        'admin',
        'IT'
      ]);

      logger.success('Default admin user created');
    }

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_patients_mrn ON patients(mrn)',
      'CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON encounters(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_encounters_doctor_id ON encounters(doctor_id)',
      'CREATE INDEX IF NOT EXISTS idx_vital_signs_patient_id ON vital_signs(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_medications_patient_id ON medications(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_lab_results_patient_id ON lab_results(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_ai_summaries_patient_id ON ai_summaries(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_blockchain_audit_user_id ON blockchain_audit(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sync_status_table_record ON sync_status(table_name, record_id)',
      'CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_id ON ai_interactions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_ai_interactions_patient_id ON ai_interactions(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_ai_interactions_action ON ai_interactions(action)',
      'CREATE INDEX IF NOT EXISTS idx_ai_interactions_created_at ON ai_interactions(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_user_patient_assignments_user_id ON user_patient_assignments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_patient_assignments_patient_id ON user_patient_assignments(patient_id)',
      'CREATE INDEX IF NOT EXISTS idx_user_patient_assignments_active ON user_patient_assignments(is_active)'
    ];

    for (const index of indexes) {
      await runQuery(index);
    }

    logger.success('Database indexes created');
    
  } catch (error) {
    logger.errorWithContext(error, 'initial_data_insertion');
    throw error;
  }
};

// Helper functions for database operations
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// Close database connection
const closeDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          logger.info('Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
};

// Get database instance
const getDatabase = () => {
  return db;
};

// Backup database
const backupDatabase = async (backupPath) => {
  try {
    const backupDb = new sqlite3.Database(backupPath);
    
    return new Promise((resolve, reject) => {
      db.backup(backupDb, (err) => {
        if (err) {
          reject(err);
        } else {
          backupDb.close();
          logger.success(`Database backed up to: ${backupPath}`);
          resolve();
        }
      });
    });
  } catch (error) {
    logger.errorWithContext(error, 'database_backup');
    throw error;
  }
};

module.exports = {
  initializeDatabase,
  runQuery,
  getQuery,
  allQuery,
  closeDatabase,
  getDatabase,
  backupDatabase
}; 