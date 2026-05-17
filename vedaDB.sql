-- =========================================================
-- DATABASE SETUP
-- =========================================================

CREATE DATABASE IF NOT EXISTS veda
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE veda;

-- =========================================================
-- TABLE: ADMIN
-- =========================================================

CREATE TABLE tbl_admin (
    id_admin INT AUTO_INCREMENT PRIMARY KEY,
    
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- TABLE: ISSUER / UNIVERSITY
-- =========================================================

CREATE TABLE tbl_issuer (
    id_issuer INT AUTO_INCREMENT PRIMARY KEY,
    
    created_by INT NOT NULL,
    
    university_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_issuer_admin
        FOREIGN KEY (created_by)
        REFERENCES tbl_admin(id_admin)
        ON DELETE RESTRICT
        ON UPDATE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;


-- =========================================================
-- TABLE: DIPLOMA RECORD
-- =========================================================

CREATE TABLE tbl_diploma_record (
    id INT AUTO_INCREMENT PRIMARY KEY,

    -- Blockchain / Diploma Identity
    diploma_hash VARCHAR(100) NOT NULL UNIQUE,
    tx_hash VARCHAR(100) UNIQUE DEFAULT NULL,

    -- Diploma Information
    national_diploma_number VARCHAR(50) DEFAULT NULL,
    university_name VARCHAR(150) DEFAULT NULL,
    university_id_code VARCHAR(50) DEFAULT NULL,

    higher_education_program VARCHAR(100) DEFAULT NULL,

    study_program_name VARCHAR(100) DEFAULT NULL,
    study_program_id VARCHAR(50) DEFAULT NULL,

    -- Student Information
    student_name VARCHAR(150) DEFAULT NULL,
    place_of_birth VARCHAR(100) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,

    student_id VARCHAR(50) DEFAULT NULL,

    academic_degree VARCHAR(100) DEFAULT NULL,
    gpa DECIMAL(3,2) DEFAULT NULL,

    graduation_date DATE DEFAULT NULL,

    -- Issuance Information
    issuance_location VARCHAR(100) DEFAULT NULL,
    issuance_date DATE DEFAULT NULL,

    signatory_name VARCHAR(150) DEFAULT NULL,
    signatory_title VARCHAR(100) DEFAULT NULL,

    -- Blockchain Status
    status ENUM('Pending', 'Success', 'Failed')
        DEFAULT 'Pending',

    -- Relationship
    issued_by INT DEFAULT NULL,

    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_diploma_issuer
        FOREIGN KEY (issued_by)
        REFERENCES tbl_issuer(id_issuer)
        ON DELETE SET NULL
        ON UPDATE CASCADE

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;