-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: holdem
-- ------------------------------------------------------
-- Server version	8.0.30

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_table`
--

DROP TABLE IF EXISTS `admin_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_table` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(8) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `type` tinyint(1) NOT NULL,
  `name` varchar(12) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `country` tinyint(1) NOT NULL DEFAULT '0',
  `phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `loginCount` int unsigned NOT NULL DEFAULT '0',
  `spendTime` bigint unsigned NOT NULL DEFAULT '0',
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`code`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_table`
--

LOCK TABLES `admin_table` WRITE;
/*!40000 ALTER TABLE `admin_table` DISABLE KEYS */;
INSERT INTO `admin_table` VALUES (32,'2742',5,'admin1',0,'',1,162,0,0,'2022-03-17 14:28:35','2021-12-09 03:19:12'),(33,'4875',4,'admin2',0,'',1,119,0,0,'2022-02-08 17:55:49','2021-12-09 03:19:12'),(34,'2691',4,'admin3',0,'',1,45,0,0,'2022-01-06 19:43:28','2021-12-09 03:19:12'),(35,'78442516',3,'operator',0,'',1,6,0,0,'2021-12-15 11:28:06','2021-12-09 03:19:12'),(36,'75260094',2,'manager',0,'',0,0,0,0,'2021-12-09 03:19:12','2021-12-09 03:19:12'),(37,'12022820',1,'cashier',0,'',0,0,0,0,'2021-12-09 03:19:12','2021-12-09 03:19:12'),(38,'38295539',3,'oper1',0,'',1,9,0,0,'2022-01-05 20:49:15','2021-12-18 18:08:16'),(39,'84938817',3,'oper2',0,'',1,2,0,0,'2021-12-18 18:22:12','2021-12-18 18:08:32');
/*!40000 ALTER TABLE `admin_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buyins`
--

DROP TABLE IF EXISTS `buyins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buyins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `tableID` int NOT NULL,
  `oldBalance` int unsigned NOT NULL,
  `balance` int unsigned NOT NULL,
  `oldChip` int unsigned NOT NULL,
  `chip` int unsigned NOT NULL,
  `amount` int unsigned NOT NULL,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buyins`
--

LOCK TABLES `buyins` WRITE;
/*!40000 ALTER TABLE `buyins` DISABLE KEYS */;
INSERT INTO `buyins` VALUES (1,1,1,13132123,13130123,0,2000,2000,'2023-03-22 15:24:02'),(2,1,1,13132123,13131123,0,1000,1000,'2023-03-22 16:38:47'),(3,1,1,13132123,13131123,0,1000,1000,'2023-03-22 16:39:03'),(4,1,2,13132123,13122123,0,10000,10000,'2023-03-22 17:01:20'),(5,1,1,13132123,13131123,0,1000,1000,'2023-03-22 17:05:07'),(6,1,1,13132123,13130123,0,2000,2000,'2023-03-22 17:06:41'),(7,2,1,1000000,999000,0,1000,1000,'2023-03-22 17:30:52'),(8,1,1,13132123,13130123,0,2000,2000,'2023-03-22 17:36:56'),(9,2,1,1000000,999000,0,1000,1000,'2023-03-22 17:37:29'),(10,2,1,1000260,999260,0,1000,1000,'2023-03-22 17:52:34'),(11,2,1,1000260,999260,0,1000,1000,'2023-03-22 17:54:14'),(12,2,1,1000260,999260,0,1000,1000,'2023-03-22 17:55:55'),(13,2,1,1000260,999260,0,1000,1000,'2023-03-22 17:58:47'),(14,1,1,13131823,13129823,0,2000,2000,'2023-03-22 18:21:46'),(15,2,1,1000260,998260,0,2000,2000,'2023-03-22 18:21:53'),(16,2,1,998260,997210,950,2000,1050,'2023-03-22 18:23:25'),(17,1,2,13132633,13127633,0,5000,5000,'2023-03-22 18:31:26'),(18,2,2,998410,988410,0,10000,10000,'2023-03-22 18:31:32'),(19,1,2,13131633,13126633,0,5000,5000,'2023-03-22 18:32:47'),(20,1,2,13126633,13121633,5000,10000,5000,'2023-03-22 18:33:20'),(21,2,2,997910,992910,0,5000,5000,'2023-03-24 15:42:53'),(22,1,2,13131633,13126633,0,5000,5000,'2023-03-24 15:42:55'),(23,2,2,996910,991910,0,5000,5000,'2023-03-24 15:49:10'),(24,1,2,13132433,13127433,0,5000,5000,'2023-03-24 15:49:14'),(25,1,2,13133933,13083933,0,50000,50000,'2023-03-24 15:58:04'),(26,2,2,994910,944910,0,50000,50000,'2023-03-24 15:58:06'),(27,2,2,994260,944260,0,50000,50000,'2023-03-24 16:05:02'),(28,1,2,13132783,13082783,0,50000,50000,'2023-03-24 16:05:04'),(29,1,2,13132633,13082633,0,50000,50000,'2023-03-24 16:29:12'),(30,2,2,992760,942760,0,50000,50000,'2023-03-24 16:29:14'),(31,1,2,13131133,13081133,0,50000,50000,'2023-03-24 16:32:26'),(32,2,2,992610,942610,0,50000,50000,'2023-03-24 16:32:28'),(33,2,2,992460,942460,0,50000,50000,'2023-03-24 16:36:54'),(34,1,2,13130983,13080983,0,50000,50000,'2023-03-24 16:36:54'),(35,1,2,13129983,13079983,0,50000,50000,'2023-03-24 16:37:39'),(36,2,2,991960,941960,0,50000,50000,'2023-03-24 16:37:41'),(37,1,2,13129483,13079483,0,50000,50000,'2023-03-24 16:46:59'),(38,2,2,990960,940960,0,50000,50000,'2023-03-24 16:47:00'),(39,1,2,13128833,13078833,0,50000,50000,'2023-03-24 16:48:45'),(40,1,2,13128833,13078833,0,50000,50000,'2023-03-24 16:50:05'),(41,2,2,991160,941160,0,50000,50000,'2023-03-24 16:50:06'),(42,1,2,13127333,13077333,0,50000,50000,'2023-03-24 16:54:05'),(43,2,2,991010,941010,0,50000,50000,'2023-03-24 16:54:06'),(44,1,2,13127033,13077033,0,50000,50000,'2023-03-24 16:58:06'),(45,2,2,990710,940710,0,50000,50000,'2023-03-24 16:58:07'),(46,1,2,13127833,13077833,0,50000,50000,'2023-03-24 17:06:36'),(47,2,2,989710,939710,0,50000,50000,'2023-03-24 17:06:38'),(48,1,2,13127833,13077833,0,50000,50000,'2023-03-24 17:11:03'),(49,2,2,988210,938210,0,50000,50000,'2023-03-24 17:11:04'),(50,1,2,13127333,13077333,0,50000,50000,'2023-03-24 17:14:32'),(51,2,2,988710,938710,0,50000,50000,'2023-03-24 17:14:33'),(52,1,2,13125833,13075833,0,50000,50000,'2023-03-24 17:19:01'),(53,2,2,988710,938710,0,50000,50000,'2023-03-24 17:19:05'),(54,1,2,13125333,13075333,0,50000,50000,'2023-03-24 17:22:37'),(55,2,2,987710,937710,0,50000,50000,'2023-03-24 17:22:38'),(56,1,2,13075333,13025333,0,50000,50000,'2023-03-24 17:24:20'),(57,1,2,13079133,13029133,0,50000,50000,'2023-03-24 17:26:25'),(58,2,2,1021210,971210,0,50000,50000,'2023-03-24 17:26:26'),(59,1,2,13070633,13020633,0,50000,50000,'2023-03-24 17:30:13'),(60,2,2,1026110,976110,0,50000,50000,'2023-03-24 17:30:15'),(61,1,2,13077733,13027733,0,50000,50000,'2023-03-24 17:37:11'),(62,2,2,1015410,965410,0,50000,50000,'2023-03-24 17:37:13'),(63,1,2,13077233,13027233,0,50000,50000,'2023-03-24 17:38:53'),(64,2,2,1015910,965910,0,50000,50000,'2023-03-24 17:38:55'),(65,1,2,13077233,13027233,0,50000,50000,'2023-03-24 17:40:52'),(66,2,2,1015910,965910,0,50000,50000,'2023-03-24 17:41:01'),(67,1,2,13076733,13026733,0,50000,50000,'2023-03-24 17:43:35'),(68,2,2,1014910,964910,0,50000,50000,'2023-03-24 17:43:36'),(69,1,2,13077733,13027733,0,50000,50000,'2023-03-24 17:44:59'),(70,2,2,1013910,963910,0,50000,50000,'2023-03-24 17:45:01'),(71,1,2,13027733,12977733,0,50000,50000,'2023-03-24 17:51:35'),(72,2,2,1012910,962910,0,50000,50000,'2023-03-24 17:51:36'),(73,1,2,13027233,12977233,0,50000,50000,'2023-03-24 17:55:45'),(74,2,2,1013410,963410,0,50000,50000,'2023-03-24 17:55:47'),(75,1,2,13024433,12974433,0,50000,50000,'2023-03-24 17:59:48'),(76,2,2,1010910,960910,0,50000,50000,'2023-03-24 17:59:50'),(77,1,2,13046433,12996433,0,50000,50000,'2023-03-24 18:09:17'),(78,2,2,970910,920910,0,50000,50000,'2023-03-24 18:09:19'),(79,1,2,13056233,13006233,0,50000,50000,'2023-03-24 18:11:50'),(80,2,2,956910,906910,0,50000,50000,'2023-03-24 18:11:52'),(81,1,2,13070233,13020233,0,50000,50000,'2023-03-24 18:18:33'),(82,2,2,938910,888910,0,50000,50000,'2023-03-24 18:19:10'),(83,2,2,938910,888910,0,50000,50000,'2023-03-24 18:19:31'),(84,1,2,13060233,13010233,0,50000,50000,'2023-03-24 18:22:24'),(85,2,2,946910,896910,0,50000,50000,'2023-03-24 18:22:26'),(86,1,2,13052133,13002133,0,50000,50000,'2023-03-24 18:30:56'),(87,2,2,916910,866910,0,50000,50000,'2023-03-24 18:30:58'),(88,2,2,892410,842410,0,50000,50000,'2023-03-26 12:52:44'),(89,2,2,892410,842410,0,50000,50000,'2023-03-26 12:55:56'),(90,1,2,13071833,12971833,0,100000,100000,'2023-03-26 12:55:59'),(91,2,2,882410,832410,0,50000,50000,'2023-03-26 13:26:58'),(92,2,2,882410,832410,0,50000,50000,'2023-03-26 13:28:05'),(93,2,2,882410,832410,0,50000,50000,'2023-03-26 13:29:25'),(94,1,2,13078033,13028033,0,50000,50000,'2023-03-26 13:30:45'),(95,2,2,882410,832410,0,50000,50000,'2023-03-26 13:31:29'),(96,2,2,882410,832410,0,50000,50000,'2023-03-26 15:06:43'),(97,2,2,882410,832410,0,50000,50000,'2023-03-26 15:20:17'),(98,1,2,13078033,13028033,0,50000,50000,'2023-03-26 15:20:24'),(99,1,2,13077033,13027033,0,50000,50000,'2023-03-26 15:26:27'),(100,2,2,881910,831910,0,50000,50000,'2023-03-26 15:26:28'),(101,1,2,13077033,13027033,0,50000,50000,'2023-03-26 15:57:21'),(102,2,2,880410,830410,0,50000,50000,'2023-03-26 15:57:34'),(103,1,2,13076533,13026533,0,50000,50000,'2023-03-26 16:01:24'),(104,2,2,880910,830910,0,50000,50000,'2023-03-26 16:01:27'),(105,1,2,13076033,13026033,0,50000,50000,'2023-03-26 16:02:45'),(106,2,2,881410,831410,0,50000,50000,'2023-03-26 16:02:46'),(107,1,2,13076033,13026033,0,50000,50000,'2023-03-26 16:03:02'),(108,2,2,881410,831410,0,50000,50000,'2023-03-26 16:03:05'),(109,2,2,879910,829910,0,50000,50000,'2023-03-26 16:04:56'),(110,1,2,13076033,13026033,0,50000,50000,'2023-03-26 16:07:28'),(111,2,2,879910,829910,0,50000,50000,'2023-03-26 16:07:36'),(112,1,2,13074533,13024533,0,50000,50000,'2023-03-26 16:11:17'),(113,1,2,13074533,13024533,0,50000,50000,'2023-03-26 16:13:29'),(114,1,2,13074533,13024533,0,50000,50000,'2023-03-26 16:13:53'),(115,1,2,13074533,13024533,0,50000,50000,'2023-03-26 16:15:43'),(116,1,2,13074533,13024533,0,50000,50000,'2023-03-26 16:17:17'),(117,1,2,13074533,13024533,0,50000,50000,'2023-03-26 16:18:54'),(118,2,2,879910,829910,0,50000,50000,'2023-03-26 16:18:58'),(119,1,2,13073033,13023033,0,50000,50000,'2023-03-26 16:43:12'),(120,2,2,879910,829910,0,50000,50000,'2023-03-26 16:43:13'),(121,2,2,870410,820410,0,50000,50000,'2023-03-26 17:01:10'),(122,1,2,13071333,13021333,0,50000,50000,'2023-03-26 17:01:13'),(123,3,2,1000000,950000,0,50000,50000,'2023-03-26 17:01:16'),(124,1,2,13069333,13019333,0,50000,50000,'2023-03-26 17:17:29'),(125,2,2,869710,819710,0,50000,50000,'2023-03-26 17:17:30');
/*!40000 ALTER TABLE `buyins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_chip`
--

DROP TABLE IF EXISTS `credit_chip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_chip` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adminID` int NOT NULL,
  `userID` int NOT NULL,
  `name` varchar(24) NOT NULL,
  `oldBalance` int unsigned NOT NULL,
  `balance` int unsigned NOT NULL,
  `chip` int unsigned NOT NULL,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_chip`
--

LOCK TABLES `credit_chip` WRITE;
/*!40000 ALTER TABLE `credit_chip` DISABLE KEYS */;
INSERT INTO `credit_chip` VALUES (8,38,56,'JOSH KIM',70000,99800,29800,'2021-12-21 20:20:05'),(9,38,56,'JOSH KIM',67300,250000,182700,'2021-12-22 20:11:58'),(10,34,53,'JJ CHANG',80000,98100,18100,'2021-12-23 14:44:33'),(11,34,50,'JAY CHANG',60000,78200,18200,'2021-12-23 23:51:39'),(12,34,53,'JJ CHANG',78100,99000,20900,'2021-12-23 23:52:22'),(13,38,75,'LASH SIM',19900,78600,58700,'2022-01-05 21:09:06'),(14,38,56,'JOSH KIM',0,52850,52850,'2022-01-05 21:12:15'),(15,38,75,'LASH SIM',20000,72100,52100,'2022-01-05 21:20:45'),(16,32,36,'SY CHOI',80000,92200,12200,'2022-01-07 12:23:37'),(17,32,35,'DAVID SON',80000,106000,26000,'2022-01-07 14:35:47'),(18,32,35,'DAVID SON',106000,106000,0,'2022-01-07 15:55:42'),(19,32,55,'LARRY ELLERBE',0,0,0,'2022-01-10 14:58:30'),(20,32,56,'JOSH KIM',0,36050,36050,'2022-01-10 14:58:30'),(21,32,57,'CY YOUN',70000,303625,233625,'2022-01-10 14:58:30'),(22,32,58,'JAY CHANG',70000,70000,0,'2022-01-10 14:58:30'),(23,32,59,'GON NAMGUNG',40000,80550,40550,'2022-01-10 14:58:30'),(24,32,60,'CK KIM',100000,100000,0,'2022-01-10 14:58:30'),(25,32,47,'DAVID SON',100000,100000,0,'2022-01-13 11:56:36'),(26,32,35,'DAVID SON',106000,106000,0,'2022-01-14 15:54:05'),(27,32,73,'123123 123123123',0,0,0,'2022-01-14 15:54:05'),(28,32,51,'DAVID SON',90000,90000,0,'2022-01-14 15:54:05'),(29,32,38,'GON NG',80000,99700,19700,'2022-01-14 15:54:05'),(30,32,39,'JAY CHANG',0,0,0,'2022-01-14 15:54:05'),(31,32,36,'SY CHOI',92200,92200,0,'2022-01-14 15:56:06'),(32,32,35,'DAVID SON',106000,106000,0,'2022-01-14 15:56:06'),(33,32,51,'DAVID SON',90000,90000,0,'2022-01-14 15:56:06'),(34,32,38,'GON NG',99700,99700,0,'2022-01-14 15:56:06'),(35,32,39,'JAY CHANG',0,0,0,'2022-01-14 15:56:06'),(36,32,40,'JAY2 CHANG',0,0,0,'2022-01-14 15:56:06'),(37,32,38,'GON NG',99700,99700,0,'2022-01-14 16:12:59'),(38,32,39,'JAY CHANG',0,0,0,'2022-01-14 16:12:59'),(39,32,40,'JAY2 CHANG',0,0,0,'2022-01-14 16:12:59'),(40,32,42,'JOSHUA KIM',0,0,0,'2022-01-14 16:12:59'),(41,32,43,'CG YOUN',0,0,0,'2022-01-14 16:12:59'),(42,32,39,'JAY CHANG',0,0,0,'2022-01-14 16:13:09'),(43,32,42,'JOSHUA KIM',0,0,0,'2022-01-14 16:13:09'),(44,32,36,'SY CHOI',0,0,0,'2022-01-28 11:51:03'),(45,32,35,'DAVID SON',255279,280579,25300,'2022-03-17 14:29:46');
/*!40000 ALTER TABLE `credit_chip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_purchase`
--

DROP TABLE IF EXISTS `credit_purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_purchase` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adminID` int NOT NULL,
  `userID` int NOT NULL,
  `name` varchar(24) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `oldBalance` int unsigned NOT NULL,
  `balance` int unsigned NOT NULL,
  `chip` int unsigned NOT NULL,
  `credit` int unsigned NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_purchase`
--

LOCK TABLES `credit_purchase` WRITE;
/*!40000 ALTER TABLE `credit_purchase` DISABLE KEYS */;
INSERT INTO `credit_purchase` VALUES (129,32,35,'DAVID SON',100000,0,0,1000,0,'2021-12-21 19:18:52'),(130,32,36,'SY CHOI',100000,0,0,1000,0,'2021-12-21 19:19:55'),(131,33,62,'ISAAA KKKK',1000000,0,0,10000,0,'2021-12-21 19:20:09'),(132,38,61,'DAVID SON',100000,0,0,1000,1,'2021-12-21 19:59:12'),(133,38,59,'GON NAMGUNG',100000,0,0,1000,1,'2021-12-21 19:59:29'),(134,38,58,'JAY CHANG',100000,0,0,1000,1,'2021-12-21 19:59:44'),(135,38,56,'JOSH KIM',100000,0,0,1000,1,'2021-12-21 19:59:59'),(136,38,60,'CK KIM',100000,0,0,1000,0,'2021-12-21 20:00:24'),(137,38,57,'CY YOUN',100000,0,0,1000,0,'2021-12-21 20:00:41'),(138,38,56,'JOSH KIM',100000,0,0,1000,1,'2021-12-21 20:22:35'),(139,38,71,'POKAHONTA SMITH',100000,0,0,1000,0,'2021-12-21 21:14:08'),(140,38,61,'DAVID SON',130550,30550,1200,1000,0,'2021-12-21 21:37:52'),(141,38,58,'JAY CHANG',100000,0,0,1000,0,'2021-12-21 22:19:48'),(142,38,59,'GON NAMGUNG',100000,0,0,1000,0,'2021-12-21 22:25:57'),(143,38,72,'SUNG PAK',50000,0,0,500,0,'2021-12-22 20:07:20'),(144,34,50,'JAY CHANG',100000,0,0,1000,1,'2021-12-23 14:12:22'),(145,34,53,'JJ CHANG',100000,0,0,1000,0,'2021-12-23 14:27:21'),(146,38,74,'SPOODY BE',50000,0,0,500,0,'2022-01-04 12:54:13'),(147,38,75,'LASH SIM',50000,0,0,500,1,'2022-01-05 20:50:58'),(148,38,75,'LASH SIM',30000,0,19900,300,1,'2022-01-05 21:05:45'),(149,38,75,'LASH SIM',50000,0,0,500,0,'2022-01-05 21:13:47'),(150,32,51,'DAVID SON',0,100000,0,1000,0,'2022-01-12 14:45:21'),(151,32,47,'DAVID SON',0,100000,0,1000,0,'2022-01-12 14:46:54'),(152,32,36,'SY CHOI',92200,192200,0,1000,0,'2022-01-14 16:11:43'),(153,32,35,'DAVID SON',245279,255279,25300,100,0,'2022-03-17 14:29:26'),(154,32,35,'DAVID SON',255279,265279,25300,100,0,'2022-03-17 14:29:33');
/*!40000 ALTER TABLE `credit_purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credit_redeem`
--

DROP TABLE IF EXISTS `credit_redeem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `credit_redeem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adminID` int NOT NULL,
  `userID` int NOT NULL,
  `name` varchar(24) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `oldBalance` int unsigned NOT NULL,
  `balance` int unsigned NOT NULL,
  `chip` int unsigned NOT NULL,
  `credit` int unsigned NOT NULL,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credit_redeem`
--

LOCK TABLES `credit_redeem` WRITE;
/*!40000 ALTER TABLE `credit_redeem` DISABLE KEYS */;
INSERT INTO `credit_redeem` VALUES (30,38,56,'JOSH KIM',99800,0,0,998,'2021-12-21 20:20:47'),(31,38,56,'JOSH KIM',250000,50000,0,2000,'2021-12-22 20:13:20'),(32,34,50,'JAY CHANG',100000,80000,0,200,'2021-12-23 14:13:06'),(33,38,75,'LASH SIM',78600,0,0,786,'2022-01-05 21:10:10'),(34,32,51,'DAVID SON',100000,90000,0,100,'2022-01-12 14:51:54'),(35,32,36,'SY CHOI',192200,0,0,1922,'2022-01-14 16:11:51'),(36,32,35,'DAVID SON',265279,255279,25300,100,'2022-03-17 14:29:39');
/*!40000 ALTER TABLE `credit_redeem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `setting`
--

