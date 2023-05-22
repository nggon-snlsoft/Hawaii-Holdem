-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 21, 2023 at 02:19 PM
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
(1, 1, 'admin', '', '1111', 'admin1', 0, 0, 0, 0, '2023-05-10 03:01:56', '2023-05-10 03:01:56'),
(9, -1, 'ttt', '', 'ttt', 'ttt', 1, 0, 0, 0, '2023-05-17 15:35:59', '2023-05-17 15:35:59'),
(11, -1, 'pp', '', 'pp', 'pp', 2, 0, 0, 0, '2023-05-17 16:38:55', '2023-05-17 16:38:55'),
(12, -1, 'ppp', '', 'ppp', 'ppp', 2, 0, 0, 0, '2023-05-17 16:56:27', '2023-05-17 16:56:27'),
(13, -1, 'test', '', 'test', 'test', 1, 0, 0, 0, '2023-05-18 18:43:54', '2023-05-18 18:43:54'),
(14, -1, 'abcd1', '', 'abcd1', 'abcd1', 2, 0, 0, 0, '2023-05-18 18:45:12', '2023-05-18 18:45:12'),
(15, -1, 'chong1', '', 'chong1', 'chong1', 2, 0, 0, 0, '2023-05-18 21:04:42', '2023-05-18 21:04:42'),
(16, -1, 'nggon', '', '972130', 'nggon', 1, 0, 0, 0, '2023-05-18 23:56:57', '2023-05-18 23:56:57'),
(17, 1, 'nggon2', '', '972130', 'nggon2', 2, 0, 0, 0, '2023-05-19 00:02:51', '2023-05-19 00:02:51'),
(18, -1, 'test001', '', 'test001', 'test001', 1, 0, 0, 1, '2023-05-20 17:04:53', '2023-05-20 17:04:53'),
(19, 1, 'nopnop', '', '1111', 'nop', 1, 0, 0, 0, '2023-05-20 20:51:36', '2023-05-20 20:51:36'),
(20, -1, 'atest', '', 'atest', 'atest', 2, 0, 0, 0, '2023-05-21 13:30:39', '2023-05-21 13:30:39'),
(21, -1, 'nk123', '', '1234', '1234', 1, 0, 0, 0, '2023-05-21 13:36:30', '2023-05-21 13:36:30'),
(22, -1, 'btest', '', '1111', 'btest', 1, 0, 0, 0, '2023-05-21 13:38:31', '2023-05-21 13:38:31'),
(23, -1, 'ctest', '', '1111', 'ctest', 2, 0, 0, 0, '2023-05-21 13:40:53', '2023-05-21 13:40:53'),
(24, -1, 'buser', '', '1111', 'buser', 1, 0, 0, 0, '2023-05-21 18:59:59', '2023-05-21 18:59:59'),
(25, -1, 'cuser', '', '1111', 'cuser', 2, 0, 0, 1, '2023-05-21 19:01:07', '2023-05-21 19:01:07'),
(26, -1, 'duser', '', '1111', 'duser', 2, 0, 0, 0, '2023-05-21 19:21:11', '2023-05-21 19:21:11'),
(27, -1, 'euser', '', '1111', 'euser', 2, 0, 0, 0, '2023-05-21 19:33:34', '2023-05-21 19:33:34');

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

--
-- Dumping data for table `buyins`
--

INSERT INTO `buyins` (`id`, `user_id`, `table_id`, `oldBalance`, `balance`, `oldChip`, `chip`, `amount`, `createDate`) VALUES
(1, 1, 1, 9910000, 9870000, 0, 40000, 40000, '2023-05-10 12:29:42'),
(2, 1, 1, 9910000, 9870000, 0, 40000, 40000, '2023-05-10 13:36:38'),
(3, 2, 1, 1000000, 960000, 0, 40000, 40000, '2023-05-10 13:38:21'),
(4, 1, 1, 9908000, 9868000, 0, 40000, 40000, '2023-05-10 13:42:16'),
(5, 2, 1, 1000700, 960700, 0, 40000, 40000, '2023-05-10 13:53:30'),
(6, 1, 1, 9908850, 9868850, 0, 40000, 40000, '2023-05-10 13:53:32'),
(7, 2, 1, 1002500, 962500, 0, 40000, 40000, '2023-05-10 13:56:04'),
(8, 1, 1, 9906850, 9866850, 0, 40000, 40000, '2023-05-10 13:56:05'),
(9, 1, 1, 9905850, 9865850, 0, 40000, 40000, '2023-05-10 13:58:37'),
(10, 2, 1, 1003350, 963350, 0, 40000, 40000, '2023-05-10 13:58:39'),
(11, 2, 1, 998350, 958350, 0, 40000, 40000, '2023-05-10 14:02:52'),
(12, 1, 1, 9907450, 9867450, 0, 40000, 40000, '2023-05-10 14:02:54'),
(13, 1, 1, 9867450, 9827450, 0, 40000, 40000, '2023-05-10 14:18:03'),
(14, 2, 1, 1034350, 994350, 0, 40000, 40000, '2023-05-10 14:18:07'),
(15, 1, 1, 9872350, 9832350, 0, 40000, 40000, '2023-05-10 14:34:51'),
(16, 2, 1, 1028850, 988850, 0, 40000, 40000, '2023-05-10 14:34:53'),
(17, 2, 1, 1025850, 985850, 0, 40000, 40000, '2023-05-10 18:23:57'),
(18, 4, 1, 110000, 70000, 0, 40000, 40000, '2023-05-10 18:24:00'),
(19, 4, 1, 113400, 73400, 0, 40000, 40000, '2023-05-10 18:29:28'),
(20, 2, 1, 1020850, 980850, 0, 40000, 40000, '2023-05-10 18:29:45'),
(21, 1, 1, 9865000, 9825000, 0, 40000, 40000, '2023-05-15 18:36:53'),
(22, 6, 1, 888889, 848889, 0, 40000, 40000, '2023-05-16 22:54:59'),
(23, 6, 1, 200000, 160000, 0, 40000, 40000, '2023-05-19 11:58:08'),
(24, 9, 1, 90000, 50000, 0, 40000, 40000, '2023-05-19 11:58:09'),
(25, 9, 1, 50000, 10000, 0, 40000, 40000, '2023-05-19 12:12:26'),
(26, 9, 1, 50000, 0, 0, 50000, 50000, '2023-05-19 13:19:44'),
(27, 12, 1, 90000, 50000, 0, 40000, 40000, '2023-05-20 21:28:45'),
(28, 9, 1, 50000, 10000, 0, 40000, 40000, '2023-05-20 21:28:46'),
(29, 9, 1, 69750, 29750, 0, 40000, 40000, '2023-05-20 21:41:49'),
(30, 12, 1, 66100, 26100, 0, 40000, 40000, '2023-05-20 21:41:51'),
(31, 12, 1, 236100, 196100, 0, 40000, 40000, '2023-05-21 13:49:53'),
(32, 9, 1, 105750, 65750, 0, 40000, 40000, '2023-05-21 13:49:54'),
(33, 13, 1, 55000, 15000, 0, 40000, 40000, '2023-05-21 14:10:32'),
(34, 15, 1, 80000, 40000, 0, 40000, 40000, '2023-05-21 14:23:12'),
(35, 13, 1, 55000, 8800, 0, 46200, 46200, '2023-05-21 14:23:22'),
(36, 15, 1, 40000, 1200, 1200, 40000, 38800, '2023-05-21 14:24:22'),
(37, 12, 1, 251602, 211602, 0, 40000, 40000, '2023-05-21 14:50:24'),
(38, 16, 1, 70000, 0, 0, 70000, 70000, '2023-05-21 16:25:12'),
(39, 17, 1, 70000, 30000, 0, 40000, 40000, '2023-05-21 16:25:35'),
(40, 17, 1, 73900, 33900, 0, 40000, 40000, '2023-05-21 16:28:11'),
(41, 17, 1, 33900, 0, 41700, 75600, 33900, '2023-05-21 16:31:31'),
(42, 6, 1, 236000, 196000, 0, 40000, 40000, '2023-05-21 18:01:09'),
(43, 6, 1, 236000, 196000, 0, 40000, 40000, '2023-05-21 18:29:58'),
(44, 18, 1, 450000, 410000, 0, 40000, 40000, '2023-05-21 19:18:04'),
(45, 19, 1, 300000, 260000, 0, 40000, 40000, '2023-05-21 19:18:16');

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

--
-- Dumping data for table `charges`
--

