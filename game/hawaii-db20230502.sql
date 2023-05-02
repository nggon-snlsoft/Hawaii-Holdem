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
-- Table structure for table `charges`
--

DROP TABLE IF EXISTS `charges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `charges` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uid` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `amount` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charges`
--

LOCK TABLES `charges` WRITE;
/*!40000 ALTER TABLE `charges` DISABLE KEYS */;
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
  `uid` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `transferpassword` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `account` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `recommender` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `store` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`,`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `joins`
--

LOCK TABLES `joins` WRITE;
/*!40000 ALTER TABLE `joins` DISABLE KEYS */;
INSERT INTO `joins` VALUES (2,'hawaii','holdem','1111','1111','1111111111','bank','holdem','11111111111','bank',1,'2023-05-02 15:27:23','2023-05-02 15:27:23',1);
/*!40000 ALTER TABLE `joins` ENABLE KEYS */;
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
  `title` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  `url` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  `desc` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
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
  `tableId` int unsigned NOT NULL DEFAULT '0',
  `store` int NOT NULL DEFAULT '0',
  `year` int NOT NULL DEFAULT '-1',
  `month` int NOT NULL DEFAULT '-1',
  `day` int NOT NULL DEFAULT '-1',
  `timestamp` bigint unsigned NOT NULL DEFAULT '0',
  `rakes` bigint unsigned NOT NULL DEFAULT '0',
  `bettings` bigint unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_table`
--

LOCK TABLES `sales_table` WRITE;
/*!40000 ALTER TABLE `sales_table` DISABLE KEYS */;
INSERT INTO `sales_table` VALUES (1,1,1,2023,4,30,1682827636675,14599,0,'2023-04-30 13:07:16','2023-04-30 13:07:16'),(3,1,1,2023,5,1,1682912641684,3550,0,'2023-05-01 12:44:01','2023-05-01 12:44:01');
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
  `userId` int unsigned NOT NULL DEFAULT '0',
  `store` int NOT NULL DEFAULT '0',
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_user`
--

LOCK TABLES `sales_user` WRITE;
/*!40000 ALTER TABLE `sales_user` DISABLE KEYS */;
INSERT INTO `sales_user` VALUES (1,13,0,2023,4,29,1682772305115,79800,4200,0,'2023-04-29 21:45:05','2023-04-29 21:45:05'),(2,12,0,2023,4,29,1682772312915,2850,150,0,'2023-04-29 21:45:12','2023-04-29 21:45:12'),(3,13,0,2023,4,30,1682773610742,107351,5649,0,'2023-04-29 22:06:50','2023-04-29 22:06:50'),(4,12,0,2023,4,30,1682773618620,92150,4850,0,'2023-04-29 22:06:58','2023-04-29 22:06:58'),(5,14,1,2023,4,30,1682852979141,114000,6000,0,'2023-04-30 20:09:39','2023-04-30 20:09:39'),(6,13,1,2023,5,1,1682912641684,46550,2450,0,'2023-05-01 12:44:01','2023-05-01 12:44:01'),(7,14,1,2023,5,1,1682913050840,4750,250,0,'2023-05-01 12:50:50','2023-05-01 12:50:50'),(8,12,1,2023,5,1,1682914881080,16150,850,0,'2023-05-01 13:21:21','2023-05-01 13:21:21');
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
  `userId` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `sound` int DEFAULT '1',
  `card_type1` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `card_type2` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `board_type` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `bg_type` int DEFAULT '0',
  `best_hands` varchar(128) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
  PRIMARY KEY (`id`,`userId`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `setting`
--

LOCK TABLES `setting` WRITE;
/*!40000 ALTER TABLE `setting` DISABLE KEYS */;
INSERT INTO `setting` VALUES (9,'12',7,'1','0','1',1,' '),(10,'13',7,'0','0','0',0,' '),(11,'14',7,'0','0','0',0,' ');
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
  `best_hands` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT ' ',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`,`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `statics`
--

LOCK TABLES `statics` WRITE;
/*!40000 ALTER TABLE `statics` DISABLE KEYS */;
INSERT INTO `statics` VALUES (6,12,78,0,0,5400,26,49,0,17,7,0,1,10,10,27,37,11,0,1,0,8797,'Js,4c,Kc,9s,4h,Qs,6d','2023-05-01 15:42:39','2023-04-28 18:05:34'),(7,13,79,0,0,35100,49,32,1,38,9,0,1,13,13,51,19,11,1,1,0,16580,'Jc,4d,2d,4c,8c,4h,As','2023-05-01 15:42:39','2023-04-28 18:25:08'),(8,14,4,0,0,74000,2,2,1,1,0,1,0,0,2,1,1,1,0,0,0,13010,'Kc,Ks,5h,Qs,8d,2d,Qh','2023-05-01 14:34:07','2023-04-30 20:08:40');
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
  `uid` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `name` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `account` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `balance` int unsigned NOT NULL DEFAULT '0',
  `point` int unsigned NOT NULL DEFAULT '0',
  `first_charge` tinyint(1) NOT NULL DEFAULT '0',
  `first_charge_amount` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,'elektra','House','KaKao','Hawaii','000-111-2222-3333',10000000,10000000,0,0,'2023-04-27 13:06:38','2023-04-27 13:06:38',1,0);
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
  `store` int NOT NULL DEFAULT '0',
  `recommender` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `name` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL DEFAULT '',
  `type` int unsigned NOT NULL DEFAULT '0',
  `grade` int unsigned NOT NULL DEFAULT '0',
  `password` varchar(10) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT '',
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tables`
--

