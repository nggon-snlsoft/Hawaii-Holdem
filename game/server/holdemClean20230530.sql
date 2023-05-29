-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 29, 2023 at 05:54 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.0.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `holdem`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(10) UNSIGNED NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `login_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `login_ip` varchar(30) NOT NULL DEFAULT '',
  `password` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `loginCount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `disable` tinyint(1) NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `store_id`, `login_id`, `login_ip`, `password`, `name`, `type`, `status`, `loginCount`, `disable`, `updateDate`, `createDate`) VALUES
(1, 1, 'hwadmin', '', 'hwadmin123', 'hawaiiholdem', 0, 0, 0, 0, '2023-05-30 00:31:21', '2023-05-30 00:31:21');

-- --------------------------------------------------------

--
-- Table structure for table `buyins`
--

CREATE TABLE `buyins` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `table_id` int(11) NOT NULL DEFAULT -1,
  `oldBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `balance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `oldChip` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `chip` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `charges`
--

CREATE TABLE `charges` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_id` varchar(20) NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp(),
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `pending` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `distributors`
--

CREATE TABLE `distributors` (
  `id` int(10) UNSIGNED NOT NULL,
  `admin_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `commision` int(11) NOT NULL DEFAULT 0,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `account` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `joins`
--

CREATE TABLE `joins` (
  `id` int(10) UNSIGNED NOT NULL,
  `login_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `distributor_id` int(11) NOT NULL DEFAULT -1,
  `partner_id` int(11) NOT NULL DEFAULT -1,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `transferpassword` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `account` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `recommender` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `join_ip` varchar(30) NOT NULL DEFAULT '',
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp(),
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `deny` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `partners`
--

CREATE TABLE `partners` (
  `id` int(10) UNSIGNED NOT NULL,
  `admin_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `distributor_id` int(11) NOT NULL DEFAULT -1,
  `type` int(11) NOT NULL DEFAULT 0,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `commision` int(11) NOT NULL DEFAULT 0,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `account` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `code` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `kakao` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `telegram` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `point_receives`
--

CREATE TABLE `point_receives` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `sender` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `oldPoint` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `newPoint` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `point` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `oldBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `newBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `desc` varchar(20) DEFAULT '',
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `point_transfers`
--

CREATE TABLE `point_transfers` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `oldPoint` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `newPoint` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `point` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `oldBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `newBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `desc` varchar(20) DEFAULT '',
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `popups`
--

CREATE TABLE `popups` (
  `id` int(10) UNSIGNED NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `type` tinyint(1) NOT NULL DEFAULT 0,
  `title` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `url` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `desc` text DEFAULT NULL,
  `disable` tinyint(1) NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `title` text DEFAULT NULL,
  `question` text DEFAULT NULL,
  `answer` text DEFAULT NULL,
  `unread` tinyint(10) DEFAULT 1,
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `pending` tinyint(1) NOT NULL DEFAULT 1,
  `questionDate` datetime NOT NULL DEFAULT current_timestamp(),
  `answerDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_table`
--

CREATE TABLE `sales_table` (
  `id` int(10) UNSIGNED NOT NULL,
  `table_id` int(11) NOT NULL DEFAULT -1,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `year` int(10) UNSIGNED DEFAULT 0,
  `month` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `day` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `timestamp` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `rakes` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `bettings` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_user`
--

CREATE TABLE `sales_user` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `distributor_id` int(11) NOT NULL DEFAULT -1,
  `partner_id` int(11) NOT NULL DEFAULT -1,
  `year` int(11) NOT NULL DEFAULT -1,
  `month` int(11) NOT NULL DEFAULT -1,
  `day` int(11) NOT NULL DEFAULT -1,
  `timestamp` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `charge` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `point` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `transfer` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `return` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `wins` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `rakes` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `bettings` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `rollings` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `rake_back` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `useTicket` tinyint(1) NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `setting`
--

CREATE TABLE `setting` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `sound` int(11) NOT NULL DEFAULT 7,
  `mode` int(11) NOT NULL DEFAULT 0,
  `card_type` int(11) NOT NULL DEFAULT 0,
  `board_type` int(11) NOT NULL DEFAULT 0,
  `bg_type` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `statics`
--

CREATE TABLE `statics` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `hands` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `rakes` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `rollings` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `maxPots` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `fold` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win_allin` int(10) UNSIGNED DEFAULT 0,
  `win_preflop` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win_flop` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win_turn` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win_river` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win_dealer` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win_smallBlind` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `win_bigBlind` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `fold_preflop` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `fold_flop` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `fold_turn` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `fold_river` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `draw` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `best_rank` int(10) UNSIGNED DEFAULT 0,
  `best_hands` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ' ',
  `maxPot_hands` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ' ',
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stores`
--

CREATE TABLE `stores` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `account` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `telegram` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `kakao` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `balance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `point` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `transfer_percent` int(11) DEFAULT NULL,
  `first_charge` tinyint(1) NOT NULL DEFAULT 0,
  `first_charge_amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp(),
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `pending` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `stores`
--

INSERT INTO `stores` (`id`, `name`, `bank`, `holder`, `account`, `telegram`, `kakao`, `balance`, `point`, `transfer_percent`, `first_charge`, `first_charge_amount`, `updateDate`, `createDate`, `alive`, `pending`) VALUES
(1, '0', '0', '0', '0', 'HWHD114', 'HWHD114', 0, 0, 0, 0, 0, '2023-05-10 03:03:18', '2023-05-10 03:03:18', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `store_code`
--

CREATE TABLE `store_code` (
  `id` int(10) UNSIGNED NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `code` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `expireDate` datetime DEFAULT current_timestamp(),
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

CREATE TABLE `tables` (
  `id` int(10) UNSIGNED NOT NULL,
  `store_id` int(11) NOT NULL DEFAULT -1,
  `name` varchar(30) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `type` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `grade` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `password` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `maxPlayers` int(10) UNSIGNED NOT NULL DEFAULT 9,
  `betTimeLimit` int(10) UNSIGNED NOT NULL DEFAULT 10,
  `ante` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `smallBlind` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `bigBlind` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `minStakePrice` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `maxStakePrice` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `useRake` tinyint(1) NOT NULL DEFAULT 0,
  `rake` int(11) DEFAULT 0,
  `rake_back` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `useRakeCap` tinyint(1) NOT NULL DEFAULT 0,
  `rakeCap1` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `rakeCap2` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `rakeCap3` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `useFlopRake` tinyint(1) NOT NULL DEFAULT 0,
  `disable` tinyint(1) NOT NULL DEFAULT 0,
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `store_id`, `name`, `type`, `grade`, `password`, `maxPlayers`, `betTimeLimit`, `ante`, `smallBlind`, `bigBlind`, `minStakePrice`, `maxStakePrice`, `useRake`, `rake`, `rake_back`, `useRakeCap`, `rakeCap1`, `rakeCap2`, `rakeCap3`, `useFlopRake`, `disable`, `alive`, `updateDate`, `createDate`) VALUES
(1, 1, 'HOLDEM1', 0, 0, '', 9, 10, 500, 500, 1000, 30000, 300000, 1, 550, 50, 0, 0, 0, 0, 0, 0, 1, '2023-05-10 03:29:27', '2023-05-10 03:29:27'),
(2, 1, 'HOLDEM2', 0, 0, '', 9, 10, 1000, 1000, 2000, 100000, 500000, 1, 550, 50, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:44:03', '2023-05-22 13:44:03'),
(3, 1, 'HOLDEM3', 0, 0, '', 6, 10, 2000, 2000, 4000, 200000, 600000, 1, 550, 50, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:44:03', '2023-05-22 13:44:03'),
(4, 1, 'HOLDEM4', 0, 0, '', 6, 10, 5000, 5000, 10000, 500000, 1500000, 1, 550, 50, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:44:03', '2023-05-22 13:44:03');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_id` varchar(20) NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `charge` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `point` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `transfer` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `return` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `transfer_fee` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `oldBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `newBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp(),
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `pending` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_id` varchar(20) NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `amount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `oldBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `newBalance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp(),
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `pending` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `login_id` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `nickname` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `password` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `login_ip` varchar(30) NOT NULL DEFAULT '',
  `token` varchar(200) NOT NULL DEFAULT '',
  `avatar` int(11) NOT NULL DEFAULT 0,
  `grade` int(11) NOT NULL DEFAULT 0,
  `balance` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `point` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `chip` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `table_id` int(11) NOT NULL DEFAULT -1,
  `wins` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `bettings` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `rollings` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `rake` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `rake_back` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `store_id` int(11) NOT NULL DEFAULT 1,
  `distributor_id` int(11) NOT NULL DEFAULT -1,
  `partner_id` int(11) NOT NULL DEFAULT -1,
  `transferpassword` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `phone` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `bank` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `holder` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `account` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `recommender` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `join_ip` varchar(30) NOT NULL DEFAULT '',
  `first_charge` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `charges` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `transfers` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `transfer_fees` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `charge_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `transfer_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `transfer_fee_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `activeSessionId` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `pendingSessionId` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `pendingSessionTimestamp` bigint(20) DEFAULT 0,
  `loginCount` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `loginDate` datetime NOT NULL DEFAULT current_timestamp(),
  `logoutDate` datetime NOT NULL DEFAULT current_timestamp(),
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp(),
  `disable` tinyint(1) NOT NULL DEFAULT 0,
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `pending` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `buyins`
--
ALTER TABLE `buyins`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `charges`
--
ALTER TABLE `charges`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `distributors`
--
ALTER TABLE `distributors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `joins`
--
ALTER TABLE `joins`
  ADD PRIMARY KEY (`id`,`login_id`);

--
-- Indexes for table `partners`
--
ALTER TABLE `partners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `point_receives`
--
ALTER TABLE `point_receives`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `point_transfers`
--
ALTER TABLE `point_transfers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `popups`
--
ALTER TABLE `popups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales_table`
--
ALTER TABLE `sales_table`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales_user`
--
ALTER TABLE `sales_user`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `setting`
--
ALTER TABLE `setting`
  ADD PRIMARY KEY (`id`,`user_id`);

--
-- Indexes for table `statics`
--
ALTER TABLE `statics`
  ADD PRIMARY KEY (`id`,`user_id`);

--
-- Indexes for table `stores`
--
ALTER TABLE `stores`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `store_code`
--
ALTER TABLE `store_code`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`,`login_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `buyins`
--
ALTER TABLE `buyins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `charges`
--
ALTER TABLE `charges`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `distributors`
--
ALTER TABLE `distributors`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `joins`
--
ALTER TABLE `joins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `point_receives`
--
ALTER TABLE `point_receives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `point_transfers`
--
ALTER TABLE `point_transfers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `popups`
--
ALTER TABLE `popups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_table`
--
ALTER TABLE `sales_table`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_user`
--
ALTER TABLE `sales_user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `setting`
--
ALTER TABLE `setting`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `statics`
--
ALTER TABLE `statics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `store_code`
--
ALTER TABLE `store_code`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