INSERT INTO `charges` (`id`, `user_id`, `login_id`, `nickname`, `holder`, `amount`, `updateDate`, `createDate`, `alive`, `pending`) VALUES
(1, 1, 'test1', 'TEST1', '00000', 100000, '2023-05-10 12:28:07', '2023-05-10 12:28:07', 1, 0),
(2, 2, 'test2', 'TEST2', '11111', 10000, '2023-05-10 15:13:00', '2023-05-10 15:13:00', 1, 0),
(3, 1, 'test1', 'TEST1', '00000', 100000, '2023-05-10 16:14:26', '2023-05-10 16:14:26', 1, 0),
(4, 4, 'htest1', 'htest1', '김땡땡', 100000, '2023-05-10 18:11:00', '2023-05-10 18:11:00', 1, 0),
(5, 5, 'cp123', 'CP123', '아무개', 10000, '2023-05-16 18:25:44', '2023-05-16 18:25:44', 1, 0),
(6, 6, 'nggon', 'NGGON', 'holder', 100000, '2023-05-16 19:28:31', '2023-05-16 19:28:31', 1, 0),
(7, 6, 'nggon', 'NGGON', 'holder', 100000, '2023-05-16 22:54:23', '2023-05-16 22:54:23', 1, 0),
(8, 5, 'cp123', 'CP123', '아무개', 50000, '2023-05-16 23:13:42', '2023-05-16 23:13:42', 1, 0),
(9, 6, 'nggon', 'NGGON', 'holder', 100000, '2023-05-17 11:11:48', '2023-05-17 11:11:48', 1, 0),
(10, 8, 'user1', 'user1', '1234', 100000, '2023-05-18 22:42:09', '2023-05-18 22:42:09', 1, 0),
(11, 9, 'qwerty', 'qwerty', 'qwerty', 100000, '2023-05-19 10:50:51', '2023-05-19 10:50:51', 1, 0),
(12, 9, 'qwerty', 'qwerty', 'qwerty', 100000, '2023-05-19 13:18:01', '2023-05-19 13:18:01', 1, 0),
(13, 12, 'test123', 'test123', '2222', 100000, '2023-05-20 20:39:09', '2023-05-20 20:39:09', 1, 0),
(14, 12, 'test123', 'test123', '2222', 10000, '2023-05-21 13:10:45', '2023-05-21 13:10:45', 1, 0),
(15, 13, 'ctest1', 'ctest1', '아무개', 55000, '2023-05-21 13:57:28', '2023-05-21 13:57:28', 1, 0),
(16, 15, 'ctest2', 'ctest2', '아무개', 30000, '2023-05-21 14:18:54', '2023-05-21 14:18:54', 1, 0),
(17, 15, 'ctest2', 'ctest2', '아무개', 50000, '2023-05-21 14:22:38', '2023-05-21 14:22:38', 1, 0),
(18, 13, 'ctest1', 'ctest1', 'ctest1', 100000, '2023-05-21 15:41:45', '2023-05-21 15:41:45', 0, 0),
(19, 15, 'ctest2', 'ctest2', 'ctest2', 80000, '2023-05-21 15:41:58', '2023-05-21 15:41:58', 0, 0),
(20, 13, 'ctest1', 'ctest1', '아무개1', 70000, '2023-05-21 15:44:34', '2023-05-21 15:44:34', 0, 0),
(21, 15, 'ctest2', 'ctest2', '아무개2', 90000, '2023-05-21 15:44:47', '2023-05-21 15:44:47', 1, 0),
(22, 13, 'ctest1', 'ctest1', '아무개1', 200000, '2023-05-21 15:58:49', '2023-05-21 15:58:49', 0, 0),
(23, 13, 'ctest1', 'ctest1', '아무개1', 150000, '2023-05-21 15:59:20', '2023-05-21 15:59:20', 1, 0),
(24, 16, 'ctest3', 'ctest3', '아무개3', 100000, '2023-05-21 16:05:52', '2023-05-21 16:05:52', 1, 0),
(25, 17, 'ctest4', 'ctest4', '아무개4', 80000, '2023-05-21 16:06:01', '2023-05-21 16:06:01', 0, 0),
(26, 16, 'ctest3', 'ctest3', 'test3', 30000, '2023-05-21 16:32:33', '2023-05-21 16:32:33', 1, 0),
(27, 17, 'ctest4', 'ctest4', 'test4', 20000, '2023-05-21 16:33:01', '2023-05-21 16:33:01', 1, 0),
(28, 16, 'ctest3', 'ctest3', 'test3', 40000, '2023-05-21 16:35:04', '2023-05-21 16:35:04', 1, 0),
(29, 16, 'ctest3', 'ctest3', 'ctest3', 30000, '2023-05-21 17:02:31', '2023-05-21 17:02:31', 0, 0),
(30, 16, 'ctest3', 'ctest3', 'test3', 100000, '2023-05-21 17:02:59', '2023-05-21 17:02:59', 1, 0),
(31, 16, 'ctest3', 'ctest3', 'ㅅㄷㄴㅅ3', 25000, '2023-05-21 17:11:52', '2023-05-21 17:11:52', 1, 0),
(32, 19, 'cuser2', 'cuser2', '아무개2', 300000, '2023-05-21 19:10:55', '2023-05-21 19:10:55', 1, 0),
(33, 18, 'cuser1', 'cuser1', '아무개1', 500000, '2023-05-21 19:11:57', '2023-05-21 19:11:57', 1, 0);

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
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `distributors`
--

INSERT INTO `distributors` (`id`, `admin_id`, `store_id`, `name`, `commision`, `alive`, `updateDate`, `createDate`) VALUES
(1, 9, 1, 't', 50, 1, '2023-05-17 15:53:23', '2023-05-17 15:53:23'),
(2, 13, 1, 'test', 1, 1, '2023-05-18 18:43:54', '2023-05-18 18:43:54'),
(3, 16, 1, 'nggon', 1, 1, '2023-05-18 23:56:57', '2023-05-18 23:56:57'),
(4, 18, 1, 'test001', 2, 1, '2023-05-20 17:04:53', '2023-05-20 17:04:53'),
(5, 19, 1, 'nop', 5, 1, '2023-05-20 20:51:36', '2023-05-20 20:51:36'),
(6, 21, -1, '1234', 450, 1, '2023-05-21 13:36:30', '2023-05-21 13:36:30'),
(7, 22, -1, 'btest', 1100, 1, '2023-05-21 13:38:31', '2023-05-21 13:38:31'),
(8, 24, -1, 'buser', 1500, 1, '2023-05-21 18:59:59', '2023-05-21 18:59:59');

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
  `alive` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `joins`
--

