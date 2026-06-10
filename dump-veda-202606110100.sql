-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: veda
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `tbl_admin`
--

DROP TABLE IF EXISTS `tbl_admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_admin` (
  `id_admin` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_admin`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_admin`
--

LOCK TABLES `tbl_admin` WRITE;
/*!40000 ALTER TABLE `tbl_admin` DISABLE KEYS */;
INSERT INTO `tbl_admin` VALUES (1,'Admin','$2b$12$akh9Q1LpFP.Uw8Ln.hRcBeuo3P4NPiY/wZZbvr9d5NQiSKJhH6NgK','2026-05-17 13:02:48');
/*!40000 ALTER TABLE `tbl_admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_diploma_record`
--

DROP TABLE IF EXISTS `tbl_diploma_record`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_diploma_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `diploma_hash` varchar(100) NOT NULL,
  `tx_hash` varchar(100) DEFAULT NULL,
  `national_diploma_number` varchar(50) DEFAULT NULL,
  `university_name` varchar(150) DEFAULT NULL,
  `university_id_code` varchar(50) DEFAULT NULL,
  `higher_education_program` varchar(100) DEFAULT NULL,
  `study_program_name` varchar(100) DEFAULT NULL,
  `study_program_id` varchar(50) DEFAULT NULL,
  `student_name` varchar(150) DEFAULT NULL,
  `place_of_birth` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `student_id` varchar(50) DEFAULT NULL,
  `academic_degree` varchar(100) DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `graduation_date` date DEFAULT NULL,
  `issuance_location` varchar(100) DEFAULT NULL,
  `issuance_date` date DEFAULT NULL,
  `signatory_name` varchar(150) DEFAULT NULL,
  `signatory_title` varchar(100) DEFAULT NULL,
  `status` enum('Pending','Success','Failed') DEFAULT 'Pending',
  `issued_by` int(11) DEFAULT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `diploma_hash` (`diploma_hash`),
  UNIQUE KEY `tx_hash` (`tx_hash`),
  KEY `fk_diploma_issuer` (`issued_by`),
  CONSTRAINT `fk_diploma_issuer` FOREIGN KEY (`issued_by`) REFERENCES `tbl_issuer` (`id_issuer`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_diploma_record`
--

LOCK TABLES `tbl_diploma_record` WRITE;
/*!40000 ALTER TABLE `tbl_diploma_record` DISABLE KEYS */;
INSERT INTO `tbl_diploma_record` VALUES (5,'0x861c0db91f3df5e0c8b1b5d74dbcdf5eae27d2ece7fc97ef72fbf20010647424',NULL,'20240007DEF','20240002DEF','1001','Bachelor Degree','Civil Engineering','P002','Siti Aminah','Jakarta','2003-11-20','15020045','BEng – Bachelor of Engineering',3.92,'2026-02-20','Jakarta','2026-02-20','Prof. Dr. Hasan Mahmud','Rector','Pending',3,'2026-05-17 12:33:23'),(6,'0x0f65aec7a94023ecde77927da6c6a3b380646bb87d35a5f886c1bc1344242b11',NULL,'20240008DEF','20240002DEF','1001','Bachelor Degree','Civil Engineering','P002','Siti Aminah','Jakarta','2003-11-20','15020045','BB – Bachelor of Business',3.92,'2026-02-20','Jakarta','2026-02-20','Prof. Dr. Hasan Mahmud','Rector','Pending',3,'2026-05-17 12:56:42'),(7,'0xaba4b77a9a79ceb4679f2faa1acaa964f02eb06ba9cafca25022b96ffc4afeb9','0xc3f484657965c2000c5d0ab6f371a9458d294257674a5a0fc31b3c8d98205f61','20240010DEF','20240002DEF','1001','Bachelor Degree','Civil Engineering','P002','Siti Aminah','Jakarta','2003-11-20','15020045','BArch – Bachelor of Architecture',3.92,'2026-02-20','Jakarta','2026-02-20','Prof. Dr. Hasan Mahmud','Rector','Success',3,'2026-05-17 13:15:49');
/*!40000 ALTER TABLE `tbl_diploma_record` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_issuer`
--

DROP TABLE IF EXISTS `tbl_issuer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tbl_issuer` (
  `id_issuer` int(11) NOT NULL AUTO_INCREMENT,
  `created_by` int(11) NOT NULL,
  `university_name` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `wallet_address` varchar(42) NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_issuer`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_issuer_admin` (`created_by`),
  CONSTRAINT `fk_issuer_admin` FOREIGN KEY (`created_by`) REFERENCES `tbl_admin` (`id_admin`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_issuer`
--

LOCK TABLES `tbl_issuer` WRITE;
/*!40000 ALTER TABLE `tbl_issuer` DISABLE KEYS */;
INSERT INTO `tbl_issuer` VALUES (3,1,'Test University','thunderboltyes8@gmail.com','$2b$12$oDczAPt31/UYnzzxQbAnGuRtXKoebZMdQN9whLJT8SQZKIRzrWLl2','0xAA7744feCC7EF5DE1c58aF01920F5EdED6879007','Active','2026-05-17 13:57:07');
/*!40000 ALTER TABLE `tbl_issuer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'veda'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-11  1:00:30