LOCK TABLES `tables` WRITE;
/*!40000 ALTER TABLE `tables` DISABLE KEYS */;
INSERT INTO `tables` VALUES (1,1,'XXX','TABLE1',0,0,'',9,10,500,1000,1000,20000,100000,1,500,0,0,0,0,0,0,1,'2023-03-20 18:52:32','2023-03-20 18:52:32'),(2,1,'XXX','TABLE2',0,0,'',9,10,1000,1000,2000,40000,200000,1,500,0,0,0,0,0,0,1,'2023-03-21 11:26:47','2023-03-21 11:26:47'),(3,0,'XXX','TABLE3',0,0,'',6,10,500,1000,1000,20000,100000,1,500,0,0,0,0,0,0,1,'2023-04-28 18:04:51','2023-04-28 18:04:51'),(4,1,'XXX','TABLE4',0,0,'',6,10,1000,1000,2000,40000,200000,1,500,0,0,0,0,0,0,1,'2023-04-28 18:04:51','2023-04-28 18:04:51');
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
  `userId` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uid` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `charge` int unsigned NOT NULL DEFAULT '0',
  `transfer` int unsigned NOT NULL DEFAULT '0',
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
  `userId` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `uid` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `amount` int unsigned NOT NULL DEFAULT '0',
  `oldBalance` int unsigned NOT NULL DEFAULT '0',
  `newBalance` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfers`
--

LOCK TABLES `transfers` WRITE;
/*!40000 ALTER TABLE `transfers` DISABLE KEYS */;
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
  `uid` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `avatar` int NOT NULL DEFAULT '0',
  `grade` int NOT NULL DEFAULT '0',
  `balance` int unsigned NOT NULL DEFAULT '0',
  `point` bigint unsigned NOT NULL DEFAULT '0',
  `chip` int unsigned NOT NULL DEFAULT '0',
  `tableID` int DEFAULT NULL,
  `rake` int unsigned NOT NULL DEFAULT '0',
  `store` int NOT NULL DEFAULT '0',
  `transferpassword` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `account` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `recommender` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `first_charge` int unsigned NOT NULL DEFAULT '0',
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
INSERT INTO `users` VALUES (1,'test1','TEST1','11111111',1,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST1','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-04-28 17:33:09','2023-03-20 12:17:50','2023-04-28 17:33:39','2023-03-20 12:17:50',0,1,0),(2,'test2','TEST2','11111111',2,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST2','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-04-28 17:33:11','2023-03-20 12:45:47','2023-04-28 17:33:39','2023-03-20 12:45:47',0,1,0),(3,'test3','TEST3','11111111',3,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST3','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-04-13 17:59:24','2023-03-20 12:48:23','2023-04-13 18:01:19','2023-03-20 12:48:23',0,1,0),(4,'test4','TEST4','11111111',4,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST4','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-04-28 17:33:12','2023-03-20 12:59:25','2023-04-28 17:34:03','2023-03-20 12:59:25',0,1,0),(5,'test5','TEST5','11111111',5,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST5','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-04-28 17:33:13','2023-03-20 13:00:18','2023-04-28 17:33:59','2023-03-20 13:00:18',0,1,0),(6,'test6','TEST6','11111111',6,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST6','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-03-20 13:01:54','2023-03-20 13:01:54','2023-03-20 13:01:54','2023-03-20 13:01:54',0,1,0),(7,'test7','TEST7','11111111',7,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST7','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-03-20 13:03:27','2023-03-20 13:03:27','2023-03-20 13:03:27','2023-03-20 13:03:27',0,1,0),(8,'test8','TEST8','11111111',8,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST8','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-03-20 13:04:33','2023-03-20 13:04:33','2023-03-20 13:04:33','2023-03-20 13:04:33',0,1,0),(9,'test9','TEST9','11111111',9,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST10','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-03-20 13:14:09','2023-03-20 13:14:09','2023-03-20 13:14:09','2023-03-20 13:14:09',0,1,0),(10,'test10','TEST10','11111111',10,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST11','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-03-20 13:15:11','2023-03-20 13:15:11','2023-03-20 13:15:11','2023-03-20 13:15:11',0,1,0),(11,'david','DAVID','11111111',11,0,1000000,0,0,-1,0,1,'1111','010-1111-2222','카카오뱅크','TEST12','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-03-20 13:15:50','2023-03-20 13:15:50','2023-03-20 13:15:50','2023-03-20 13:15:50',0,1,0),(12,'gonii','Elektra1','972130',12,0,885900,0,0,-1,13273,1,'1111','010-1111-2222','카카오뱅크','TEST13','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-05-01 15:42:17','2023-03-20 13:22:34','2023-05-01 15:42:39','2023-03-20 13:22:34',0,1,0),(13,'nggon','Elektra2','972130',13,0,1003551,0,0,-1,14622,1,'1111','010-1111-2222','카카오뱅크','TEST14','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-05-01 15:42:18','2023-03-20 13:22:57','2023-05-01 15:42:39','2023-03-20 13:22:57',0,1,0),(14,'nggon2','Elektra3','972130',14,0,1073750,0,0,-1,2248,1,'1111','010-1111-2222','카카오뱅크','TEST15','00-000-0000-0000','XXXX-YYYY',0,0,0,0,0,'','',0,0,'2023-05-01 14:33:43','2023-03-20 13:24:21','2023-05-01 14:34:07','2023-03-20 13:24:21',0,1,0);
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

-- Dump completed on 2023-05-02 17:43:08