INSERT INTO `joins` (`id`, `login_id`, `store_id`, `distributor_id`, `partner_id`, `nickname`, `password`, `transferpassword`, `phone`, `bank`, `holder`, `account`, `recommender`, `join_ip`, `updateDate`, `createDate`, `alive`) VALUES
(1, 'test3', 1, -1, -1, 'TEST2', '1111', '1111', '010-0000-0000', '우리은행', '아이유', '000-000-0000', 'hello', '', '2023-05-10 12:37:37', '2023-05-10 12:37:37', 0),
(2, 'cp1234', 0, -1, -1, 'cp1234', '1234', '1234', '0101111111', '하나', '김땡땡', '123123123123123', '1234', '', '2023-05-10 15:19:59', '2023-05-10 15:19:59', 1),
(3, 'htest1', 1, -1, -1, 'htest1', '1234', '1234', '0101112222', '하나', '김땡땡', '123456789', 'hello', '', '2023-05-10 18:00:32', '2023-05-10 18:00:32', 0),
(4, 'cp123', 1, -1, -1, 'CP123', '1234', '1111', '0101111111', '하나', '아무개', '111222333333', 'hwhd', '', '2023-05-16 18:24:47', '2023-05-16 18:24:47', 0),
(5, 'alcls45679', 1, -1, -1, 'alclssha', 'ccc456', '4977', '01076081735', '신한은행', '최강수', '110371913973', 'hwhd', '', '2023-05-16 18:48:56', '2023-05-16 18:48:56', 0),
(6, 'wlsgurdl', 1, -1, -1, 'holhol', '1eq2w34r', '8738', '01089139914', '신한', '조진혁', '110528738437', 'hwhd', '', '2023-05-16 18:52:24', '2023-05-16 18:52:24', 1),
(7, 'konkon12', 1, -1, -1, '내가왔다', '1q2w3e4r', '1q2w3e4r', '01071178558', '신한', '김동건', '110375170264', 'hwhd', '', '2023-05-16 18:52:59', '2023-05-16 18:52:59', 1),
(8, 'rjs5001', 1, -1, -1, 'rjs123', 'rjs112233', '11223344', '01092475001', '카카오', '장동건', '3333039657221', 'hwhd', '', '2023-05-16 19:00:21', '2023-05-16 19:00:21', 1),
(9, 'nggon', 1, -1, -1, 'NGGON', '972130', '1111', '12321312321', '우리', 'holder', '11111111', 'hwhd', '', '2023-05-16 19:19:55', '2023-05-16 19:19:55', 0),
(10, 'nggon1', 1, -1, -1, 'nggon2', '1111', '123213213', '123123123', '123123213', '12312321', '123123213', 'hwhd', '', '2023-05-16 19:21:38', '2023-05-16 19:21:38', 1),
(11, 'new1', 1, 1, 2, 'new1', 'new1', '1234', '1231231234', '123', '1234', '1231231234', 'ppp1', '', '2023-05-18 21:23:15', '2023-05-18 21:23:15', 1),
(12, 'user1', -1, 1, 4, 'user1', 'user1', '1234', '1231231234', '123', '1234', '1231231234', 'qwer', '', '2023-05-18 22:41:16', '2023-05-18 22:41:16', 0),
(13, 'nggon2', 1, 1, 5, 'nggon3', '1111', '0000', '0000000123', 'kkkk123', 'kkkk123', 'kkkkkkkk123', 'kkkk', '', '2023-05-19 00:07:28', '2023-05-19 00:07:28', 1),
(14, 'qwerty', 1, 1, 5, 'qwerty', 'qwerty', 'qweerty', 'qwerty', 'qwerty', 'qwerty', 'qwerty', 'kkkk', '', '2023-05-19 10:41:33', '2023-05-19 10:41:33', 0),
(15, 'qwerty1', 1, 1, 5, 'qwerty1', 'qwerty1', 'qwerty1', 'qwerty1', 'qwerty1', 'qwerty1', 'qwerty1', 'kkkk', '', '2023-05-19 11:51:25', '2023-05-19 11:51:25', 0),
(16, 'test123', 1, 1, 5, 'test123', '1111', '1111', '11111111', '11111111', '1111', '11111111', 'kkkk', '39.125.195.144', '2023-05-20 20:26:56', '2023-05-20 20:26:56', 0),
(17, 'test001', 1, 1, 5, 'test001', '1111', '1111', '010-9999-8888', '카카오 뱅크', '김우빈', '010-9999-8888', 'kkkk', '39.118.41.186', '2023-05-21 12:17:52', '2023-05-21 12:17:52', 1),
(18, 'atest1', -1, 3, 6, 'atest1', 'atest1', '1111', '1112223333', '123', '아무개', '123123123456', 'adfa', '211.234.181.193', '2023-05-21 13:32:08', '2023-05-21 13:32:08', 0),
(19, 'ctest1', -1, 7, 7, 'ctest1', '1111', '1111', '1231231234', '123', '아무개', '123123123456', 'aadd', '211.234.181.193', '2023-05-21 13:43:51', '2023-05-21 13:43:51', 0),
(20, 'ctest2', -1, 7, 7, 'ctest2', '1111', '1111', '1112223333', '123', '아무개', '123123123456', 'aadd', '211.234.198.76', '2023-05-21 14:12:47', '2023-05-21 14:12:47', 0),
(21, 'ctest3', -1, 7, 7, 'ctest3', '1111', '1111', '1112223333', '123', '아무개', '1112223333', 'aadd', '211.234.198.154', '2023-05-21 16:04:03', '2023-05-21 16:04:03', 0),
(22, 'ctest4', -1, 7, 7, 'ctest4', '1111', '1111', '1112223333', '111', '아무개', '1112223333', 'aadd', '211.234.198.154', '2023-05-21 16:04:47', '2023-05-21 16:04:47', 0),
(23, 'cuser1', -1, 8, 8, 'cuser1', '1111', '1111', '1112223333', '하나', '아무개1', '1112223333', 'cuser', '39.118.41.186', '2023-05-21 19:02:08', '2023-05-21 19:02:08', 0),
(24, 'cuser2', -1, 8, 8, 'cuser2', '1111', '1111', '1112223333', '국민', '아무개2', '1112223333', 'cuser', '39.118.41.186', '2023-05-21 19:02:49', '2023-05-21 19:02:49', 0),
(25, 'cuser3', -1, 8, 8, 'cuser3', '1111', '1111', '1112223333', '하나', '아무개3', '11122223333', 'cuser', '39.118.41.186', '2023-05-21 19:23:59', '2023-05-21 19:23:59', 1),
(26, 'cuser4', -1, 8, 8, 'cuser4', '1111', '1111', '1112223333', '하나', '아무개', '111233123123123', 'cuser', '39.118.41.186', '2023-05-21 19:59:26', '2023-05-21 19:59:26', 1),
(27, 'cuser5', -1, 8, 8, 'cuser5', '1111', '1111', '1112223333', '123', '1234', '1112223333', 'cuser', '39.118.41.186', '2023-05-21 20:15:12', '2023-05-21 20:15:12', 1),
(28, 'cuser6', -1, 8, 8, 'cuser6', '1111', '1111', '111111111', '111', '1111', '111111', 'cuser', '39.118.41.186', '2023-05-21 20:18:26', '2023-05-21 20:18:26', 1);

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
  `code` varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `kakao` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `telegram` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `partners`
--

INSERT INTO `partners` (`id`, `admin_id`, `store_id`, `distributor_id`, `type`, `name`, `commision`, `code`, `kakao`, `telegram`, `alive`, `updateDate`, `createDate`) VALUES
(1, 9, 1, 1, 0, 'hawaii', 0, 'hwhd', 'kakao', 'telegram', 1, '2023-05-16 18:01:36', '2023-05-16 18:01:36'),
(2, 12, 1, 1, 0, 'ppp1', 0, 'ppp1', '', '', 1, '2023-05-17 16:56:27', '2023-05-17 16:56:27'),
(3, 14, 1, 1, 0, 'abcd1', 1, 'abcd1', '', '', 1, '2023-05-18 18:45:12', '2023-05-18 18:45:12'),
(4, 15, 1, 1, 0, 'chong1', 1, 'qwer', '', '', 1, '2023-05-18 21:04:42', '2023-05-18 21:04:42'),
(5, 17, 1, 1, 0, 'nggon2', 0, 'kkkk', '', '', 1, '2023-05-19 00:02:51', '2023-05-19 00:02:51'),
(6, 20, -1, 3, 0, 'atest', 0, 'adfa', '', '', 1, '2023-05-21 13:30:39', '2023-05-21 13:30:39'),
(7, 23, -1, 7, 0, 'ctest', 100, 'aadd', '', '', 1, '2023-05-21 13:40:53', '2023-05-21 13:40:53'),
(8, 25, -1, 8, 0, 'cuser', 0, 'cuser', '', '', 0, '2023-05-21 19:01:07', '2023-05-21 19:01:07'),
(9, 26, -1, 8, 0, 'duser', 40, 'duser', '', '', 1, '2023-05-21 19:21:11', '2023-05-21 19:21:11'),
(10, 27, -1, 8, 0, 'euser', 760, 'euser', '', '', 1, '2023-05-21 19:33:34', '2023-05-21 19:33:34');

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

--
-- Dumping data for table `point_receives`
--

INSERT INTO `point_receives` (`id`, `user_id`, `sender`, `oldPoint`, `newPoint`, `point`, `oldBalance`, `newBalance`, `desc`, `createDate`) VALUES
(1, 4, '운영자', 0, 30000, 30000, 0, 0, '첫충전', '2023-05-10 09:18:36');

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

--
-- Dumping data for table `point_transfers`
--

INSERT INTO `point_transfers` (`id`, `user_id`, `oldPoint`, `newPoint`, `point`, `oldBalance`, `newBalance`, `desc`, `createDate`) VALUES
(1, 1, 1000000, 990000, 10000, 10000000, 10010000, '', '2023-05-10 12:27:49'),
(2, 4, 300000, 290000, 10000, 100000, 110000, '', '2023-05-10 18:19:44');

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
  `desc` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '',
  `disable` tinyint(1) NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `popups`
--

