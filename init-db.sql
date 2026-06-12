CREATE TYPE status_issuer AS ENUM ('Active', 'Inactive');
CREATE TYPE status_diploma AS ENUM ('Pending', 'Success', 'Failed');

CREATE TABLE tbl_admin (
  id_admin SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_issuer (
  id_issuer SERIAL PRIMARY KEY,
  created_by INT NOT NULL,
  university_name VARCHAR(150) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  wallet_address VARCHAR(42) NOT NULL,
  status status_issuer DEFAULT 'Active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_issuer_admin FOREIGN KEY (created_by) REFERENCES tbl_admin (id_admin) ON UPDATE CASCADE
);

CREATE TABLE tbl_diploma_record (
  id SERIAL PRIMARY KEY,
  diploma_hash VARCHAR(100) NOT NULL UNIQUE,
  tx_hash VARCHAR(100) UNIQUE,
  national_diploma_number VARCHAR(50),
  university_name VARCHAR(150),
  university_id_code VARCHAR(50),
  higher_education_program VARCHAR(100),
  study_program_name VARCHAR(100),
  study_program_id VARCHAR(50),
  student_name VARCHAR(150),
  place_of_birth VARCHAR(100),
  date_of_birth DATE,
  student_id VARCHAR(50),
  academic_degree VARCHAR(100),
  gpa DECIMAL(3,2),
  graduation_date DATE,
  issuance_location VARCHAR(100),
  issuance_date DATE,
  signatory_name VARCHAR(150),
  signatory_title VARCHAR(100),
  status status_diploma DEFAULT 'Pending',
  issued_by INT,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_diploma_issuer FOREIGN KEY (issued_by) REFERENCES tbl_issuer (id_issuer) ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO tbl_admin (username, password_hash, created_at) VALUES 
('Admin', '$2b$12$akh9Q1LpFP.Uw8Ln.hRcBeuo3P4NPiY/wZZbvr9d5NQiSKJhH6NgK', '2026-05-17 13:02:48');

INSERT INTO tbl_issuer (created_by, university_name, email, password_hash, wallet_address, status, created_at) VALUES 
(1, 'Test University', 'thunderboltyes8@gmail.com', '$2b$12$oDczAPt31/UYnzzxQbAnGuRtXKoebZMdQN9whLJT8SQZKIRzrWLl2', '0xAA7744feCC7EF5DE1c58aF01920F5EdED6879007', 'Active', '2026-05-17 13:57:07');

INSERT INTO tbl_diploma_record (diploma_hash, tx_hash, national_diploma_number, university_name, university_id_code, higher_education_program, study_program_name, study_program_id, student_name, place_of_birth, date_of_birth, student_id, academic_degree, gpa, graduation_date, issuance_location, issuance_date, signatory_name, signatory_title, status, issued_by, issued_at) VALUES 
('0x861c0db91f3df5e0c8b1b5d74dbcdf5eae27d2ece7fc97ef72fbf20010647424', NULL, '20240007DEF', '20240002DEF', '1001', 'Bachelor Degree', 'Civil Engineering', 'P002', 'Siti Aminah', 'Jakarta', '2003-11-20', '15020045', 'BEng – Bachelor of Engineering', 3.92, '2026-02-20', 'Jakarta', '2026-02-20', 'Prof. Dr. Hasan Mahmud', 'Rector', 'Pending', 1, '2026-05-17 12:33:23'),
('0x0f65aec7a94023ecde77927da6c6a3b380646bb87d35a5f886c1bc1344242b11', NULL, '20240008DEF', '20240002DEF', '1001', 'Bachelor Degree', 'Civil Engineering', 'P002', 'Siti Aminah', 'Jakarta', '2003-11-20', '15020045', 'BB – Bachelor of Business', 3.92, '2026-02-20', 'Jakarta', '2026-02-20', 'Prof. Dr. Hasan Mahmud', 'Rector', 'Pending', 1, '2026-05-17 12:56:42'),
('0xaba4b77a9a79ceb4679f2faa1acaa964f02eb06ba9cafca25022b96ffc4afeb9', '0xc3f484657965c2000c5d0ab6f371a9458d294257674a5a0fc31b3c8d98205f61', '20240010DEF', '20240002DEF', '1001', 'Bachelor Degree', 'Civil Engineering', 'P002', 'Siti Aminah', 'Jakarta', '2003-11-20', '15020045', 'BArch – Bachelor of Architecture', 3.92, '2026-02-20', 'Jakarta', '2026-02-20', 'Prof. Dr. Hasan Mahmud', 'Rector', 'Success', 1, '2026-05-17 13:15:49');
