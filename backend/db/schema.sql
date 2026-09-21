-- MySQL dump 10.13  Distrib 9.4.0, for Win64 (x86_64)
--
-- Host: localhost    Database: kardex_db
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario` (`usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alumnos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `carrera_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula` (`matricula`),
  KEY `carrera_id` (`carrera_id`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`carrera_id`) REFERENCES `carreras` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `calificaciones`
--

DROP TABLE IF EXISTS `calificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificaciones` (
  `id` int NOT NULL AUTO_INCREMENT,
  `alumno_id` int NOT NULL,
  `materia_id` int NOT NULL,
  `semestre_id` int NOT NULL,
  `calificacion` decimal(4,1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_calificacion` (`alumno_id`,`materia_id`,`semestre_id`),
  KEY `materia_id` (`materia_id`),
  KEY `semestre_id` (`semestre_id`),
  CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`),
  CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  CONSTRAINT `calificaciones_ibfk_3` FOREIGN KEY (`semestre_id`) REFERENCES `semestres` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `carreras`
--

DROP TABLE IF EXISTS `carreras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carreras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `facultad` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `docentes`
--

DROP TABLE IF EXISTS `docentes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docentes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `matricula` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `matricula` (`matricula`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materia_docente`
--

DROP TABLE IF EXISTS `materia_docente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materia_docente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `materia_id` int NOT NULL,
  `semestre_id` int NOT NULL,
  `docente_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_por_semestre` (`materia_id`,`semestre_id`),
  KEY `semestre_id` (`semestre_id`),
  KEY `docente_id` (`docente_id`),
  CONSTRAINT `materia_docente_ibfk_1` FOREIGN KEY (`materia_id`) REFERENCES `materias` (`id`),
  CONSTRAINT `materia_docente_ibfk_2` FOREIGN KEY (`semestre_id`) REFERENCES `semestres` (`id`),
  CONSTRAINT `materia_docente_ibfk_3` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materias`
--

DROP TABLE IF EXISTS `materias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(20) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `creditos` int NOT NULL DEFAULT '6',
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `semestres`
--

DROP TABLE IF EXISTS `semestres`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `semestres` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `vista_admin_auth`
--

DROP TABLE IF EXISTS `vista_admin_auth`;
/*!50001 DROP VIEW IF EXISTS `vista_admin_auth`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_admin_auth` AS SELECT 
 1 AS `id`,
 1 AS `usuario`,
 1 AS `password_hash`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_alumno_auth`
--

DROP TABLE IF EXISTS `vista_alumno_auth`;
/*!50001 DROP VIEW IF EXISTS `vista_alumno_auth`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_alumno_auth` AS SELECT 
 1 AS `id`,
 1 AS `matricula`,
 1 AS `nombre`,
 1 AS `apellidos`,
 1 AS `carrera`,
 1 AS `password_hash`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_alumnos`
--

DROP TABLE IF EXISTS `vista_alumnos`;
/*!50001 DROP VIEW IF EXISTS `vista_alumnos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_alumnos` AS SELECT 
 1 AS `id`,
 1 AS `matricula`,
 1 AS `nombre`,
 1 AS `apellidos`,
 1 AS `carrera`,
 1 AS `created_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_calificaciones`
--

DROP TABLE IF EXISTS `vista_calificaciones`;
/*!50001 DROP VIEW IF EXISTS `vista_calificaciones`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_calificaciones` AS SELECT 
 1 AS `calificacion_id`,
 1 AS `alumno_id`,
 1 AS `matricula`,
 1 AS `alumno_nombre`,
 1 AS `alumno_apellidos`,
 1 AS `materia_id`,
 1 AS `clave_materia`,
 1 AS `materia`,
 1 AS `creditos`,
 1 AS `semestre_id`,
 1 AS `semestre`,
 1 AS `calificacion`,
 1 AS `estatus`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_carreras`
--

DROP TABLE IF EXISTS `vista_carreras`;
/*!50001 DROP VIEW IF EXISTS `vista_carreras`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_carreras` AS SELECT 
 1 AS `id`,
 1 AS `clave`,
 1 AS `nombre`,
 1 AS `facultad`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_docentes`
--

DROP TABLE IF EXISTS `vista_docentes`;
/*!50001 DROP VIEW IF EXISTS `vista_docentes`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_docentes` AS SELECT 
 1 AS `id`,
 1 AS `matricula`,
 1 AS `nombre`,
 1 AS `apellidos`,
 1 AS `email`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_kardex`
--

DROP TABLE IF EXISTS `vista_kardex`;
/*!50001 DROP VIEW IF EXISTS `vista_kardex`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_kardex` AS SELECT 
 1 AS `alumno_id`,
 1 AS `matricula`,
 1 AS `nombre`,
 1 AS `apellidos`,
 1 AS `carrera`,
 1 AS `semestre_id`,
 1 AS `semestre`,
 1 AS `clave_materia`,
 1 AS `materia`,
 1 AS `creditos`,
 1 AS `calificacion`,
 1 AS `estatus`,
 1 AS `docente`,
 1 AS `email_docente`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_materia_docente`
--

DROP TABLE IF EXISTS `vista_materia_docente`;
/*!50001 DROP VIEW IF EXISTS `vista_materia_docente`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_materia_docente` AS SELECT 
 1 AS `materia_id`,
 1 AS `semestre_id`,
 1 AS `clave_materia`,
 1 AS `materia`,
 1 AS `semestre`,
 1 AS `docente_id`,
 1 AS `matricula_docente`,
 1 AS `docente_nombre`,
 1 AS `docente_apellidos`,
 1 AS `email`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_materias`
--

DROP TABLE IF EXISTS `vista_materias`;
/*!50001 DROP VIEW IF EXISTS `vista_materias`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_materias` AS SELECT 
 1 AS `id`,
 1 AS `clave`,
 1 AS `nombre`,
 1 AS `creditos`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vista_semestres`
--

DROP TABLE IF EXISTS `vista_semestres`;
/*!50001 DROP VIEW IF EXISTS `vista_semestres`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vista_semestres` AS SELECT 
 1 AS `id`,
 1 AS `nombre`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vista_admin_auth`
--

/*!50001 DROP VIEW IF EXISTS `vista_admin_auth`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_admin_auth` AS select `admins`.`id` AS `id`,`admins`.`usuario` AS `usuario`,`admins`.`password_hash` AS `password_hash` from `admins` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_alumno_auth`
--

/*!50001 DROP VIEW IF EXISTS `vista_alumno_auth`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_alumno_auth` AS select `alumnos`.`id` AS `id`,`alumnos`.`matricula` AS `matricula`,`alumnos`.`nombre` AS `nombre`,`alumnos`.`apellidos` AS `apellidos`,`alumnos`.`carrera` AS `carrera`,`alumnos`.`password_hash` AS `password_hash` from `alumnos` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_alumnos`
--

/*!50001 DROP VIEW IF EXISTS `vista_alumnos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_alumnos` AS select `alumnos`.`id` AS `id`,`alumnos`.`matricula` AS `matricula`,`alumnos`.`nombre` AS `nombre`,`alumnos`.`apellidos` AS `apellidos`,`alumnos`.`carrera` AS `carrera`,`alumnos`.`created_at` AS `created_at` from `alumnos` order by `alumnos`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_calificaciones`
--

/*!50001 DROP VIEW IF EXISTS `vista_calificaciones`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_calificaciones` AS select `c`.`id` AS `calificacion_id`,`a`.`id` AS `alumno_id`,`a`.`matricula` AS `matricula`,`a`.`nombre` AS `alumno_nombre`,`a`.`apellidos` AS `alumno_apellidos`,`m`.`id` AS `materia_id`,`m`.`clave` AS `clave_materia`,`m`.`nombre` AS `materia`,`m`.`creditos` AS `creditos`,`s`.`id` AS `semestre_id`,`s`.`nombre` AS `semestre`,`c`.`calificacion` AS `calificacion`,(case when (`c`.`calificacion` >= 6) then 'Aprobado' else 'Reprobado' end) AS `estatus` from (((`calificaciones` `c` join `alumnos` `a` on((`a`.`id` = `c`.`alumno_id`))) join `materias` `m` on((`m`.`id` = `c`.`materia_id`))) join `semestres` `s` on((`s`.`id` = `c`.`semestre_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_carreras`
--

/*!50001 DROP VIEW IF EXISTS `vista_carreras`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_carreras` AS select `carreras`.`id` AS `id`,`carreras`.`clave` AS `clave`,`carreras`.`nombre` AS `nombre`,`carreras`.`facultad` AS `facultad` from `carreras` order by `carreras`.`nombre` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_docentes`
--

/*!50001 DROP VIEW IF EXISTS `vista_docentes`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_docentes` AS select `docentes`.`id` AS `id`,`docentes`.`matricula` AS `matricula`,`docentes`.`nombre` AS `nombre`,`docentes`.`apellidos` AS `apellidos`,`docentes`.`email` AS `email` from `docentes` order by `docentes`.`apellidos` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_kardex`
--

/*!50001 DROP VIEW IF EXISTS `vista_kardex`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_kardex` AS select `a`.`id` AS `alumno_id`,`a`.`matricula` AS `matricula`,`a`.`nombre` AS `nombre`,`a`.`apellidos` AS `apellidos`,`a`.`carrera` AS `carrera`,`s`.`id` AS `semestre_id`,`s`.`nombre` AS `semestre`,`m`.`clave` AS `clave_materia`,`m`.`nombre` AS `materia`,`m`.`creditos` AS `creditos`,`c`.`calificacion` AS `calificacion`,(case when (`c`.`calificacion` >= 6) then 'Aprobado' else 'Reprobado' end) AS `estatus`,concat(`d`.`nombre`,' ',`d`.`apellidos`) AS `docente`,`d`.`email` AS `email_docente` from (((((`calificaciones` `c` join `alumnos` `a` on((`a`.`id` = `c`.`alumno_id`))) join `materias` `m` on((`c`.`materia_id` = `m`.`id`))) join `semestres` `s` on((`c`.`semestre_id` = `s`.`id`))) left join `materia_docente` `md` on(((`md`.`materia_id` = `m`.`id`) and (`md`.`semestre_id` = `s`.`id`)))) left join `docentes` `d` on((`d`.`id` = `md`.`docente_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_materia_docente`
--

/*!50001 DROP VIEW IF EXISTS `vista_materia_docente`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_materia_docente` AS select `md`.`materia_id` AS `materia_id`,`md`.`semestre_id` AS `semestre_id`,`m`.`clave` AS `clave_materia`,`m`.`nombre` AS `materia`,`s`.`nombre` AS `semestre`,`d`.`id` AS `docente_id`,`d`.`matricula` AS `matricula_docente`,`d`.`nombre` AS `docente_nombre`,`d`.`apellidos` AS `docente_apellidos`,`d`.`email` AS `email` from (((`materia_docente` `md` join `materias` `m` on((`m`.`id` = `md`.`materia_id`))) join `semestres` `s` on((`s`.`id` = `md`.`semestre_id`))) join `docentes` `d` on((`d`.`id` = `md`.`docente_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_materias`
--

/*!50001 DROP VIEW IF EXISTS `vista_materias`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_materias` AS select `materias`.`id` AS `id`,`materias`.`clave` AS `clave`,`materias`.`nombre` AS `nombre`,`materias`.`creditos` AS `creditos` from `materias` order by `materias`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vista_semestres`
--

/*!50001 DROP VIEW IF EXISTS `vista_semestres`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vista_semestres` AS select `semestres`.`id` AS `id`,`semestres`.`nombre` AS `nombre` from `semestres` order by `semestres`.`id` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-09-21 17:38:40
