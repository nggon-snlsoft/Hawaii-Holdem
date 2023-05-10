-- MySQL dump 10.13  Distrib 8.0.27, for Win64 (x86_64)
--
-- Host: localhost    Database: holdem
-- ------------------------------------------------------
-- Server version	8.0.27

create database holdem;
use holdem;


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
-- Table structure for table `buyins`
--

DROP TABLE IF EXISTS `buyins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `buyins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `table_id` int NOT NULL DEFAULT '-1',
  `oldBalance` int unsigned NOT NULL DEFAULT '0',
  `balance` int unsigned NOT NULL DEFAULT '0',
  `oldChip` int unsigned NOT NULL DEFAULT '0',
  `chip` int unsigned NOT NULL DEFAULT '0',
  `amount` int unsigned NOT NULL DEFAULT '0',
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `desc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `desc` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `popups`
--

DROP TABLE IF EXISTS `popups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `popups` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL DEFAULT '-1',
  `type` tinyint(1) NOT NULL DEFAULT '0',
  `title` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `url` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `desc` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sales_table`
--

DROP TABLE IF EXISTS `sales_table`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales_table` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `table_id` int NOT NULL DEFAULT '-1',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `store_code`
--

DROP TABLE IF EXISTS `store_code`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `store_code` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL DEFAULT '-1',
  `code` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `expireDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `account` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `balance` int unsigned NOT NULL DEFAULT '0',
  `point` int unsigned NOT NULL DEFAULT '0',
  `transfer_percent` int DEFAULT '0',
  `first_charge` tinyint(1) NOT NULL DEFAULT '0',
  `first_charge_amount` int unsigned NOT NULL DEFAULT '0',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `pending` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `maxPlayers` int unsigned NOT NULL DEFAULT '9',
  `betTimeLimit` int unsigned NOT NULL DEFAULT '10',
  `ante` int unsigned NOT NULL DEFAULT '0',
  `smallBlind` int unsigned NOT NULL DEFAULT '0',
  `bigBlind` int unsigned NOT NULL DEFAULT '0',
  `minStakePrice` int unsigned NOT NULL DEFAULT '0',
  `maxStakePrice` int unsigned NOT NULL DEFAULT '0',
  `useRake` tinyint(1) NOT NULL DEFAULT '0',
  `rake` int DEFAULT '0',
  `useRakeCap` tinyint(1) NOT NULL DEFAULT '0',
  `rakeCap1` int unsigned NOT NULL DEFAULT '0',
  `rakeCap2` int unsigned NOT NULL DEFAULT '0',
  `rakeCap3` int unsigned NOT NULL DEFAULT '0',
  `useFlopRake` tinyint(1) NOT NULL DEFAULT '0',
  `disable` tinyint(1) NOT NULL DEFAULT '0',
  `alive` tinyint(1) NOT NULL DEFAULT '1',
  `updateDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


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
  `token` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `avatar` int NOT NULL DEFAULT '0',
  `grade` int NOT NULL DEFAULT '0',
  `balance` int unsigned NOT NULL DEFAULT '0',
  `point` int unsigned NOT NULL DEFAULT '0',
  `chip` int unsigned NOT NULL DEFAULT '0',
  `table_id` int NOT NULL DEFAULT '-1',
  `rake` int unsigned NOT NULL DEFAULT '0',
  `store_id` int NOT NULL DEFAULT '-1',
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-05-10  1:51:20