INSERT INTO `popups` (`id`, `store_id`, `type`, `title`, `url`, `desc`, `disable`, `updateDate`, `createDate`) VALUES
(2, 1, 0, 'ttt', 'https://ssl.pstatic.net/melona/libs/1404/1404181/8409a2f1e9152e1cf530_20230511181204646.png', 'test', 0, '2023-05-17 09:16:08', '2023-05-17 09:16:08'),
(6, -1, 0, '테스트', '', '헬로 헬로 헬로\n다음줄', 0, '2023-05-21 19:06:25', '2023-05-21 19:06:25');

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
  `alive` tinyint(1) NOT NULL DEFAULT 1,
  `pending` tinyint(1) NOT NULL DEFAULT 1,
  `questionDate` datetime NOT NULL DEFAULT current_timestamp(),
  `answerDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `user_id`, `store_id`, `nickname`, `type`, `title`, `question`, `answer`, `alive`, `pending`, `questionDate`, `answerDate`) VALUES
(1, 1, 1, 'TEST1', 0, '문의사항 남김니다.', '문의내용 문의 내용 테스트', '', 1, 0, '2023-05-15 18:18:32', '2023-05-15 18:18:32'),
(2, 5, 1, 'CP123', 0, '123', '123123', '', 1, 0, '2023-05-16 18:26:31', '2023-05-16 18:26:31'),
(3, 6, 1, 'NGGON', 0, '123123213', '12312321321', 'test123123123\n123123\n12333', 1, 0, '2023-05-16 22:54:47', '2023-05-16 22:54:47'),
(4, 6, 1, 'NGGON', 0, '문의사항', NULL, '콜', 1, 0, '2023-05-18 23:26:16', '2023-05-18 23:26:16'),
(5, 9, 1, 'qwerty', 0, '문의 보내기', '입금 계좌가 무엇일가요?', '123', 1, 0, '2023-05-19 13:08:14', '2023-05-19 13:08:14'),
(6, 12, 1, 'test123', 0, '1:1문의', '1:1문의 내용', '입니다', 1, 0, '2023-05-20 20:47:48', '2023-05-20 20:47:48'),
(7, 13, -1, 'ctest1', 0, '123123', 'asdfadfasfdasdfasdfsdaf', '몰라', 1, 0, '2023-05-21 14:28:24', '2023-05-21 14:28:24'),
(8, 18, -1, 'cuser1', 0, 'ㅁㄴㅇ;ㅣ럼ㄴ;ㅣㅏㅇ런ㅇㄹ', 'ㅁㄴㅇㄻㄴㅇㄻㄴㄻㄴㅇㄹㄴ', 'ㅁㄴㄻㄴㅇㄻㄴㅇㄹ', 1, 0, '2023-05-21 19:15:56', '2023-05-21 19:15:56');

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

--
-- Dumping data for table `sales_table`
--

INSERT INTO `sales_table` (`id`, `table_id`, `store_id`, `year`, `month`, `day`, `timestamp`, `rakes`, `bettings`, `updateDate`, `createDate`) VALUES
(1, 1, 0, 2023, 5, 10, 1683693516964, 7050, 141000, '2023-05-10 13:38:36', '2023-05-10 13:38:36'),
(2, 1, 0, 2023, 5, 19, 1684465099248, 4000, 80000, '2023-05-19 11:58:19', '2023-05-19 11:58:19'),
(3, 1, 0, 2023, 5, 20, 1684585748178, 8150, 163000, '2023-05-20 21:29:08', '2023-05-20 21:29:08'),
(4, 1, 0, 2023, 5, 21, 1684644625948, 12848, 256960, '2023-05-21 13:50:25', '2023-05-21 13:50:25');

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
  `transfer` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `return` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `wins` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `rakes` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `bettings` bigint(20) UNSIGNED NOT NULL DEFAULT 0,
  `useTicket` tinyint(1) NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_user`
--

INSERT INTO `sales_user` (`id`, `user_id`, `store_id`, `distributor_id`, `partner_id`, `year`, `month`, `day`, `timestamp`, `charge`, `transfer`, `return`, `wins`, `rakes`, `bettings`, `useTicket`, `updateDate`, `createDate`) VALUES
(1, 2, 1, 1, 1, 2023, 5, 10, 1683694993142, 0, 0, 0, 78850, 4150, 2000, 0, '2023-05-10 18:29:58', '2023-05-10 14:03:13'),
(2, 1, 1, 1, 1, 2023, 5, 10, 1683694993142, 0, 0, 0, 18050, 950, 2000, 0, '2023-05-10 14:35:23', '2023-05-10 14:03:13'),
(3, 4, 1, 1, 1, 2023, 5, 10, 1683710663410, 0, 0, 0, 14250, 750, 1000, 0, '2023-05-10 18:29:58', '2023-05-10 18:24:23'),
(4, 9, 1, 1, 5, 2023, 5, 19, 1684465099247, 0, 0, 0, 0, 0, 35500, 0, '2023-05-19 11:58:40', '2023-05-19 11:58:19'),
(5, 6, 1, 1, 5, 2023, 5, 19, 1684465099247, 0, 0, 0, 76000, 4000, 35500, 0, '2023-05-19 11:58:40', '2023-05-19 11:58:19'),
(6, 12, 1, 1, 5, 2023, 5, 20, 1684585748177, 0, 0, 0, 17100, 900, 37000, 0, '2023-05-20 21:42:24', '2023-05-20 21:29:08'),
(7, 9, 1, 1, 1, 2023, 5, 20, 1684585748177, 0, 0, 0, 137750, 7250, 37000, 0, '2023-05-20 21:42:24', '2023-05-20 21:29:08'),
(8, 12, 1, -1, 5, 2023, 5, 20, 1684608230, 0, 10000, 0, 0, 0, 0, 1, '2023-05-21 12:03:10', '2023-05-20 20:43:50'),
(9, 12, 1, 1, 5, 2023, 5, 21, 1684644625947, 0, 0, 0, 43282, 2278, 27780, 0, '2023-05-21 13:53:54', '2023-05-21 13:50:25'),
(10, 9, 1, 1, 1, 2023, 5, 21, 1684644625947, 0, 0, 0, 10450, 550, 28780, 0, '2023-05-21 13:53:54', '2023-05-21 13:50:25'),
(11, 12, 1, -1, 5, 2023, 5, 21, 1684668453, 0, 100000, 0, 0, 0, 0, 1, '2023-05-21 14:16:06', '2023-05-21 14:16:06'),
(12, 15, -1, 7, 7, 2023, 5, 21, 1684646617411, 0, 0, 0, 11400, 600, 51200, 0, '2023-05-21 14:24:30', '2023-05-21 14:23:37'),
(13, 13, -1, 7, 7, 2023, 5, 21, 1684646617411, 50000, 0, 0, 83030, 4370, 48200, 0, '2023-05-21 14:24:30', '2023-05-21 14:23:37'),
(14, 13, -1, 7, 7, 2023, 5, 21, 1684671989, 0, 58000, 0, 0, 0, 0, 1, '2023-05-21 14:27:56', '2023-05-21 14:27:56'),
(15, 13, -1, 7, 7, 2023, 5, 21, 1684677731, 0, 70000, 0, 0, 0, 0, 1, '2023-05-21 16:02:22', '2023-05-21 16:02:22'),
(16, 17, -1, 7, 7, 2023, 5, 21, 1684677998, 0, 10000, 0, 0, 0, 0, 1, '2023-05-21 16:07:10', '2023-05-21 16:07:10'),
(17, 16, -1, 7, 7, 2023, 5, 21, 1684678009, 0, 30000, 0, 0, 0, 0, 1, '2023-05-21 16:07:13', '2023-05-21 16:07:13'),
(18, 16, -1, 7, 7, 2023, 5, 21, 1684653949482, 0, 0, 0, 2850, 150, 9500, 0, '2023-05-21 16:31:26', '2023-05-21 16:25:49'),
(19, 17, -1, 7, 7, 2023, 5, 21, 1684653949482, 0, 0, 0, 17100, 900, 11500, 0, '2023-05-21 16:31:26', '2023-05-21 16:25:49'),
(20, 17, -1, 7, 7, 2023, 5, 21, 1684677961, 80000, 0, 2023, 0, 0, 0, 1, '2023-05-21 16:54:40', '2023-05-21 16:54:40'),
(21, 17, -1, 7, 7, 2023, 5, 21, 1684677961, 80000, 0, 2023, 0, 0, 0, 1, '2023-05-21 16:54:48', '2023-05-21 16:54:48'),
(22, 16, 1, 7, 7, 2023, 5, 21, 1684681269, 0, 10000, 2023, 0, 0, 0, 1, '2023-05-21 17:01:22', '2023-05-21 17:01:22'),
(23, 16, 1, 7, 7, 2023, 5, 21, 1684681379, 100000, 0, 2023, 0, 0, 0, 1, '2023-05-21 17:03:16', '2023-05-21 17:03:16'),
(24, 16, 1, 7, 7, 2023, 5, 21, 1684681912, 25000, 0, 0, 0, 0, 0, 1, '2023-05-21 17:12:07', '2023-05-21 17:11:52'),
(25, 19, -1, 8, 8, 2023, 5, 21, 1684689055, 300000, 0, 0, 0, 0, 0, 1, '2023-05-21 19:11:32', '2023-05-21 19:10:55'),
(26, 18, -1, 8, 8, 2023, 5, 21, 1684689117, 500000, 0, 0, 0, 0, 0, 1, '2023-05-21 19:12:06', '2023-05-21 19:11:57'),
(27, 18, -1, 8, 8, 2023, 5, 21, 1684689228, 0, 50000, 0, 0, 0, 0, 1, '2023-05-21 19:15:16', '2023-05-21 19:13:48'),
(28, 18, -1, 8, 8, 2023, 5, 21, 1684664323444, 0, 0, 0, 0, 0, 40000, 0, '2023-05-21 19:18:43', '2023-05-21 19:18:43'),
(29, 19, -1, 8, 8, 2023, 5, 21, 1684664323444, 0, 0, 0, 76000, 4000, 40000, 0, '2023-05-21 19:18:43', '2023-05-21 19:18:43');

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

