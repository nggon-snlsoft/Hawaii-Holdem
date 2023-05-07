-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: localhost    Database: holdem
-- ------------------------------------------------------
-- Server version	8.0.27

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
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL DEFAULT '-1',
  `login_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `type` int NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `loginCount` int unsigned NOT NULL DEFAULT '0',
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buyins`
--

DROP TABLE IF EXISTS `buyins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buyins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `table_id` int NOT NULL,
  `oldBalance` int unsigned NOT NULL,
  `balance` int unsigned NOT NULL,
  `oldChip` int unsigned NOT NULL,
  `chip` int unsigned NOT NULL,
  `amount` int unsigned NOT NULL,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buyins`
--

LOCK TABLES `buyins` WRITE;
/*!40000 ALTER TABLE `buyins` DISABLE KEYS */;
INSERT INTO `buyins` VALUES (1,2,1,1000000,960000,0,40000,40000,'2023-05-06 23:10:42'),(2,1,1,760000,720000,0,40000,40000,'2023-05-06 23:10:46'),(3,1,1,760850,720850,0,40000,40000,'2023-05-06 23:19:26'),(4,1,1,760850,720850,0,40000,40000,'2023-05-06 23:32:44'),(5,2,1,999000,959000,0,40000,40000,'2023-05-06 23:34:08'),(6,1,1,760850,720850,0,40000,40000,'2023-05-06 23:34:10'),(7,1,1,759850,719850,0,40000,40000,'2023-05-06 23:36:02'),(8,2,1,999850,959850,0,40000,40000,'2023-05-06 23:36:03'),(9,1,1,757850,717850,0,40000,40000,'2023-05-06 23:37:55'),(10,2,1,997850,957850,0,40000,40000,'2023-05-06 23:37:56'),(11,2,1,1013050,973050,0,40000,40000,'2023-05-06 23:41:00'),(12,1,1,740700,700700,0,40000,40000,'2023-05-06 23:41:01'),(13,1,1,700700,660700,0,40000,40000,'2023-05-06 23:47:05'),(14,2,1,1049050,1009050,0,40000,40000,'2023-05-06 23:47:07'),(15,1,1,700400,660400,0,40000,40000,'2023-05-06 23:49:29'),(16,2,1,1048700,1008700,0,40000,40000,'2023-05-06 23:49:30'),(17,1,1,700250,660250,0,40000,40000,'2023-05-06 23:51:29'),(18,2,1,1048550,1008550,0,40000,40000,'2023-05-06 23:51:31'),(19,1,1,702900,662900,0,40000,40000,'2023-05-06 23:56:05'),(20,2,1,1045550,1005550,0,40000,40000,'2023-05-06 23:56:06'),(21,1,1,705500,665500,0,40000,40000,'2023-05-07 00:03:36'),(22,2,1,1042550,1002550,0,40000,40000,'2023-05-07 00:03:38'),(23,1,1,719250,679250,0,40000,40000,'2023-05-07 00:07:20'),(24,2,1,1024050,984050,0,40000,40000,'2023-05-07 00:07:37');
/*!40000 ALTER TABLE `buyins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charges`
--

DROP TABLE IF EXISTS `charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charges` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `login_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `amount` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charges`
--

LOCK TABLES `charges` WRITE;
/*!40000 ALTER TABLE `charges` DISABLE KEYS */;
INSERT INTO `charges` VALUES (1,1,'nggon','Nggon','만수르',10000,'2023-05-06 01:27:28','2023-05-06 01:27:28',1,1);
/*!40000 ALTER TABLE `charges` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `joins`
--

DROP TABLE IF EXISTS `joins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `joins` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `login_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `store_id` int NOT NULL DEFAULT '-1',
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `transferpassword` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `account` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `recommender` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`,`login_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `joins`
--

LOCK TABLES `joins` WRITE;
/*!40000 ALTER TABLE `joins` DISABLE KEYS */;
INSERT INTO `joins` VALUES (1,'gonii',1,'Elektra','972130','9721','01099599771','aaaaa','bbbbbb','01099599771','xmssmx','2023-05-05 00:21:13','2023-05-05 00:21:13',1);
/*!40000 ALTER TABLE `joins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `point_receives`
--

DROP TABLE IF EXISTS `point_receives`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_receives` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sender` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `oldPoint` int unsigned NOT NULL DEFAULT '0',
  `newPoint` int unsigned NOT NULL DEFAULT '0',
  `point` int unsigned NOT NULL DEFAULT '0',
  `oldBalance` int unsigned NOT NULL DEFAULT '0',
  `newBalance` int unsigned NOT NULL DEFAULT '0',
  `desc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `point_receives`
--

LOCK TABLES `point_receives` WRITE;
/*!40000 ALTER TABLE `point_receives` DISABLE KEYS */;
/*!40000 ALTER TABLE `point_receives` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `point_transfers`
--

DROP TABLE IF EXISTS `point_transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point_transfers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `oldPoint` int unsigned NOT NULL DEFAULT '0',
  `newPoint` int unsigned NOT NULL DEFAULT '0',
  `point` int unsigned NOT NULL DEFAULT '0',
  `oldBalance` int unsigned NOT NULL DEFAULT '0',
  `newBalance` int unsigned NOT NULL DEFAULT '0',
  `desc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `point_transfers`
--

LOCK TABLES `point_transfers` WRITE;
/*!40000 ALTER TABLE `point_transfers` DISABLE KEYS */;
INSERT INTO `point_transfers` VALUES (1,1,60000,50000,10000,1040000,1050000,NULL,'2023-05-05 23:11:51'),(2,1,50000,30000,20000,840000,860000,NULL,'2023-05-06 02:05:38');
/*!40000 ALTER TABLE `point_transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `popups`
--

DROP TABLE IF EXISTS `popups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `popups` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `type` tinyint(1) NOT NULL,
  `title` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `url` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `desc` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `popups`
--

LOCK TABLES `popups` WRITE;
/*!40000 ALTER TABLE `popups` DISABLE KEYS */;
/*!40000 ALTER TABLE `popups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_table`
--

DROP TABLE IF EXISTS `sales_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_table` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` int NOT NULL DEFAULT '0',
  `store_id` int NOT NULL DEFAULT '-1',
  `year` int unsigned DEFAULT '0',
  `month` int unsigned NOT NULL DEFAULT '0',
  `day` int unsigned NOT NULL DEFAULT '0',
  `timestamp` bigint unsigned NOT NULL DEFAULT '0',
  `rakes` bigint unsigned NOT NULL DEFAULT '0',
  `bettings` bigint unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_table`
--

LOCK TABLES `sales_table` WRITE;
/*!40000 ALTER TABLE `sales_table` DISABLE KEYS */;
INSERT INTO `sales_table` VALUES (4,1,1,2023,5,6,1683384077538,5700,0,'2023-05-06 23:41:17','2023-05-06 23:41:17'),(5,1,1,2023,5,7,1683385427751,2050,0,'2023-05-07 00:03:47','2023-05-07 00:03:47');
/*!40000 ALTER TABLE `sales_table` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_user`
--

DROP TABLE IF EXISTS `sales_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_user` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `store_id` int NOT NULL DEFAULT '-1',
  `year` int NOT NULL DEFAULT '-1',
  `month` int NOT NULL DEFAULT '-1',
  `day` int NOT NULL DEFAULT '-1',
  `timestamp` bigint unsigned NOT NULL DEFAULT '0',
  `wins` bigint unsigned NOT NULL DEFAULT '0',
  `rakes` bigint unsigned NOT NULL DEFAULT '0',
  `bettings` bigint unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_user`
--

LOCK TABLES `sales_user` WRITE;
/*!40000 ALTER TABLE `sales_user` DISABLE KEYS */;
INSERT INTO `sales_user` VALUES (1,2,1,2023,5,6,1683383663674,122550,6450,0,'2023-05-06 23:34:23','2023-05-06 23:34:23'),(2,1,1,2023,5,6,1683383928959,25650,1350,0,'2023-05-06 23:38:49','2023-05-06 23:38:49'),(3,1,2,2023,5,7,1683385427746,33250,1750,0,'2023-05-07 00:03:47','2023-05-07 00:03:47'),(4,2,2,2023,5,7,1683385674810,5700,300,0,'2023-05-07 00:07:54','2023-05-07 00:07:54');
/*!40000 ALTER TABLE `sales_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `setting`
--

DROP TABLE IF EXISTS `setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `setting` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `sound` int NOT NULL DEFAULT '7',
  `mode` int NOT NULL DEFAULT '0',
  `card_type` int NOT NULL DEFAULT '0',
  `board_type` int NOT NULL DEFAULT '0',
  `bg_type` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
INSERT INTO `setting` VALUES (12,1,7,0,2,1,2),(13,2,7,0,0,0,0);
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
  `user_id` int NOT NULL,
  `hands` int unsigned NOT NULL DEFAULT '0',
  `rakes` int unsigned NOT NULL DEFAULT '0',
  `rollings` bigint unsigned NOT NULL DEFAULT '0',
  `maxPots` int unsigned NOT NULL DEFAULT '0',
  `win` int unsigned NOT NULL DEFAULT '0',
  `fold` int unsigned NOT NULL DEFAULT '0',
  `win_allin` int unsigned DEFAULT '0',
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
  `best_rank` int unsigned DEFAULT '0',
  `best_hands` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ' ',
  `maxPot_hands` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ' ',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statics`
--

LOCK TABLES `statics` WRITE;
/*!40000 ALTER TABLE `statics` DISABLE KEYS */;
INSERT INTO `statics` VALUES (1,1,20,0,0,12150,11,5,0,8,2,1,0,5,5,11,3,2,0,0,0,0,' ',' ','2023-05-07 00:07:58','2023-05-05 13:21:13'),(2,2,20,0,0,36000,7,11,1,4,2,0,0,3,3,9,8,2,1,0,0,12497,'Ah,8d,5h,8c,Ts,9c,5c',' ','2023-05-07 02:36:10','2023-05-06 22:52:48');
/*!40000 ALTER TABLE `statics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `account` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `balance` int unsigned NOT NULL DEFAULT '0',
  `point` int unsigned NOT NULL DEFAULT '0',
  `transfer_percent` int DEFAULT NULL,
  `first_charge` tinyint(1) NOT NULL DEFAULT '0',
  `first_charge_amount` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (2,'SOFT','우리은행','강감찬','000-0000-0000',100000000,1000000000,0,1,100000,'2023-05-05 22:43:15','2023-05-05 22:43:15',1,1);
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tables`
--

DROP TABLE IF EXISTS `tables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tables` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL DEFAULT '-1',
  `name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `type` int unsigned NOT NULL DEFAULT '0',
  `grade` int unsigned NOT NULL DEFAULT '0',
  `password` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `maxPlayers` int unsigned NOT NULL,
  `betTimeLimit` int unsigned NOT NULL,
  `ante` int unsigned NOT NULL DEFAULT '0',
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tables`
--

LOCK TABLES `tables` WRITE;
/*!40000 ALTER TABLE `tables` DISABLE KEYS */;
INSERT INTO `tables` VALUES (1,-1,'HOLDEM1',0,0,'',9,10,1000,1000,2000,40000,200000,1,500,0,0,0,0,0,0,1,'2023-05-05 13:53:17','2023-05-05 13:53:17');
/*!40000 ALTER TABLE `tables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `login_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `charge` int unsigned NOT NULL DEFAULT '0',
  `transfer` int unsigned NOT NULL DEFAULT '0',
  `return` int unsigned NOT NULL DEFAULT '0',
  `transfer_fee` int unsigned NOT NULL DEFAULT '0',
  `oldBalance` int unsigned NOT NULL DEFAULT '0',
  `newBalance` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfers`
--

DROP TABLE IF EXISTS `transfers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfers` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `login_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `amount` int unsigned NOT NULL DEFAULT '0',
  `oldBalance` int unsigned NOT NULL DEFAULT '0',
  `newBalance` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfers`
--

LOCK TABLES `transfers` WRITE;
/*!40000 ALTER TABLE `transfers` DISABLE KEYS */;
INSERT INTO `transfers` VALUES (1,1,'nggon','Nggon',10000,1050000,1040000,'2023-05-06 02:00:26','2023-05-06 02:00:26',1,1),(2,1,'nggon','Nggon',10000,1050000,1040000,'2023-05-06 02:04:09','2023-05-06 02:04:09',1,1),(3,1,'nggon','Nggon',200000,1040000,840000,'2023-05-06 02:04:43','2023-05-06 02:04:43',1,1),(4,1,'nggon','Nggon',100000,860000,760000,'2023-05-06 02:09:49','2023-05-06 02:09:49',1,1);
/*!40000 ALTER TABLE `transfers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `login_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `avatar` int NOT NULL DEFAULT '0',
  `grade` int NOT NULL DEFAULT '0',
  `balance` int unsigned NOT NULL DEFAULT '0',
  `point` int unsigned NOT NULL DEFAULT '0',
  `chip` int unsigned NOT NULL DEFAULT '0',
  `table_id` int DEFAULT NULL,
  `rake` int unsigned NOT NULL DEFAULT '0',
  `store_id` int NOT NULL DEFAULT '0',
  `transferpassword` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `account` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `recommender` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `first_charge` int unsigned NOT NULL DEFAULT '0',
  `charges` bigint unsigned NOT NULL DEFAULT '0',
  `transfers` bigint unsigned NOT NULL DEFAULT '0',
  `transfer_fees` bigint unsigned NOT NULL DEFAULT '0',
  `charge_count` int unsigned NOT NULL DEFAULT '0',
  `transfer_count` int unsigned NOT NULL DEFAULT '0',
  `transfer_fee_count` int unsigned NOT NULL DEFAULT '0',
  `activeSessionId` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `pendingSessionId` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `pendingSessionTimestamp` bigint DEFAULT '0',
  `loginCount` int unsigned NOT NULL DEFAULT '0',
  `loginDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logoutDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`,`login_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nggon','Nggon','972130',7,0,716250,30000,0,-1,5075,2,'9721','0000000','카카오','만수르','00-000-0000','XM5XM5',0,0,0,0,0,0,0,'','',1683385637085,0,'2023-05-07 00:07:17','2023-05-05 12:58:59','2023-05-07 00:07:58','2023-05-05 12:58:59',0,1,1),(2,'nggon2','Nggon2','972130',1,0,1026750,100000,0,-1,4925,2,'9721','0000000','카카오','만수르','00-000-0000','XM5XM5',0,0,0,0,0,0,0,'','',1683385648424,0,'2023-05-07 00:07:28','2023-05-06 22:52:34','2023-05-07 02:36:10','2023-05-06 22:52:34',0,1,1);
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

-- Dump completed on 2023-05-07 13:31:36