DROP TABLE IF EXISTS `setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setting` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `card_type1` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `card_type2` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `board_type` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `best_hands` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  PRIMARY KEY (`id`,`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
INSERT INTO `setting` VALUES (1,'35','2','1','1','0'),(2,'36','1','1','1',' '),(3,'38','0','0','0',' '),(4,'1','2','0','2',' '),(5,'2','0','0','0',' '),(6,'3','0','0','0',' ');
/*!40000 ALTER TABLE `setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `statics`
--

DROP TABLE IF EXISTS `statics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `statics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userID` int NOT NULL,
  `hands` int unsigned NOT NULL DEFAULT '0',
  `rakes` int unsigned NOT NULL DEFAULT '0',
  `rollings` int unsigned NOT NULL DEFAULT '0',
  `maxPots` int unsigned NOT NULL DEFAULT '0',
  `win` int unsigned NOT NULL DEFAULT '0',
  `fold` int unsigned NOT NULL DEFAULT '0',
  `win_preflop` int unsigned NOT NULL DEFAULT '0',
  `win_flop` int unsigned NOT NULL DEFAULT '0',
  `win_turn` int unsigned NOT NULL DEFAULT '0',
  `win_river` int unsigned NOT NULL DEFAULT '0',
  `win_dealer` int unsigned NOT NULL DEFAULT '0',
  `win_smallBlind` int unsigned NOT NULL DEFAULT '0',
  `win_bigBlind` int unsigned NOT NULL DEFAULT '0',
  `fold_preflop` int unsigned NOT NULL DEFAULT '0',
  `fold_flop` int unsigned NOT NULL DEFAULT '0',
  `fold_turn` int unsigned NOT NULL DEFAULT '0',
  `fold_river` int unsigned NOT NULL DEFAULT '0',
  `draw` int unsigned NOT NULL DEFAULT '0',
  `best_hands` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ' ',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statics`
--

LOCK TABLES `statics` WRITE;
/*!40000 ALTER TABLE `statics` DISABLE KEYS */;
INSERT INTO `statics` VALUES (1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,' ','2023-03-24 11:52:55','2023-03-24 11:52:55'),(2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,' ','2023-03-24 15:42:26','2023-03-24 15:42:26'),(3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,' ','2023-03-26 17:00:38','2023-03-26 17:00:38');
/*!40000 ALTER TABLE `statics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tables`
--

DROP TABLE IF EXISTS `tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tables` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `recommender` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `name` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `type` int unsigned NOT NULL DEFAULT '0',
  `grade` int unsigned NOT NULL DEFAULT '0',
  `password` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  `maxPlayers` int unsigned NOT NULL,
  `betTimeLimit` int unsigned NOT NULL,
  `smallBlind` int unsigned NOT NULL,
  `bigBlind` int unsigned NOT NULL,
  `minStakePrice` int unsigned NOT NULL,
  `maxStakePrice` int unsigned NOT NULL,
  `useRake` tinyint(1) NOT NULL DEFAULT '0',
  `rake` int DEFAULT '0',
  `useRakeCap` tinyint(1) NOT NULL DEFAULT '0',
  `rakeCap1` int unsigned NOT NULL,
  `rakeCap2` int unsigned NOT NULL,
  `rakeCap3` int unsigned NOT NULL,
  `useFlopRake` tinyint(1) NOT NULL DEFAULT '0',
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tables`
--

LOCK TABLES `tables` WRITE;
/*!40000 ALTER TABLE `tables` DISABLE KEYS */;
INSERT INTO `tables` VALUES (1,'123123','ashjdsad',0,0,'',9,20,300,500,10000,20000,1,500,0,0,0,0,0,0,1,'2023-03-20 18:52:32','2023-03-20 18:52:32'),(2,'1233321','sad123123',0,0,'123123',9,20,500,1000,50000,100000,1,1000,0,0,0,0,0,0,1,'2023-03-21 11:26:47','2023-03-21 11:26:47');
/*!40000 ALTER TABLE `tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `uid` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `avatar` int NOT NULL DEFAULT '0',
  `grade` int NOT NULL DEFAULT '0',
  `balance` int unsigned NOT NULL DEFAULT '0',
  `chip` int unsigned NOT NULL DEFAULT '0',
  `tableID` int DEFAULT NULL,
  `rake` int unsigned NOT NULL DEFAULT '0',
  `transferpassword` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `account` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `recommender` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `purchase` bigint unsigned NOT NULL DEFAULT '0',
  `purchaseCount` int unsigned NOT NULL DEFAULT '0',
  `redeem` bigint unsigned NOT NULL DEFAULT '0',
  `redeemCount` int unsigned NOT NULL DEFAULT '0',
  `activeSessionId` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  `pendingSessionId` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  `pendingSessionTimestamp` bigint DEFAULT '0',
  `loginCount` int unsigned NOT NULL DEFAULT '0',
  `loginDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logoutDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`,`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'gonii','nggon','972130',13,1,13074833,0,-1,24426,'972130','01099599771','우리','남궁곤','01099599771','XMDEDF',0,0,0,0,'','',1679818641427,0,'2023-03-26 17:17:21','2023-03-20 12:17:50','2023-03-26 17:18:58','2023-03-20 12:17:50',0,1,0),(2,'nggon','elektra','972130',0,0,862710,0,-1,20014,'972130','01099599771','우리은행','남궁곤','01099599771','SHOWME',0,0,0,0,'','',1679818642496,0,'2023-03-26 17:17:22','2023-03-20 12:45:47','2023-03-26 17:18:58','2023-03-20 12:45:47',0,1,0),(3,'nggon1','elektra1','972130',0,0,1002200,0,-1,100,'972130','01099599771','우리은행','남궁곤','01099599771','SHOWME',0,0,0,0,'','',1679817667157,0,'2023-03-26 17:01:07','2023-03-20 12:48:23','2023-03-26 17:03:26','2023-03-20 12:48:23',0,1,0),(4,'nggon2','elektra2','972130',0,0,0,0,-1,0,'972130','01099599771','우리은행','남궁곤','01099599771','SHOWME',0,0,0,0,'','',0,0,'2023-03-20 12:59:25','2023-03-20 12:59:25','2023-03-20 12:59:25','2023-03-20 12:59:25',0,1,1),(5,'nggon4','nggon4','972130',0,0,0,0,-1,0,'972130','01099599771','카카오뱅크','남궁곤','010-9599-9771','XMSMDS',0,0,0,0,'','',0,0,'2023-03-20 13:00:18','2023-03-20 13:00:18','2023-03-20 13:00:18','2023-03-20 13:00:18',0,1,1),(6,'nggon5','nggon5','972130',0,0,0,0,-1,0,'972130','01099599771','카카오뱅크','남궁곤','010-9599-9771','XMSMDS',0,0,0,0,'','',0,0,'2023-03-20 13:01:54','2023-03-20 13:01:54','2023-03-20 13:01:54','2023-03-20 13:01:54',0,1,1),(7,'nggon6','nggon6','972130',0,0,0,0,-1,0,'972130','01099599771','카카오뱅크','남궁곤','010-9599-9771','XMSMDS',0,0,0,0,'','',0,0,'2023-03-20 13:03:27','2023-03-20 13:03:27','2023-03-20 13:03:27','2023-03-20 13:03:27',0,1,1),(8,'nggon7','nggon7','972130',0,0,0,0,-1,0,'972130','01099599771','카카오뱅크','남궁곤','010-9599-9771','XMSMDS',0,0,0,0,'','',0,0,'2023-03-20 13:04:33','2023-03-20 13:04:33','2023-03-20 13:04:33','2023-03-20 13:04:33',0,1,1),(9,'nggon8','nggon8','972130',0,0,0,0,-1,0,'972130','01099599771','카카오뱅크','남궁곤','010-9599-9771','XMSMDS',0,0,0,0,'','',0,0,'2023-03-20 13:14:09','2023-03-20 13:14:09','2023-03-20 13:14:09','2023-03-20 13:14:09',0,1,1),(10,'nggon9','nggon9','972130',0,0,0,0,-1,0,'972130','01099599771','카카오뱅크','남궁곤','010-9599-9771','XMSMDS',0,0,0,0,'','',0,0,'2023-03-20 13:15:11','2023-03-20 13:15:11','2023-03-20 13:15:11','2023-03-20 13:15:11',0,1,1),(11,'ghghgh','asdsadsad','12312dsad',0,0,0,0,-1,0,'132312sad','1023123213','123123','123123','123123','23123213',0,0,0,0,'','',0,0,'2023-03-20 13:15:50','2023-03-20 13:15:50','2023-03-20 13:15:50','2023-03-20 13:15:50',0,1,1),(12,'ghghgh1','asdsadsad1','12312dsad',0,0,0,0,-1,0,'132312sad','1023123213','123123','123123','123123','23123213',0,0,0,0,'','',0,0,'2023-03-20 13:22:34','2023-03-20 13:22:34','2023-03-20 13:22:34','2023-03-20 13:22:34',0,1,1),(13,'saddwqe','wqewqsad','123123',0,0,0,0,-1,0,'123213','1232131','13123','sadsa','sad123123','132123213',0,0,0,0,'','',0,0,'2023-03-20 13:22:57','2023-03-20 13:22:57','2023-03-20 13:22:57','2023-03-20 13:22:57',0,1,1),(14,'sad123123','sad21321','asdsa123213',0,0,0,0,-1,0,'assadd','123213213','123123123','12312312','sad213123213','132123123',0,0,0,0,'','',0,0,'2023-03-20 13:24:21','2023-03-20 13:24:21','2023-03-20 13:24:21','2023-03-20 13:24:21',0,1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-26 17:25:30