--
-- Dumping data for table `setting`
--

INSERT INTO `setting` (`id`, `user_id`, `sound`, `mode`, `card_type`, `board_type`, `bg_type`) VALUES
(1, 1, 6, 0, 1, 1, 1),
(2, 2, 7, 0, 0, 0, 0),
(3, 3, 7, 0, 0, 0, 0),
(4, 4, 7, 0, 0, 0, 0),
(5, 5, 7, 0, 1, 1, 1),
(6, 6, 7, 0, 1, 1, 0),
(7, 8, 7, 0, 0, 0, 0),
(8, 9, 7, 0, 0, 0, 0),
(9, 12, 7, 0, 0, 0, 0),
(10, 13, 7, 0, 1, 2, 2),
(11, 15, 7, 0, 0, 0, 0),
(12, 17, 7, 0, 0, 0, 0),
(13, 16, 5, 0, 0, 0, 0),
(14, 18, 7, 0, 0, 0, 0),
(15, 19, 7, 0, 0, 0, 0);

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

--
-- Dumping data for table `statics`
--

INSERT INTO `statics` (`id`, `user_id`, `hands`, `rakes`, `rollings`, `maxPots`, `win`, `fold`, `win_allin`, `win_preflop`, `win_flop`, `win_turn`, `win_river`, `win_dealer`, `win_smallBlind`, `win_bigBlind`, `fold_preflop`, `fold_flop`, `fold_turn`, `fold_river`, `draw`, `best_rank`, `best_hands`, `maxPot_hands`, `updateDate`, `createDate`) VALUES
(1, 1, 12, 0, 0, 4050, 6, 4, 0, 3, 2, 1, 0, 3, 3, 6, 3, 0, 1, 0, 0, 0, ' ', ' ', '2023-05-15 18:36:58', '2023-05-10 12:21:12'),
(2, 2, 15, 0, 0, 36000, 6, 8, 1, 4, 1, 1, 0, 1, 1, 7, 4, 3, 1, 0, 0, 20481, '2c,2s,5h,3d,As,4d,9c', ' ', '2023-05-10 18:31:02', '2023-05-10 13:38:11'),
(3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-10 14:53:29', '2023-05-10 14:53:29'),
(4, 4, 3, 0, 0, 3400, 2, 1, 0, 1, 1, 0, 0, 0, 0, 2, 1, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-10 18:31:04', '2023-05-10 18:10:12'),
(5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-16 18:25:30', '2023-05-16 18:25:30'),
(6, 6, 2, 0, 0, 31950, 2, 0, 1, 1, 1, 0, 0, 1, 1, 3, 0, 0, 0, 0, 0, 13068, 'Ah,6h,Qc,5c,6s,Ac,3c', ' ', '2023-05-21 18:30:40', '2023-05-16 19:28:06'),
(7, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-18 22:41:47', '2023-05-18 22:41:47'),
(8, 9, 11, 0, 0, 33300, 7, 2, 2, 4, 3, 0, 0, 3, 3, 9, 0, 1, 0, 1, 0, 28826, 'Ad,6s,Jc,6d,Ac,As,Js', ' ', '2023-05-21 14:04:38', '2023-05-19 10:49:49'),
(9, 12, 9, 0, 0, 20502, 2, 5, 0, 0, 0, 0, 1, 1, 1, 3, 2, 3, 0, 0, 0, 16419, '2c,5h,9h,2h,Js,3s,2d', ' ', '2023-05-21 14:50:34', '2023-05-20 20:31:13'),
(10, 13, 3, 0, 0, 37980, 2, 1, 1, 2, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0, 0, 17086, '3c,2c,Js,Qc,Qs,Qd,7s', ' ', '2023-05-21 14:24:32', '2023-05-21 13:50:07'),
(11, 15, 3, 0, 0, 3400, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-21 15:59:31', '2023-05-21 14:18:41'),
(12, 17, 6, 0, 0, 4050, 4, 1, 0, 3, 0, 0, 0, 2, 2, 5, 1, 0, 0, 0, 0, 20489, 'Kc,2d,Qc,Td,Jh,3d,9h', ' ', '2023-05-21 16:31:46', '2023-05-21 16:05:32'),
(13, 16, 6, 0, 0, 850, 1, 3, 0, 1, 0, 0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-21 16:31:46', '2023-05-21 16:05:41'),
(14, 18, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-21 19:19:10', '2023-05-21 19:07:45'),
(15, 19, 1, 0, 0, 36000, 1, 0, 1, 1, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 9941, 'Ah,8h,9c,9s,3h,Tc,Qc', ' ', '2023-05-21 19:19:08', '2023-05-21 19:08:58');

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
(1, 'hawaii', '우리', '하와이이', '00-000-0000', '', '', 0, 0, 0, 0, 0, '2023-05-10 03:03:18', '2023-05-10 03:03:18', 1, 1);

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

--
-- Dumping data for table `store_code`
--

INSERT INTO `store_code` (`id`, `store_id`, `code`, `expireDate`, `updateDate`, `createDate`) VALUES
(1, 1, 'hello', '2023-05-10 03:02:29', '2023-05-10 03:02:29', '2023-05-10 03:02:29'),
(2, 1, 'hawaii', '2023-05-10 03:02:29', '2023-05-10 03:02:29', '2023-05-10 03:02:29'),
(3, 1, 'hwhd', '2023-05-15 21:27:16', '2023-05-15 21:27:16', '2023-05-15 21:27:16');

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

INSERT INTO `tables` (`id`, `store_id`, `name`, `type`, `grade`, `password`, `maxPlayers`, `betTimeLimit`, `ante`, `smallBlind`, `bigBlind`, `minStakePrice`, `maxStakePrice`, `useRake`, `rake`, `useRakeCap`, `rakeCap1`, `rakeCap2`, `rakeCap3`, `useFlopRake`, `disable`, `alive`, `updateDate`, `createDate`) VALUES
(1, -1, 'HOLDEM1', 0, 0, '', 9, 10, 1000, 1000, 2000, 40000, 200000, 1, 500, 0, 0, 0, 0, 0, 0, 1, '2023-05-10 03:29:27', '2023-05-10 03:29:27');

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

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `user_id`, `login_id`, `nickname`, `charge`, `transfer`, `return`, `transfer_fee`, `oldBalance`, `newBalance`, `updateDate`, `createDate`, `alive`, `pending`) VALUES
(1, 1, 'test1', 'TEST1', 100000, 0, 0, 0, 9875000, 9975000, '2023-05-10 15:01:05', '2023-05-10 12:28:07', 0, 1),
(2, 1, 'test1', 'TEST1', 0, 100000, 0, 0, 9875000, 9775000, '2023-05-10 15:02:31', '2023-05-10 12:28:20', 0, 1),
(3, 2, 'test2', 'TEST2', 10000, 0, 0, 0, 1025850, 1035850, '2023-05-10 15:13:25', '2023-05-10 15:13:00', 0, 1),
(4, 4, 'htest1', 'htest1', 100000, 0, 0, 0, 0, 100000, '2023-05-10 18:11:12', '2023-05-10 18:11:00', 0, 1),
(5, 1, 'test1', 'TEST1', 100000, 0, 0, 0, 9865000, 9965000, '2023-05-13 12:59:16', '2023-05-10 16:14:26', 0, 1),
(6, 1, 'test1', 'TEST1', 0, 10000, 0, 0, 9865000, 9855000, '2023-05-16 18:27:52', '2023-05-10 16:29:40', 0, 1),
(7, 5, 'cp123', 'CP123', 10000, 0, 0, 0, 0, 10000, '2023-05-16 19:09:32', '2023-05-16 18:25:44', 0, 1),
(8, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 0, 100000, '2023-05-16 19:31:59', '2023-05-16 19:28:31', 0, 1),
(9, 5, 'cp123', 'CP123', 50000, 0, 0, 0, 0, 50000, '2023-05-16 23:21:21', '2023-05-16 23:13:42', 0, 1),
(10, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 888889, 988889, '2023-05-17 09:24:24', '2023-05-16 22:54:23', 0, 1),
(11, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 888889, 988889, '2023-05-17 09:28:19', '2023-05-16 22:54:23', 0, 1),
(12, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 0, 100000, '2023-05-17 09:32:09', '2023-05-16 22:54:23', 0, 1),
(13, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 0, 100000, '2023-05-17 09:33:08', '2023-05-16 22:54:23', 0, 1),
(14, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 0, 100000, '2023-05-17 09:37:50', '2023-05-16 22:54:23', 0, 1),
(15, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 0, 100000, '2023-05-17 09:39:15', '2023-05-16 22:54:23', 0, 1),
(16, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 100000, 200000, '2023-05-17 11:02:11', '2023-05-16 22:54:23', 0, 1),
(17, 6, 'nggon', 'NGGON', 0, 100000, 0, 0, 200000, 100000, '2023-05-17 11:02:59', '2023-05-16 20:13:32', 0, 1),
(18, 6, 'nggon', 'NGGON', 0, 11111, 0, 0, 200000, 188889, '2023-05-17 11:04:09', '2023-05-16 22:54:37', 0, 1),
(19, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 200000, 300000, '2023-05-17 11:12:40', '2023-05-17 11:11:48', 0, 1),
(20, 6, 'nggon', 'NGGON', 0, 100000, 0, 0, 200000, 100000, '2023-05-17 11:14:34', '2023-05-17 11:14:09', 0, 1),
(21, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 200000, 300000, '2023-05-17 12:47:30', '2023-05-17 11:11:48', 0, 1),
(22, 8, 'user1', 'user1', 100000, 0, 0, 0, 0, 100000, '2023-05-18 22:43:17', '2023-05-18 22:42:09', 0, 1),
(23, 6, 'nggon', 'NGGON', 100000, 0, 0, 0, 300000, 400000, '2023-05-18 23:23:39', '2023-05-17 11:11:48', 0, 1),
(24, 6, 'nggon', 'NGGON', 0, 100000, 0, 0, 300000, 200000, '2023-05-18 23:24:28', '2023-05-17 11:14:09', 0, 1),
(25, 6, 'nggon', 'NGGON', 0, 100000, 0, 0, 200000, 100000, '2023-05-18 23:48:53', '2023-05-18 23:48:10', 0, 1),
(26, 9, 'qwerty', 'qwerty', 0, 10000, 0, 0, 90000, 80000, '2023-05-19 11:42:08', '2023-05-19 11:40:19', 0, 1),
(27, 9, 'qwerty', 'qwerty', 0, 10000, 0, 0, 50000, 40000, '2023-05-20 09:55:40', '2023-05-19 11:40:19', 0, 1),
(28, 9, 'qwerty', 'qwerty', 100000, 0, 0, 0, 50000, 150000, '2023-05-20 17:00:04', '2023-05-19 13:18:01', 0, 1),
(29, 12, 'test123', 'test123', 100000, 0, 0, 0, 0, 100000, '2023-05-20 20:40:50', '2023-05-20 20:39:09', 0, 1),
(30, 12, 'test123', 'test123', 0, 10000, 0, 0, 26100, 16100, '2023-05-21 11:56:37', '2023-05-20 20:43:50', 0, 1),
(31, 12, 'test123', 'test123', 0, 10000, 0, 0, 26100, 16100, '2023-05-21 11:59:11', '2023-05-20 20:43:50', 0, 1),
(32, 12, 'test123', 'test123', 0, 10000, 0, 0, 26100, 16100, '2023-05-21 11:59:43', '2023-05-20 20:43:50', 0, 1),
(33, 12, 'test123', 'test123', 0, 10000, 0, 0, 26100, 16100, '2023-05-21 12:00:06', '2023-05-20 20:43:50', 0, 1),
(34, 12, 'test123', 'test123', 0, 10000, 0, 0, 26100, 16100, '2023-05-21 12:03:09', '2023-05-20 20:43:50', 0, 1),
(35, 9, 'qwerty', 'qwerty', 100000, 0, 0, 0, 105750, 205750, '2023-05-21 12:09:10', '2023-05-19 10:50:51', 0, 1),
(36, 12, 'test123', 'test123', 100000, 0, 0, 0, 26100, 126100, '2023-05-21 12:11:23', '2023-05-20 20:39:09', 0, 1),
(37, 12, 'test123', 'test123', 100000, 0, 0, 0, 126100, 226100, '2023-05-21 12:13:15', '2023-05-20 20:39:09', 0, 1),
(38, 12, 'test123', 'test123', 10000, 0, 0, 0, 326100, 336100, '2023-05-21 13:22:38', '2023-05-21 13:10:45', 0, 1),
(39, 13, 'ctest1', 'ctest1', 55000, 0, 0, 0, 0, 55000, '2023-05-21 14:09:13', '2023-05-21 13:57:28', 0, 1),
(40, 12, 'test123', 'test123', 0, 100000, 0, 0, 251602, 151602, '2023-05-21 14:16:06', '2023-05-21 13:27:33', 0, 1),
(41, 15, 'ctest2', 'ctest2', 30000, 0, 0, 0, 0, 30000, '2023-05-21 14:19:23', '2023-05-21 14:18:54', 0, 1),
(42, 15, 'ctest2', 'ctest2', 50000, 0, 0, 0, 30000, 80000, '2023-05-21 14:22:48', '2023-05-21 14:22:38', 0, 1),
(43, 13, 'ctest1', 'ctest1', 0, 58000, 0, 0, 31830, 0, '2023-05-21 14:27:56', '2023-05-21 14:26:29', 0, 1),
(44, 15, 'ctest2', 'ctest2', 90000, 0, 0, 0, 40200, 130200, '2023-05-21 15:45:07', '2023-05-21 15:44:47', 0, 1),
(45, 13, 'ctest1', 'ctest1', 150000, 0, 0, 0, 31830, 181830, '2023-05-21 16:00:29', '2023-05-21 15:59:20', 0, 1),
(46, 13, 'ctest1', 'ctest1', 0, 70000, 0, 0, 111830, 41830, '2023-05-21 16:02:22', '2023-05-21 16:02:11', 0, 1),
(47, 17, 'ctest4', 'ctest4', 80000, 0, 0, 0, 0, 80000, '2023-05-21 16:06:15', '2023-05-21 16:06:01', 0, 1),
(48, 16, 'ctest3', 'ctest3', 100000, 0, 0, 0, 0, 100000, '2023-05-21 16:06:17', '2023-05-21 16:05:52', 0, 1),
(49, 17, 'ctest4', 'ctest4', 0, 10000, 0, 0, 70000, 60000, '2023-05-21 16:07:10', '2023-05-21 16:06:38', 0, 1),
(50, 16, 'ctest3', 'ctest3', 0, 30000, 0, 0, 70000, 40000, '2023-05-21 16:07:13', '2023-05-21 16:06:49', 0, 1),
(51, 16, 'ctest3', 'ctest3', 30000, 0, 0, 0, 61350, 91350, '2023-05-21 16:33:19', '2023-05-21 16:32:33', 0, 1),
(52, 16, 'ctest3', 'ctest3', 40000, 0, 0, 0, 91350, 131350, '2023-05-21 16:35:21', '2023-05-21 16:35:04', 0, 1),
(53, 16, 'ctest3', 'ctest3', 0, 10000, 0, 0, 121350, 111350, '2023-05-21 17:01:22', '2023-05-21 17:01:09', 0, 1),
(54, 16, 'ctest3', 'ctest3', 100000, 0, 0, 0, 121350, 221350, '2023-05-21 17:03:16', '2023-05-21 17:02:59', 0, 1),
(55, 16, 'ctest3', 'ctest3', 25000, 0, 0, 0, 221350, 246350, '2023-05-21 17:12:07', '2023-05-21 17:11:52', 0, 1),
(56, 19, 'cuser2', 'cuser2', 300000, 0, 0, 0, 0, 300000, '2023-05-21 19:11:32', '2023-05-21 19:10:55', 0, 1),
(57, 18, 'cuser1', 'cuser1', 500000, 0, 0, 0, 0, 500000, '2023-05-21 19:12:06', '2023-05-21 19:11:57', 0, 1),
(58, 18, 'cuser1', 'cuser1', 0, 50000, 0, 0, 450000, 400000, '2023-05-21 19:15:16', '2023-05-21 19:13:48', 0, 1),
(59, 18, 'cuser1', 'cuser1', 0, 0, 87000, 0, 323000, 410000, '2023-05-21 20:15:46', '2023-05-21 20:15:37', 1, 1);

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

--
-- Dumping data for table `transfers`
--

INSERT INTO `transfers` (`id`, `user_id`, `login_id`, `nickname`, `amount`, `oldBalance`, `newBalance`, `updateDate`, `createDate`, `alive`, `pending`) VALUES
(1, 1, 'test1', 'TEST1', 100000, 10010000, 9910000, '2023-05-10 12:28:20', '2023-05-10 12:28:20', 1, 0),
(2, 1, 'test1', 'TEST1', 10000, 9875000, 9865000, '2023-05-10 16:29:40', '2023-05-10 16:29:40', 1, 0),
(3, 6, 'nggon', 'NGGON', 100000, 1000000, 900000, '2023-05-16 20:13:32', '2023-05-16 20:13:32', 1, 0),
(4, 6, 'nggon', 'NGGON', 11111, 900000, 888889, '2023-05-16 22:54:37', '2023-05-16 22:54:37', 1, 0),
(5, 6, 'nggon', 'NGGON', 100000, 300000, 200000, '2023-05-17 11:14:09', '2023-05-17 11:14:09', 1, 0),
(6, 6, 'nggon', 'NGGON', 100000, 300000, 200000, '2023-05-18 23:48:10', '2023-05-18 23:48:10', 1, 0),
(7, 9, 'qwerty', 'qwerty', 10000, 100000, 90000, '2023-05-19 11:40:19', '2023-05-19 11:40:19', 1, 0),
(8, 12, 'test123', 'test123', 10000, 100000, 90000, '2023-05-20 20:43:50', '2023-05-20 20:43:50', 1, 0),
(9, 12, 'test123', 'test123', 100000, 336100, 236100, '2023-05-21 13:27:33', '2023-05-21 13:27:33', 1, 0),
(10, 13, 'ctest1', 'ctest1', 58000, 89830, 31830, '2023-05-21 14:26:29', '2023-05-21 14:26:29', 1, 0),
(11, 15, 'ctest2', 'ctest2', 50000, 130200, 80200, '2023-05-21 15:45:24', '2023-05-21 15:45:24', 1, 0),
(12, 13, 'ctest1', 'ctest1', 100000, 181830, 81830, '2023-05-21 16:00:58', '2023-05-21 16:00:58', 1, 0),
(13, 13, 'ctest1', 'ctest1', 70000, 181830, 111830, '2023-05-21 16:02:11', '2023-05-21 16:02:11', 1, 0),
(14, 17, 'ctest4', 'ctest4', 10000, 80000, 70000, '2023-05-21 16:06:38', '2023-05-21 16:06:38', 1, 0),
(15, 16, 'ctest3', 'ctest3', 30000, 100000, 70000, '2023-05-21 16:06:49', '2023-05-21 16:06:49', 1, 0),
(16, 16, 'ctest3', 'ctest3', 10000, 131350, 121350, '2023-05-21 17:01:09', '2023-05-21 17:01:09', 1, 0),
(17, 18, 'cuser1', 'cuser1', 150000, 500000, 350000, '2023-05-21 19:12:51', '2023-05-21 19:12:51', 1, 0),
(18, 18, 'cuser1', 'cuser1', 50000, 500000, 450000, '2023-05-21 19:13:48', '2023-05-21 19:13:48', 1, 0),
(19, 18, 'cuser1', 'cuser1', 35000, 410000, 375000, '2023-05-21 20:00:08', '2023-05-21 20:00:08', 1, 0),
(20, 12, 'test123', 'test123', 10000, 251602, 241602, '2023-05-21 20:05:43', '2023-05-21 20:05:43', 1, 0),
(21, 18, 'cuser1', 'cuser1', 87000, 410000, 323000, '2023-05-21 20:15:37', '2023-05-21 20:15:37', 1, 0);

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
  `rake` int(10) UNSIGNED NOT NULL DEFAULT 0,
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
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login_id`, `nickname`, `password`, `login_ip`, `token`, `avatar`, `grade`, `balance`, `point`, `chip`, `table_id`, `wins`, `bettings`, `rake`, `store_id`, `distributor_id`, `partner_id`, `transferpassword`, `phone`, `bank`, `holder`, `account`, `recommender`, `join_ip`, `first_charge`, `charges`, `transfers`, `transfer_fees`, `charge_count`, `transfer_count`, `transfer_fee_count`, `activeSessionId`, `pendingSessionId`, `pendingSessionTimestamp`, `loginCount`, `loginDate`, `logoutDate`, `updateDate`, `createDate`, `disable`, `alive`, `pending`) VALUES
(1, 'test1', 'TEST1', '1111', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3QxIiwicGFzc3dvcmQiOiIxMTExIiwiaWF0IjoxNjg0NDczNTg1fQ.KrlfgrLxnXazYNUnYK-ulPD1FtnkuxTKSXEmpYddGyw', 2, 0, 9865000, 990000, 0, -1, 0, 0, 3075, 1, 1, 1, '1111', '000000', '0000001', '00000', '00000', 'hello', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-15 18:36:45', '2023-05-10 03:20:52', '2023-05-15 18:36:58', '2023-05-10 03:20:52', 0, 1, 0),
(2, 'test2', 'TEST2', '1111', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3QyIiwicGFzc3dvcmQiOiIxMTExIiwiaWF0IjoxNjgzNzEwNjMwfQ.RV-UjlS4HI7r7N-MKn28r6VGci64XR_0khl1ZDDUdV4', 3, 0, 1021700, 100000, 0, -1, 0, 0, 3425, 1, 1, 1, '1111', '111111', '111111', '11111', '11111', 'hello', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-10 18:30:05', '2023-05-10 04:38:01', '2023-05-10 18:31:02', '2023-05-10 04:38:01', 0, 1, 0),
(3, 'test3', 'TEST2', '1111', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3QzIiwicGFzc3dvcmQiOiIxMTExIiwiaWF0IjoxNjgzNjk4MDA5fQ.0dzYTh5bWmLNzi3i984ddBRS6PB9mv_if31iwuvtSXM', 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 1, 1, '1111', '010-0000-0000', '우리은행', '아이유', '000-000-0000', 'hello', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-10 14:51:27', '2023-05-10 14:51:27', '2023-05-10 14:51:27', '2023-05-10 12:37:37', 0, 1, 0),
(4, 'htest1', 'htest1', '1234', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6Imh0ZXN0MSIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTY4MzcwOTgxMn0.fTUADSc1nGB-n80Ui8pGkt8QnUVjX967Rg9UKJLCRGE', 3, 0, 113250, 290000, 0, -1, 0, 0, 550, 1, 1, 1, '1234', '0101112222', '하나', '김땡땡', '123456789', 'hello', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-10 18:29:24', '2023-05-10 18:01:58', '2023-05-10 18:31:04', '2023-05-10 18:00:32', 0, 1, 0),
(5, 'cp123', 'CP123', '1234', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImNwMTIzIiwicGFzc3dvcmQiOiIxMjM0IiwiaWF0IjoxNjg0MjQ2NDA1fQ.thnLOj0LjGcrU0pPBiI6ZKhv6tzqbX7yxNUJPuPNzRI', 10, 0, 0, 0, 0, -1, 0, 0, 0, 1, 1, 1, '1111', '0101111111', '하나', '아무개', '111222333333', 'hwhd', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-16 18:25:25', '2023-05-16 18:25:25', '2023-05-16 18:25:25', '2023-05-16 18:24:47', 0, 1, 0),
(6, 'nggon', 'NGGON', '972130', '39.118.41.186', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6Im5nZ29uIiwicGFzc3dvcmQiOiI5NzIxMzAiLCJpYXQiOjE2ODQ2NjEzODd9.32dLs0pGA_AkA-gMG0TuegZ1KKGzDbsEqmoh3w5A8aU', 7, 0, 236000, 0, 0, -1, 0, 0, 2000, 1, 1, 1, '1111', '12321312321', '우리', 'holder', '11111111', 'hwhd', '', 0, 500000, 211111, 0, 5, 3, 0, '', '', 0, 2, '2023-05-21 18:29:51', '2023-05-16 19:27:59', '2023-05-21 18:30:40', '2023-05-16 19:19:55', 0, 1, 0),
(7, 'htest1', 'htest1', '1234', '', '', 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 1, 1, '1234', '0101112222', '하나', '김땡땡', '123456789', 'hello', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-17 23:38:22', '2023-05-17 23:38:22', '2023-05-17 23:38:22', '2023-05-10 18:00:32', 0, 1, 0),
(8, 'user1', 'user1', 'user1', '', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InVzZXIxIiwicGFzc3dvcmQiOiJ1c2VyMSIsImlhdCI6MTY4NDQxNzQ1Nn0.1yKDbJRkVTsxHzTVgHhefx1xg3-1-Z3QYS2Yher_Q5Q', 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 1, 1, '1234', '1231231234', '123', '1234', '1231231234', 'qwer', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-18 22:41:44', '2023-05-18 22:41:44', '2023-05-18 22:41:44', '2023-05-18 22:41:16', 0, 1, 0),
(9, 'qwerty', 'qwerty', 'qwerty', '39.118.41.186', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InF3ZXJ0eSIsInBhc3N3b3JkIjoicXdlcnR5IiwiaWF0IjoxNjg0NjQ0NTE2fQ.7xK9yuXHvWEs6opdkgRQSYb9H0WWXhldkpjIADJx31o', 12, 0, 87420, 0, 0, -1, 148200, 110780, 9800, 1, 1, 1, 'qwerty', 'qwerty', 'qwerty', 'qwerty', 'qwerty', 'kkkk', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 4, '2023-05-21 13:49:45', '2023-05-19 10:44:14', '2023-05-21 14:04:38', '2023-05-19 10:41:33', 0, 1, 0),
(10, 'qwerty1', 'qwerty1', 'qwerty1', '', '', 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 1, 5, 'qwerty1', 'qwerty1', 'qwerty1', 'qwerty1', 'qwerty1', 'kkkk', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-19 11:52:04', '2023-05-19 11:52:04', '2023-05-19 11:52:04', '2023-05-19 11:51:25', 0, 0, 0),
(11, 'alcls45679', 'alclssha', 'ccc456', '', '', 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 1, 5, '4977', '01076081735', '신한은행', '최강수', '110371913973', 'hwhd', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-20 16:57:16', '2023-05-20 16:57:16', '2023-05-20 16:57:16', '2023-05-16 18:48:56', 0, 1, 0),
(12, 'test123', 'test123', '1111', '39.118.41.186', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3QxMjMiLCJwYXNzd29yZCI6IjExMTEiLCJpYXQiOjE2ODQ2NjcxMzN9.bbnVYir58ZZ_dbBNavKcrbYkryNIxk3XjG-4SzNNGqU', 2, 0, 251602, 0, 0, -1, 60382, 108780, 3178, 1, 1, 5, '1111', '11111111', '11111111', '2222', '11111111', 'kkkk', '', 0, 310000, 140000, 0, 4, 5, 0, '', '', 0, 21, '2023-05-21 20:05:33', '2023-05-20 20:28:40', '2023-05-21 14:50:34', '2023-05-20 20:26:56', 0, 1, 0),
(13, 'ctest1', 'ctest1', '1111', '39.118.41.186', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImN0ZXN0MSIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDY2NzgyMX0.t62xovbSctAFl4DujL0PKoYAGpUBxOrYZ7WySzhdM9Y', 3, 0, 111830, 0, 0, -1, 83030, 48200, 4370, 1, 7, 7, '1111', '1231231234', '123', '아무개', '123123123456', 'aadd', '', 0, 205000, 128000, 0, 2, 2, 0, '', '', 0, 8, '2023-05-21 20:17:01', '2023-05-21 13:49:50', '2023-05-21 14:24:32', '2023-05-21 13:43:51', 0, 1, 0),
(14, 'atest1', 'atest1', 'atest1', '', '', 0, 0, 0, 0, 0, -1, 0, 0, 0, 1, 3, 6, '1111', '1112223333', '123', '아무개', '123123123456', 'adfa', '', 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '2023-05-21 13:51:06', '2023-05-21 13:51:06', '2023-05-21 13:51:06', '2023-05-21 13:32:08', 0, 1, 0),
(15, 'ctest2', 'ctest2', '1111', '211.234.198.154', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImN0ZXN0MiIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDY1MTI4OH0.xedhsKMwRuraMozJ8UggTT-GNqe0b19hwHFbY1zspbU', 0, 0, 180200, 0, 0, -1, 11400, 51200, 600, 1, 7, 7, '1111', '1112223333', '123', '아무개', '123123123456', 'aadd', '', 0, 170000, 0, 0, 3, 0, 0, '', '', 0, 2, '2023-05-21 15:58:29', '2023-05-21 14:18:12', '2023-05-21 15:59:31', '2023-05-21 14:12:47', 0, 1, 0),
(16, 'ctest3', 'ctest3', '1111', '58.142.49.16', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImN0ZXN0MyIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDY1NzQyMH0.Y8_UUT4Srxa2nLAEyo5yNVWzWTiSzLnTag1C5l1WvI8', 0, 0, 246350, 0, 0, -1, 2850, 9500, 150, 1, 7, 7, '1111', '1112223333', '123', '아무개', '1112223333', 'aadd', '', 0, 295000, 40000, 0, 5, 2, 0, '', '', 0, 11, '2023-05-21 17:23:40', '2023-05-21 16:05:23', '2023-05-21 16:31:46', '2023-05-21 16:04:03', 0, 1, 0),
(17, 'ctest4', 'ctest4', '1111', '58.142.49.16', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImN0ZXN0NCIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDY1NDkxMn0.LFZb1glOtHpnZGumjfbXFE9mpSfGxKy5lt6WmREGzYw', 7, 0, 72600, 0, 0, -1, 17100, 11500, 900, 1, 7, 7, '1111', '1112223333', '111', '아무개', '1112223333', 'aadd', '', 0, 80000, 10000, 0, 1, 1, 0, '', '', 0, 4, '2023-05-21 16:41:52', '2023-05-21 16:05:26', '2023-05-21 16:31:46', '2023-05-21 16:04:47', 0, 1, 0),
(18, 'cuser1', 'cuser1', '1111', '39.118.41.186', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImN1c2VyMSIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDY2Njc5MH0.pqH-VbZCLxxkTo6Qq3a0-Kw7qoDDTNKN74XM5ASpvbg', 0, 0, 410000, 0, 0, -1, 0, 40000, 0, -1, 8, 8, '1111', '1112223333', '하나', '아무개1', '1112223333', 'cuser', '', 0, 500000, 50000, 0, 1, 1, 0, '', '', 0, 2, '2023-05-21 19:59:50', '2023-05-21 19:03:38', '2023-05-21 19:19:10', '2023-05-21 19:02:08', 0, 1, 0),
(19, 'cuser2', 'cuser2', '1111', '39.118.41.186', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImN1c2VyMiIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDY2NTQwMH0.5vMx3PCRM0jso1dUNAWFF9PnlAUatOxxg2oaIyKQfa4', 0, 0, 336000, 0, 0, -1, 76000, 40000, 4000, -1, 8, 8, '1111', '1112223333', '국민', '아무개2', '1112223333', 'cuser', '', 0, 300000, 0, 0, 1, 0, 0, '', '', 0, 3, '2023-05-21 19:36:40', '2023-05-21 19:05:50', '2023-05-21 19:19:08', '2023-05-21 19:02:49', 0, 1, 0);

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `buyins`
--
ALTER TABLE `buyins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `charges`
--
ALTER TABLE `charges`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `distributors`
--
ALTER TABLE `distributors`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `joins`
--
ALTER TABLE `joins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `point_receives`
--
ALTER TABLE `point_receives`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `point_transfers`
--
ALTER TABLE `point_transfers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `popups`
--
ALTER TABLE `popups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `sales_table`
--
ALTER TABLE `sales_table`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sales_user`
--
ALTER TABLE `sales_user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `setting`
--
ALTER TABLE `setting`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `statics`
--
ALTER TABLE `statics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `stores`
--
ALTER TABLE `stores`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `store_code`
--
ALTER TABLE `store_code`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
