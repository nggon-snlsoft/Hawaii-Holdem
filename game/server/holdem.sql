-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 24, 2023 at 03:31 AM
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
(1, 1, 'admin', '', '0912', 'hwhd', 0, 0, 0, 0, '2023-05-21 21:24:57', '2023-05-21 21:24:57'),
(2, -1, 'badmin', '', '1111', 'badmin', 1, 0, 0, 0, '2023-05-22 13:27:32', '2023-05-22 13:27:32'),
(3, -1, 'cadmin', '', '1111', 'cadmin', 2, 0, 0, 0, '2023-05-22 13:28:28', '2023-05-22 13:28:28'),
(4, -1, 'red', '', '1234', '홍', 1, 0, 0, 0, '2023-05-23 13:46:56', '2023-05-23 13:46:56'),
(5, -1, 'red0', '', '1234', '조성강', 2, 0, 0, 0, '2023-05-23 15:48:55', '2023-05-23 15:48:55'),
(6, -1, 'badmin2', '', '1111', 'badmin2', 1, 0, 0, 0, '2023-05-23 20:54:08', '2023-05-23 20:54:08');

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
(1, 1, 1, 1000000, 960000, 0, 40000, 40000, '2023-05-21 21:29:00'),
(2, 1, 1, 1000000, 960000, 0, 40000, 40000, '2023-05-21 21:43:38'),
(3, 2, 1, 100000, 60000, 0, 40000, 40000, '2023-05-22 13:37:36'),
(4, 4, 1, 200000, 160000, 0, 40000, 40000, '2023-05-22 13:54:20'),
(5, 2, 1, 100000, 60000, 0, 40000, 40000, '2023-05-22 13:54:24'),
(6, 3, 1, 100000, 60000, 0, 40000, 40000, '2023-05-22 14:00:38'),
(7, 2, 1, 113700, 73700, 0, 40000, 40000, '2023-05-22 14:00:46'),
(8, 3, 1, 107700, 67700, 0, 40000, 40000, '2023-05-22 18:08:56'),
(9, 3, 1, 107700, 67700, 0, 40000, 40000, '2023-05-22 18:20:06'),
(10, 3, 1, 107700, 67700, 0, 40000, 40000, '2023-05-22 20:00:18'),
(11, 3, 2, 107700, 0, 0, 107700, 107700, '2023-05-22 20:50:09'),
(12, 5, 1, 1000000, 970000, 0, 30000, 30000, '2023-05-22 20:52:59'),
(13, 2, 1, 101413, 71413, 0, 30000, 30000, '2023-05-22 20:53:02'),
(14, 5, 1, 1004389, 974389, 0, 30000, 30000, '2023-05-22 20:58:29'),
(15, 5, 1, 1003389, 973389, 0, 30000, 30000, '2023-05-22 20:59:17'),
(16, 2, 1, 99475, 69475, 0, 30000, 30000, '2023-05-22 21:01:56'),
(17, 5, 1, 996752, 966752, 0, 30000, 30000, '2023-05-22 21:01:58'),
(18, 5, 1, 966752, 936752, 0, 30000, 30000, '2023-05-22 21:03:56'),
(19, 6, 1, 1000000, 970000, 0, 30000, 30000, '2023-05-22 22:38:06'),
(20, 6, 1, 1000000, 970000, 0, 30000, 30000, '2023-05-22 22:38:23'),
(21, 6, 3, 1000000, 800000, 0, 200000, 200000, '2023-05-22 23:03:17'),
(22, 6, 3, 1000000, 800000, 0, 200000, 200000, '2023-05-22 23:03:44'),
(23, 7, 3, 1000000, 800000, 0, 200000, 200000, '2023-05-22 23:05:02'),
(24, 7, 3, 800000, 600000, 0, 200000, 200000, '2023-05-22 23:09:48'),
(25, 6, 3, 1160208, 960208, 0, 200000, 200000, '2023-05-22 23:26:02'),
(26, 7, 3, 798000, 598000, 0, 200000, 200000, '2023-05-22 23:26:37'),
(27, 6, 3, 1160208, 758508, 0, 401700, 401700, '2023-05-22 23:26:47'),
(28, 7, 3, 598000, 398000, 0, 200000, 200000, '2023-05-22 23:29:02'),
(29, 6, 3, 758508, 158508, 0, 600000, 600000, '2023-05-22 23:35:41'),
(30, 7, 3, 398000, 203100, 5079, 199979, 194900, '2023-05-22 23:51:09'),
(31, 6, 1, 1282168, 1252168, 0, 30000, 30000, '2023-05-23 01:26:43'),
(32, 6, 2, 1282168, 1182168, 0, 100000, 100000, '2023-05-23 01:34:41'),
(33, 6, 2, 1282168, 975968, 0, 306200, 306200, '2023-05-23 02:39:41'),
(34, 7, 2, 403079, 0, 0, 403079, 403079, '2023-05-23 02:44:11'),
(35, 7, 2, 647300, 547300, 0, 100000, 100000, '2023-05-23 02:50:29'),
(36, 6, 2, 975968, 475968, 0, 500000, 500000, '2023-05-23 02:50:36'),
(37, 7, 3, 709750, 509750, 0, 200000, 200000, '2023-05-23 02:58:06'),
(38, 6, 2, 904168, 404168, 0, 500000, 500000, '2023-05-23 03:06:30'),
(39, 7, 2, 709750, 609750, 0, 100000, 100000, '2023-05-23 03:06:47'),
(40, 7, 3, 1005235, 805235, 0, 200000, 200000, '2023-05-23 05:13:14'),
(41, 9, 1, 1000000, 970000, 0, 30000, 30000, '2023-05-23 11:17:11'),
(42, 8, 2, 1000000, 500000, 0, 500000, 500000, '2023-05-23 11:17:27'),
(43, 9, 2, 1000000, 500000, 0, 500000, 500000, '2023-05-23 11:17:37'),
(44, 9, 2, 981150, 481150, 0, 500000, 500000, '2023-05-23 11:22:54'),
(45, 9, 1, 981150, 681150, 0, 300000, 300000, '2023-05-23 11:29:52'),
(46, 8, 1, 988875, 958875, 0, 30000, 30000, '2023-05-23 13:07:56'),
(47, 8, 1, 977813, 677813, 0, 300000, 300000, '2023-05-23 13:21:07'),
(48, 9, 1, 991106, 691106, 0, 300000, 300000, '2023-05-23 13:21:10'),
(49, 9, 1, 990531, 690531, 0, 300000, 300000, '2023-05-23 13:51:27'),
(50, 9, 1, 990531, 690531, 0, 300000, 300000, '2023-05-23 13:59:06'),
(51, 9, 1, 990531, 690531, 0, 300000, 300000, '2023-05-23 13:59:20'),
(52, 10, 1, 1000000, 970000, 0, 30000, 30000, '2023-05-23 13:59:49'),
(53, 11, 1, 1000000, 970000, 0, 30000, 30000, '2023-05-23 13:59:51'),
(54, 7, 1, 1005235, 975235, 0, 30000, 30000, '2023-05-23 13:59:54'),
(55, 6, 1, 558786, 528786, 0, 30000, 30000, '2023-05-23 13:59:56'),
(56, 8, 1, 963263, 663263, 0, 300000, 300000, '2023-05-23 14:00:13'),
(57, 6, 1, 555849, 525849, 0, 30000, 30000, '2023-05-23 14:07:56'),
(58, 7, 1, 997235, 967235, 0, 30000, 30000, '2023-05-23 14:08:40'),
(59, 6, 1, 525849, 495849, 0, 30000, 30000, '2023-05-23 14:11:12'),
(60, 9, 1, 913141, 883141, 0, 30000, 30000, '2023-05-23 14:12:20'),
(61, 9, 1, 913141, 613141, 0, 300000, 300000, '2023-05-23 14:12:29'),
(62, 8, 1, 1042682, 889282, 0, 153400, 153400, '2023-05-23 14:13:03'),
(63, 8, 1, 1034182, 991982, 0, 42200, 42200, '2023-05-23 14:17:52'),
(64, 8, 1, 991982, 961982, 0, 30000, 30000, '2023-05-23 14:28:36'),
(65, 7, 1, 967235, 937835, 575, 29975, 29400, '2023-05-23 14:29:40'),
(66, 6, 1, 542008, 512008, 0, 30000, 30000, '2023-05-23 14:30:46'),
(67, 7, 1, 972460, 942460, 0, 30000, 30000, '2023-05-23 14:32:22'),
(68, 8, 1, 990982, 934582, 0, 56400, 56400, '2023-05-23 14:34:13'),
(69, 10, 1, 970000, 684126, 9751, 295625, 285875, '2023-05-23 14:34:40'),
(70, 8, 1, 963532, 933532, 0, 30000, 30000, '2023-05-23 14:49:10'),
(71, 8, 1, 933532, 884232, 30000, 79300, 49300, '2023-05-23 14:50:21'),
(72, 7, 1, 942460, 671479, 0, 270982, 270982, '2023-05-23 14:53:00'),
(73, 6, 1, 512008, 368644, 156636, 300000, 143364, '2023-05-23 14:54:19'),
(74, 11, 1, 970000, 940000, 0, 30000, 30000, '2023-05-23 14:56:00'),
(75, 10, 1, 684126, 654126, 0, 30000, 30000, '2023-05-23 14:56:01'),
(76, 11, 1, 940000, 670000, 24532, 294532, 270000, '2023-05-23 14:57:44'),
(77, 6, 1, 368644, 74963, 0, 293682, 293682, '2023-05-23 14:59:15'),
(78, 10, 1, 654126, 377308, 0, 276819, 276819, '2023-05-23 15:00:45'),
(79, 7, 1, 671479, 398001, 26522, 300000, 273478, '2023-05-23 15:02:41'),
(80, 6, 1, 74963, 32009, 257046, 300000, 42954, '2023-05-23 15:04:06'),
(81, 8, 1, 1088592, 1043692, 0, 44900, 44900, '2023-05-23 15:04:37'),
(82, 9, 1, 1475548, 1175548, 0, 300000, 300000, '2023-05-23 15:04:55'),
(83, 7, 1, 398001, 368001, 0, 30000, 30000, '2023-05-23 15:10:43'),
(84, 11, 1, 670000, 640000, 0, 30000, 30000, '2023-05-23 15:10:44'),
(85, 10, 1, 780753, 480753, 0, 300000, 300000, '2023-05-23 15:12:13'),
(86, 11, 1, 670000, 640000, 0, 30000, 30000, '2023-05-23 15:12:22'),
(87, 7, 1, 398001, 368001, 0, 30000, 30000, '2023-05-23 15:33:27'),
(88, 10, 1, 787778, 757778, 0, 30000, 30000, '2023-05-23 15:53:31'),
(89, 11, 1, 661850, 631850, 0, 30000, 30000, '2023-05-23 15:53:34'),
(90, 12, 1, 1000000, 951000, 0, 49000, 49000, '2023-05-23 15:57:16'),
(91, 7, 1, 398001, 368001, 0, 30000, 30000, '2023-05-23 15:59:37'),
(92, 11, 1, 631850, 601850, 0, 30000, 30000, '2023-05-23 16:01:18'),
(93, 12, 1, 1026740, 984140, 0, 42600, 42600, '2023-05-23 16:04:00'),
(94, 11, 1, 601850, 571850, 0, 30000, 30000, '2023-05-23 16:05:18'),
(95, 11, 1, 601850, 571850, 0, 30000, 30000, '2023-05-23 16:06:01'),
(96, 12, 1, 984140, 936040, 4945, 53045, 48100, '2023-05-23 16:09:50'),
(97, 12, 1, 936040, 913740, 31914, 54214, 22300, '2023-05-23 16:17:26'),
(98, 12, 1, 913740, 881840, 22120, 54020, 31900, '2023-05-23 16:22:20'),
(99, 12, 1, 923544, 883144, 0, 40400, 40400, '2023-05-23 16:30:46'),
(100, 10, 1, 757778, 727778, 0, 30000, 30000, '2023-05-23 16:33:27'),
(101, 7, 1, 368001, 123107, 0, 244894, 244894, '2023-05-23 16:37:31'),
(102, 14, 1, 1000000, 961400, 0, 38600, 38600, '2023-05-23 16:41:42'),
(103, 9, 1, 2119095, 1819095, 0, 300000, 300000, '2023-05-23 16:45:00'),
(104, 7, 1, 349138, 319138, 0, 30000, 30000, '2023-05-23 16:52:36'),
(105, 7, 1, 349138, 319138, 0, 30000, 30000, '2023-05-23 17:15:34'),
(106, 7, 1, 319138, 49138, 30000, 300000, 270000, '2023-05-23 17:15:53'),
(107, 4, 1, 180475, 150475, 0, 30000, 30000, '2023-05-23 18:05:17'),
(108, 2, 1, 126875, 96875, 0, 30000, 30000, '2023-05-23 18:05:21'),
(109, 2, 1, 126375, 96375, 0, 30000, 30000, '2023-05-23 18:51:12'),
(110, 13, 1, 200000, 170000, 0, 30000, 30000, '2023-05-23 18:57:32'),
(111, 15, 1, 100000, 70000, 0, 30000, 30000, '2023-05-23 18:57:49'),
(112, 7, 1, 349138, 319138, 0, 30000, 30000, '2023-05-23 20:32:33'),
(113, 6, 1, 188668, 0, 0, 188668, 188668, '2023-05-23 23:38:57'),
(114, 6, 1, 188668, 0, 0, 188668, 188668, '2023-05-23 23:45:16'),
(115, 10, 1, 773766, 473766, 0, 300000, 300000, '2023-05-23 23:45:21'),
(116, 11, 1, 689695, 389695, 0, 300000, 300000, '2023-05-23 23:50:00');

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
(1, 2, 'user1', 'user1', '아무개', 100000, '2023-05-22 13:36:08', '2023-05-22 13:36:08', 1, 0),
(2, 4, 'cuser2', 'cuser2', '아무개2', 200000, '2023-05-22 13:53:51', '2023-05-22 13:53:51', 1, 0),
(3, 3, 'admintest', 'admintest', '테스트', 100000, '2023-05-22 14:00:07', '2023-05-22 14:00:07', 1, 0),
(4, 5, 'user3', 'user3', '아무개3	', 1000000, '2023-05-22 20:50:23', '2023-05-22 20:50:23', 1, 0),
(5, 6, 'hit624', '난다리까자', '김영우', 1000000, '2023-05-22 22:21:53', '2023-05-22 22:21:53', 0, 0),
(6, 6, 'hit624', '난다리까자', '김영우		', 1000000, '2023-05-22 22:25:01', '2023-05-22 22:25:01', 1, 0),
(7, 7, 'mingi55', '흙꿈치123', '손민기', 1000000, '2023-05-22 23:01:48', '2023-05-22 23:01:48', 1, 0),
(8, 8, 'test0070', '아라비카', '메시	', 1000000, '2023-05-23 11:15:15', '2023-05-23 11:15:15', 1, 0),
(9, 9, 'test0001', '닉네임취소', '김철수	', 1000000, '2023-05-23 11:16:40', '2023-05-23 11:16:40', 1, 0),
(10, 10, 'dkw121', '이따다끼마스', '최계원', 1000000, '2023-05-23 13:52:56', '2023-05-23 13:52:56', 1, 0),
(11, 11, 'lwb1201', '곤죠뷰리', '충	', 1000000, '2023-05-23 13:55:06', '2023-05-23 13:55:06', 1, 0),
(12, 12, 'test99', 'messi', 'messi	', 1000000, '2023-05-23 15:53:36', '2023-05-23 15:53:36', 0, 0),
(13, 12, 'test99', 'messi', 'messi', 1000000, '2023-05-23 15:54:18', '2023-05-23 15:54:18', 1, 0),
(14, 14, 'test114', '와스레나이', '만세	', 1000000, '2023-05-23 16:40:56', '2023-05-23 16:40:56', 1, 0),
(15, 15, 'user6', 'user6', '123', 100000, '2023-05-23 18:54:49', '2023-05-23 18:54:49', 1, 0),
(16, 13, 'user5', 'user5', '1111', 200000, '2023-05-23 18:55:01', '2023-05-23 18:55:01', 1, 0),
(17, 13, 'user5', 'user5', '123', 50000, '2023-05-23 19:00:46', '2023-05-23 19:00:46', 1, 0),
(18, 13, 'user5', 'user5', '123', 50000, '2023-05-23 19:03:27', '2023-05-23 19:03:27', 1, 1);

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
(1, 2, -1, 'badmin', 300, 1, '2023-05-22 13:27:32', '2023-05-22 13:27:32'),
(2, 4, -1, '홍', 350, 1, '2023-05-23 13:46:56', '2023-05-23 13:46:56'),
(3, 6, -1, 'badmin2', 1100, 1, '2023-05-23 20:54:08', '2023-05-23 20:54:08');

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
(1, 'user1', -1, 1, 1, 'user1', '1111', '1111', '0101111111', 'hana', '아무개1', '1112223333', 'cadmin', '221.165.5.243', '2023-05-22 13:30:57', '2023-05-22 13:30:57', 0),
(2, 'admintest', -1, 1, 1, 'admintest', '1111', '1111', '000-0000-0000', '카카오뱅크', '테스트유저', '000-000-0000', 'cadmin', '39.118.41.186', '2023-05-22 13:46:41', '2023-05-22 13:46:41', 0),
(3, 'cuser2', -1, 1, 1, 'cuser2', '1111', '1111', '1112223333', 'kookmin', '아무개2', '1112223333', 'cadmin', '221.165.5.243', '2023-05-22 13:52:52', '2023-05-22 13:52:52', 0),
(4, 'user3', -1, 1, 1, 'user3', '1111', '1111', '1112223333', 'hana', '아무개3', '1112223333', 'cadmin', '221.165.5.243', '2023-05-22 20:49:24', '2023-05-22 20:49:24', 0),
(5, 'hit624', -1, 1, 1, '난다리까자', '1234', '1234', '01085729994', '카카오', '김영우', '3333042304085', 'cadmin', '121.177.97.91', '2023-05-22 22:20:32', '2023-05-22 22:20:32', 0),
(6, 'mingi55', -1, 1, 1, '흙꿈치123', '123456', '123456', '01071656685', '카카오뱅크', '손민기', '3333255975403', 'cadmin', '223.39.252.64', '2023-05-22 22:57:11', '2023-05-22 22:57:11', 0),
(7, 'test0070', -1, 1, 1, '아라비카', '11111111', '11111111', '0100100010', '국제', '메시', '000111000111', 'cadmin', '112.152.81.216', '2023-05-23 11:13:51', '2023-05-23 11:13:51', 0),
(8, 'test0001', -1, 1, 1, '닉네임취소', '000000', '0000', '01054569852', '카카오뱅크', '김철수', '33335565985544', 'cadmin', '112.152.81.216', '2023-05-23 11:15:15', '2023-05-23 11:15:15', 0),
(9, 'dkw121', -1, 1, 1, '이따다끼마스', '1234', '0000', '01099921546', '농협', '최계원', '3561287427713', 'cadmin', '121.177.97.91', '2023-05-23 13:48:25', '2023-05-23 13:48:25', 0),
(10, 'lwb1201', -1, 1, 1, '곤죠뷰리', '1234', '0000', '01073695317', '토스', '이원빈', '100025627191', 'cadmin', '121.177.97.91', '2023-05-23 13:51:12', '2023-05-23 13:51:12', 0),
(11, 'test99', -1, 2, 2, 'messi', '1234', '1234', '0100011556', 'kingdom', 'messi', '13214564561', 'ppap', '112.152.81.216', '2023-05-23 15:50:33', '2023-05-23 15:50:33', 0),
(12, 'user5', -1, 1, 1, 'user5', '1111', '1111', '1112223333', '123', '123', '1231231234', 'cadmin', '211.234.181.80', '2023-05-23 16:23:43', '2023-05-23 16:23:43', 0),
(13, 'test114', -1, 1, 1, '와스레나이', '1234', '1234', '01001000000', '대한민국', '만세', '110110', 'cadmin', '112.152.81.216', '2023-05-23 16:39:28', '2023-05-23 16:39:28', 0),
(14, 'user6', -1, 1, 1, 'user6', '1111', '1111', '1112223333', '111', '1111', '1112223333', 'cadmin', '221.165.5.243', '2023-05-23 18:54:21', '2023-05-23 18:54:21', 0);

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
(1, 3, -1, 1, 0, 'cadmin', 250, 'cadmin', '', '', 1, '2023-05-22 13:28:28', '2023-05-22 13:28:28'),
(2, 5, -1, 2, 0, '조성강', 250, 'ppap', '', '', 1, '2023-05-23 15:48:55', '2023-05-23 15:48:55');

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

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `user_id`, `store_id`, `nickname`, `type`, `title`, `question`, `answer`, `unread`, `alive`, `pending`, `questionDate`, `answerDate`) VALUES
(1, 2, -1, 'user1', 0, '문의', '게임이 잘되요', '즐겜하세요', 1, 1, 0, '2023-05-22 14:00:23', '2023-05-22 14:00:23'),
(2, 6, -1, '난다리까자', 0, '안녕하세요', '안녕하세여ㅛ', '.', 1, 1, 0, '2023-05-22 22:22:44', '2023-05-22 22:22:44'),
(3, 6, -1, '난다리까자', 0, '계좌문의', '계좌문의', 'ㅗ', 1, 1, 0, '2023-05-22 22:26:17', '2023-05-22 22:26:17'),
(4, 6, -1, '난다리까자', 0, '계좌문의', '나문희', 'ㅎ', 1, 1, 0, '2023-05-22 22:27:14', '2023-05-22 22:27:14'),
(5, 6, -1, '난다리까자', 0, 'ㅇㅇ', 'ㅇㅇㅇㅇ', 'ㅎ', 1, 1, 0, '2023-05-22 22:29:01', '2023-05-22 22:29:01'),
(6, 6, -1, '난다리까자', 0, '문희', 'ㅇㅇㅇㅇ', '', 1, 1, 0, '2023-05-22 22:29:20', '2023-05-22 22:29:20'),
(7, 8, -1, '아라비카', 0, '계좌문의', '계좌문의', 'ㅇ', 1, 1, 0, '2023-05-23 11:15:34', '2023-05-23 11:15:34'),
(8, 8, -1, '아라비카', 0, '계좌', '계 \r\n좌\r\n번\r\n호', '네', 1, 1, 0, '2023-05-23 12:39:23', '2023-05-23 12:39:23'),
(9, 12, -1, 'messi', 0, '첫충 문의', '롤링 몇퍼인가여', '3000% 해주시면 됩니다 회원님', 1, 1, 0, '2023-05-23 15:52:48', '2023-05-23 15:52:48');

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
(1, 1, 0, 2023, 5, 22, 1684731316588, 18698, 374010, '2023-05-22 13:55:16', '2023-05-22 13:55:16'),
(2, 3, 0, 2023, 5, 22, 1684764343108, 314753, 6295106, '2023-05-22 23:05:43', '2023-05-22 23:05:43'),
(3, 2, 0, 2023, 5, 23, 1684777474799, 151201, 3024050, '2023-05-23 02:44:34', '2023-05-23 02:44:34'),
(4, 1, 0, 2023, 5, 23, 1684814909438, 375506, 7341705, '2023-05-23 13:08:29', '2023-05-23 13:08:29');

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
  `useTicket` tinyint(1) NOT NULL DEFAULT 0,
  `updateDate` datetime NOT NULL DEFAULT current_timestamp(),
  `createDate` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_user`
--

INSERT INTO `sales_user` (`id`, `user_id`, `store_id`, `distributor_id`, `partner_id`, `year`, `month`, `day`, `timestamp`, `charge`, `point`, `transfer`, `return`, `wins`, `rakes`, `bettings`, `useTicket`, `updateDate`, `createDate`) VALUES
(1, 2, -1, 1, 1, 2023, 5, 22, 1684755368, 100000, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:37:22', '2023-05-22 13:36:08'),
(2, 4, -1, 1, 1, 2023, 5, 22, 1684756431, 200000, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:54:02', '2023-05-22 13:53:51'),
(3, 4, -1, 1, 1, 2023, 5, 22, 1684731316587, 0, 0, 0, 0, 38475, 2025, 4000, 0, '2023-05-22 13:58:18', '2023-05-22 13:55:16'),
(4, 2, -1, 1, 1, 2023, 5, 22, 1684731316587, 0, 0, 0, 0, 213749, 11249, 1000, 0, '2023-05-22 21:04:11', '2023-05-22 13:55:16'),
(5, 3, -1, 1, 1, 2023, 5, 22, 1684756807, 100000, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 14:00:25', '2023-05-22 14:00:07'),
(6, 3, -1, 1, 1, 2023, 5, 22, 1684731684208, 0, 0, 0, 0, 34200, 1800, 4500, 0, '2023-05-22 14:04:24', '2023-05-22 14:01:24'),
(7, 5, -1, 1, 1, 2023, 5, 22, 1684781423, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 20:50:34', '2023-05-22 20:50:23'),
(8, 5, -1, 1, 1, 2023, 5, 22, 1684756413678, 0, 0, 0, 0, 68888, 3624, 500, 0, '2023-05-22 21:04:11', '2023-05-22 20:53:33'),
(9, 6, -1, 1, 1, 2023, 5, 22, 1684787101, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 22:25:24', '2023-05-22 22:25:01'),
(10, 7, -1, 1, 1, 2023, 5, 22, 1684789308, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 23:03:00', '2023-05-22 23:01:48'),
(11, 6, -1, 1, 1, 2023, 5, 22, 1684764343108, 0, 0, 0, 0, 3614371, 190229, 591400, 0, '2023-05-22 23:51:02', '2023-05-22 23:05:43'),
(12, 7, -1, 1, 1, 2023, 5, 22, 1684764343108, 0, 0, 0, 0, 2365982, 124524, 591400, 0, '2023-05-22 23:51:02', '2023-05-22 23:05:43'),
(13, 6, -1, 1, 1, 2023, 5, 23, 1684777474799, 0, 0, 0, 0, 1112628, 58537, 500, 0, '2023-05-23 23:45:37', '2023-05-23 02:44:34'),
(14, 7, -1, 1, 1, 2023, 5, 23, 1684777474799, 0, 0, 0, 0, 2898152, 152528, 1000, 0, '2023-05-23 16:49:12', '2023-05-23 02:44:34'),
(15, 8, -1, 1, 1, 2023, 5, 23, 1684833315, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 11:16:13', '2023-05-23 11:15:15'),
(16, 9, -1, 1, 1, 2023, 5, 23, 1684833400, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 11:16:59', '2023-05-23 11:16:40'),
(17, 8, -1, 1, 1, 2023, 5, 23, 1684808284820, 0, 0, 0, 0, 999876, 53390, 2125, 0, '2023-05-23 15:06:33', '2023-05-23 11:18:04'),
(18, 9, -1, 1, 1, 2023, 5, 23, 1684808284820, 0, 0, 0, 0, 5715778, 154701, 1000, 0, '2023-05-23 16:49:12', '2023-05-23 11:18:04'),
(19, 10, -1, 1, 1, 2023, 5, 23, 1684842776, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 13:53:27', '2023-05-23 13:52:56'),
(20, 11, -1, 1, 1, 2023, 5, 23, 1684842906, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 13:55:15', '2023-05-23 13:55:06'),
(21, 10, -1, 1, 1, 2023, 5, 23, 1684818038652, 0, 0, 0, 0, 936792, 48139, 1500, 0, '2023-05-23 23:50:23', '2023-05-23 14:00:38'),
(22, 11, -1, 1, 1, 2023, 5, 23, 1684818038652, 0, 0, 0, 0, 1189936, 59159, 1500, 0, '2023-05-23 23:50:23', '2023-05-23 14:00:38'),
(23, 12, -1, 2, 2, 2023, 5, 23, 1684850058, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 15:54:37', '2023-05-23 15:54:18'),
(24, 12, -1, 2, 2, 2023, 5, 23, 1684825091285, 0, 0, 0, 0, 259153, 13639, 1000, 0, '2023-05-23 16:38:01', '2023-05-23 15:58:11'),
(25, 14, -1, 1, 1, 2023, 5, 23, 1684852856, 1000000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 16:41:04', '2023-05-23 16:40:56'),
(26, 14, -1, 1, 1, 2023, 5, 23, 1684827761892, 0, 0, 0, 0, 0, 0, 4500, 0, '2023-05-23 16:42:41', '2023-05-23 16:42:41'),
(27, 4, -1, 1, 1, 2023, 5, 23, 1684832735223, 0, 0, 0, 0, 1425, 75, 1000, 0, '2023-05-23 18:51:28', '2023-05-23 18:05:35'),
(28, 2, -1, 1, 1, 2023, 5, 23, 1684832735223, 0, 0, 0, 0, 2850, 150, 2000, 0, '2023-05-23 18:51:28', '2023-05-23 18:05:35'),
(29, 13, -1, 1, 1, 2023, 5, 23, 1684860901, 200000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 18:57:00', '2023-05-23 18:55:01'),
(30, 15, -1, 1, 1, 2023, 5, 23, 1684860889, 100000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 18:57:02', '2023-05-23 18:54:49'),
(31, 13, -1, 1, 1, 2023, 5, 23, 1684835894400, 0, 0, 0, 0, 4275, 225, 3000, 0, '2023-05-23 18:58:14', '2023-05-23 18:58:14'),
(32, 15, -1, 1, 1, 2023, 5, 23, 1684835894400, 0, 0, 0, 0, 0, 0, 1500, 0, '2023-05-23 18:58:14', '2023-05-23 18:58:14'),
(33, 13, -1, 1, 1, 2023, 5, 23, 1684861246, 50000, 0, 0, 0, 0, 0, 0, 1, '2023-05-23 19:03:04', '2023-05-23 19:00:46');

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
(1, 1, 7, 0, 0, 0, 0),
(2, 2, 7, 0, 1, 1, 3),
(3, 3, 7, 0, 1, 1, 2),
(4, 4, 7, 0, 0, 0, 0),
(5, 5, 7, 0, 0, 0, 0),
(6, 6, 7, 0, 0, 2, 1),
(7, 7, 7, 0, 0, 0, 3),
(8, 8, 7, 0, 2, 1, 3),
(9, 9, 10, 0, 1, 0, 4),
(10, 10, 7, 0, 2, 2, 3),
(11, 11, 7, 0, 2, 2, 3),
(12, 12, 7, 0, 0, 0, 0),
(13, 14, 7, 0, 2, 0, 3),
(14, 13, 7, 0, 0, 0, 0),
(15, 15, 7, 0, 0, 0, 0);

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
(1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-21 21:43:44', '2023-05-21 21:28:07'),
(2, 2, 30, 0, 0, 25200, 18, 9, 1, 10, 3, 0, 3, 8, 8, 21, 6, 2, 0, 1, 0, 10468, '5c,Qc,2h,6c,8h,Qd,Td', ' ', '2023-05-23 18:53:37', '2023-05-22 13:33:49'),
(3, 3, 6, 0, 0, 8100, 4, 2, 0, 1, 1, 0, 1, 3, 3, 5, 1, 0, 0, 1, 0, 12782, 'Th,Kc,Tc,4d,Js,3c,Jc', ' ', '2023-05-22 20:50:11', '2023-05-22 13:47:05'),
(4, 4, 7, 0, 0, 8100, 3, 3, 0, 2, 0, 0, 0, 1, 1, 4, 3, 0, 0, 0, 0, 12526, 'Ts,9h,5s,2c,9c,2h,6h', ' ', '2023-05-23 18:53:45', '2023-05-22 13:53:36'),
(5, 5, 17, 0, 0, 10800, 5, 10, 0, 3, 1, 0, 0, 3, 3, 6, 6, 3, 0, 1, 0, 16976, '4s,9c,Tc,Jd,Ad,Ts,Td', ' ', '2023-05-22 21:04:11', '2023-05-22 20:50:04'),
(6, 6, 138, 0, 0, 532260, 61, 52, 6, 6, 26, 14, 9, 27, 30, 57, 5, 14, 20, 13, 1, 28820, 'As,Ac,5s,3s,9s,Ad,5d', ' ', '2023-05-23 23:48:43', '2023-05-22 22:21:11'),
(7, 7, 197, 0, 0, 251834, 62, 96, 11, 3, 12, 17, 18, 34, 39, 59, 12, 38, 31, 15, 3, 28818, '9d,Ad,3s,3c,Ac,Ks,As', ' ', '2023-05-23 20:32:36', '2023-05-22 23:01:21'),
(8, 8, 62, 0, 0, 187497, 12, 37, 1, 0, 0, 2, 2, 7, 7, 9, 5, 11, 12, 9, 2, 24667, '4h,3s,5h,9h,5d,Th,3h', ' ', '2023-05-23 15:16:12', '2023-05-23 11:14:54'),
(9, 9, 81, 0, 0, 2214158, 23, 42, 5, 3, 2, 2, 6, 17, 16, 25, 4, 12, 17, 9, 2, 28818, '9d,Ad,3s,3c,Ac,Ah,Js', ' ', '2023-05-23 16:50:37', '2023-05-23 11:15:56'),
(10, 10, 125, 0, 0, 231328, 25, 77, 4, 4, 3, 5, 4, 13, 8, 17, 22, 22, 20, 13, 3, 20486, 'Qc,9c,6h,5c,7h,Tc,8s', ' ', '2023-05-23 23:50:30', '2023-05-23 13:52:10'),
(11, 11, 120, 0, 0, 187497, 28, 74, 2, 2, 3, 5, 5, 6, 12, 12, 23, 22, 15, 14, 2, 28825, 'Ac,Ad,Ah,9s,Ts,9d,Th', ' ', '2023-05-23 23:50:24', '2023-05-23 13:54:45'),
(12, 12, 49, 0, 0, 77078, 12, 26, 2, 0, 5, 0, 2, 10, 5, 10, 8, 9, 5, 4, 3, 28748, '8d,6s,8c,8h,5d,5c,2c', ' ', '2023-05-23 16:38:04', '2023-05-23 15:52:20'),
(13, 14, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, ' ', ' ', '2023-05-23 17:15:42', '2023-05-23 16:40:45'),
(14, 13, 1, 0, 0, 1275, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-23 18:59:39', '2023-05-23 17:56:36'),
(15, 15, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, ' ', ' ', '2023-05-23 18:59:43', '2023-05-23 18:54:40');

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
(1, 'hawaii', '우리', '하와이', '00-000-0000', '', '', 0, 0, 0, 0, 0, '2023-05-10 03:03:18', '2023-05-10 03:03:18', 1, 1);

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
(1, 1, 'HOLDEM1', 0, 0, '', 9, 10, 500, 500, 1000, 30000, 300000, 1, 500, 0, 0, 0, 0, 0, 0, 1, '2023-05-10 03:29:27', '2023-05-10 03:29:27'),
(2, 1, 'HOLDEM2', 0, 0, '', 9, 10, 1000, 1000, 2000, 100000, 500000, 1, 500, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:44:03', '2023-05-22 13:44:03'),
(3, 1, 'HOLDEM3', 0, 0, '', 6, 10, 2000, 2000, 4000, 200000, 600000, 1, 500, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:44:03', '2023-05-22 13:44:03'),
(4, 1, 'HOLDEM4', 0, 0, '', 6, 10, 5000, 5000, 10000, 500000, 1500000, 1, 500, 0, 0, 0, 0, 0, 0, 1, '2023-05-22 13:44:03', '2023-05-22 13:44:03');

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

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `user_id`, `login_id`, `nickname`, `charge`, `point`, `transfer`, `return`, `transfer_fee`, `oldBalance`, `newBalance`, `updateDate`, `createDate`, `alive`, `pending`) VALUES
(1, 2, 'user1', 'user1', 100000, 0, 0, 0, 0, 0, 100000, '2023-05-22 13:37:22', '2023-05-22 13:36:08', 0, 1),
(2, 4, 'cuser2', 'cuser2', 200000, 0, 0, 0, 0, 0, 200000, '2023-05-22 13:54:02', '2023-05-22 13:53:51', 0, 1),
(3, 3, 'admintest', 'admintest', 100000, 0, 0, 0, 0, 0, 100000, '2023-05-22 14:00:25', '2023-05-22 14:00:07', 0, 1),
(4, 5, 'user3', 'user3', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-22 20:50:34', '2023-05-22 20:50:23', 0, 1),
(5, 6, 'hit624', '난다리까자', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-22 22:25:24', '2023-05-22 22:25:01', 0, 1),
(6, 7, 'mingi55', '흙꿈치123', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-22 23:03:00', '2023-05-22 23:01:48', 0, 1),
(7, 8, 'test0070', '아라비카', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-23 11:16:13', '2023-05-23 11:15:15', 0, 1),
(8, 9, 'test0001', '닉네임취소', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-23 11:16:59', '2023-05-23 11:16:40', 0, 1),
(9, 10, 'dkw121', '이따다끼마스', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-23 13:53:27', '2023-05-23 13:52:56', 0, 1),
(10, 11, 'lwb1201', '곤죠뷰리', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-23 13:55:15', '2023-05-23 13:55:06', 0, 1),
(11, 12, 'test99', 'messi', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-23 15:54:37', '2023-05-23 15:54:18', 0, 1),
(12, 14, 'test114', '와스레나이', 1000000, 0, 0, 0, 0, 0, 1000000, '2023-05-23 16:41:04', '2023-05-23 16:40:56', 0, 1),
(13, 13, 'user5', 'user5', 200000, 0, 0, 0, 0, 0, 200000, '2023-05-23 18:57:00', '2023-05-23 18:55:01', 0, 1),
(14, 15, 'user6', 'user6', 100000, 0, 0, 0, 0, 0, 100000, '2023-05-23 18:57:02', '2023-05-23 18:54:49', 0, 1),
(15, 13, 'user5', 'user5', 50000, 0, 0, 0, 0, 201275, 251275, '2023-05-23 19:03:04', '2023-05-23 19:00:46', 0, 1);

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
(2, 'user1', 'user1', '1111', '221.165.5.243', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InVzZXIxIiwicGFzc3dvcmQiOiIxMTExIiwiaWF0IjoxNjg0ODMyNjIwfQ.HaBPpTrm7bxv2pTHD2uJOfmr9rUN4zIEEcBP_rajZks', 15, 0, 127225, 0, 0, -1, 216599, 189374, 11399, -1, 1, 1, '1111', '0101111111', 'hana', '아무개1', '1112223333', 'cadmin', '', 0, 100000, 0, 0, 1, 0, 0, '', '', 0, 5, '2023-05-23 18:51:00', '2023-05-22 13:31:43', '2023-05-23 18:53:37', '2023-05-22 13:30:57', 0, 1, 0),
(3, 'admintest', 'admintest', '1111', '39.118.41.186', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImFkbWludGVzdCIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDc1NjE1N30.AcA1sK_7KGsfS3_ACi_Q8DCrtVRFQbqrN_k9f8Y8Oh0', 0, 0, 107700, 0, 0, -1, 34200, 26500, 1800, -1, 1, 1, '1111', '000-0000-0000', '카카오뱅크', '테스트유저', '000-000-0000', 'cadmin', '', 0, 100000, 0, 0, 1, 0, 0, '', '', 0, 12, '2023-05-22 20:50:03', '2023-05-22 13:46:52', '2023-05-22 20:50:11', '2023-05-22 13:46:41', 0, 1, 0),
(4, 'cuser2', 'cuser2', '1111', '221.165.5.243', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImN1c2VyMiIsInBhc3N3b3JkIjoiMTExMSIsImlhdCI6MTY4NDgzMjYzNH0.37owHTid1I0H9-0p5Wel2FrrsM-J4pEADqls2g00Q_k', 0, 0, 179900, 0, 0, -1, 39900, 60000, 2100, -1, 1, 1, '1111', '1112223333', 'kookmin', '아무개2', '1112223333', 'cadmin', '', 0, 200000, 0, 0, 1, 0, 0, '', '', 0, 2, '2023-05-23 18:04:16', '2023-05-22 13:53:01', '2023-05-23 18:53:45', '2023-05-22 13:52:52', 0, 1, 0),
(5, 'user3', 'user3', '1111', '221.165.5.243', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InVzZXIzIiwicGFzc3dvcmQiOiIxMTExIiwiaWF0IjoxNjg0NzU2MjA0fQ.mGJhHtOHQijIej4mD5wt22qj_8fWSK0a-MIJQZTnbmM', 11, 0, 966252, 0, 0, -1, 68888, 102636, 3624, -1, 1, 1, '1111', '1112223333', 'hana', '아무개3', '1112223333', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 1, '2023-05-22 21:01:54', '2023-05-22 20:49:52', '2023-05-22 21:04:11', '2023-05-22 20:49:24', 0, 1, 0),
(6, 'hit624', '난다리까자', '1234', '121.177.97.91', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImhpdDYyNCIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTY4NDg1Mjg4Nn0.lGFW3DB7-_RnHV8_N1ugqVTfxYEM3yj1_8NZbiF1-_g', 17, 0, 188168, 0, 0, -1, 4726999, 5563496, 248766, -1, 1, 1, '1234', '01085729994', '카카오', '김영우', '3333042304085', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 9, '2023-05-23 23:45:08', '2023-05-22 22:20:54', '2023-05-23 23:48:43', '2023-05-22 22:20:32', 0, 1, 0),
(7, 'mingi55', '흙꿈치123', '123456', '223.39.253.238', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6Im1pbmdpNTUiLCJwYXNzd29yZCI6IjEyMzQ1NiIsImlhdCI6MTY4NDg1NjA0NX0.2-V9aL3Lrwt_tI4acp62REPOKE3DOgULeC6TN77TPYI', 12, 0, 349138, 0, 0, -1, 5264134, 5873288, 277052, -1, 1, 1, '123456', '01071656685', '카카오뱅크', '손민기', '3333255975403', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 22, '2023-05-24 00:34:05', '2023-05-22 22:59:45', '2023-05-23 20:32:36', '2023-05-22 22:57:11', 0, 1, 0),
(8, 'test0070', '아라비카', '11111111', '112.152.81.216', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3QwMDcwIiwicGFzc3dvcmQiOiIxMTExMTExMSIsImlhdCI6MTY4NDg4OTY2MX0.8rmnQGuf0Xzh4uoc2CAq4oB__aGh1KaNv8BKwBfbU6A', 13, 0, 1086467, 0, 0, -1, 999876, 758982, 53390, -1, 1, 1, '11111111', '0100100010', '국제', '메시', '000111000111', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 7, '2023-05-24 09:54:21', '2023-05-23 11:14:23', '2023-05-23 15:16:12', '2023-05-23 11:13:51', 0, 1, 0),
(9, 'test0001', '닉네임취소', '000000', '112.152.81.216', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3QwMDAxIiwicGFzc3dvcmQiOiIwMDAwMDAiLCJpYXQiOjE2ODQ4MzkzMjl9.OCybe7Ix_RV61Bih8lCNwwmnPuMByvKJa8WatiVy_kw', 11, 0, 2117302, 0, 0, -1, 5715778, 1837453, 154701, -1, 1, 1, '0000', '01054569852', '카카오뱅크', '김철수', '33335565985544', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 2, '2023-05-23 19:55:29', '2023-05-23 11:15:53', '2023-05-23 16:50:37', '2023-05-23 11:15:15', 0, 1, 0),
(10, 'dkw121', '이따다끼마스', '1234', '121.177.97.91', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6ImRrdzEyMSIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTY4NDg1MzA5OH0.9NnwsKXADAErV1lSUWSb2cufbJ-xMJ5ClMoQbcPNjRg', 0, 0, 775541, 0, 0, -1, 936792, 1125382, 48139, -1, 1, 1, '0000', '01099921546', '농협', '최계원', '3561287427713', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 3, '2023-05-23 23:45:11', '2023-05-23 13:50:34', '2023-05-23 23:50:30', '2023-05-23 13:48:25', 0, 1, 0),
(11, 'lwb1201', '곤죠뷰리', '1234', '121.177.97.91', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6Imx3YjEyMDEiLCJwYXNzd29yZCI6IjEyMzQiLCJpYXQiOjE2ODQ4NTMzODl9.s7DGoJuSgF7_sAN_GPGIgqYXHwRRocYYB7ad35dUvvY', 0, 0, 688195, 0, 0, -1, 1189936, 1440391, 59159, -1, 1, 1, '0000', '01073695317', '토스', '이원빈', '100025627191', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 2, '2023-05-23 23:49:51', '2023-05-23 13:51:40', '2023-05-23 23:50:24', '2023-05-23 13:51:12', 0, 1, 0),
(12, 'test99', 'messi', '1234', '112.152.81.216', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3Q5OSIsInBhc3N3b3JkIjoiMTIzNCIsImlhdCI6MTY4NDgyNDc0MH0.wAoRUQsaUDXQuVsg3CCyx0u0hsLTI2677A7ZDjrgyVs', 13, 0, 937062, 0, 0, -1, 259153, 351192, 13639, -1, 2, 2, '1234', '0100011556', 'kingdom', 'messi', '13214564561', 'ppap', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 1, '2023-05-23 16:30:38', '2023-05-23 15:50:50', '2023-05-23 16:38:04', '2023-05-23 15:50:33', 0, 1, 0),
(13, 'user5', 'user5', '1111', '221.165.5.243', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InVzZXI1IiwicGFzc3dvcmQiOiIxMTExIiwiaWF0IjoxNjg0ODQwNjgxfQ.fZhk3NFfjWkaI5ckW1lSEqkGI3kbCgCJGJvszgp9xn8', 0, 0, 251275, 0, 0, -1, 4275, 3000, 225, -1, 1, 1, '1111', '1112223333', '123', '123', '1231231234', 'cadmin', '', 0, 250000, 0, 0, 2, 0, 0, '', '', 0, 4, '2023-05-23 20:18:01', '2023-05-23 16:26:10', '2023-05-23 18:59:39', '2023-05-23 16:23:43', 0, 1, 0),
(14, 'test114', '와스레나이', '1234', '112.152.81.216', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InRlc3QxMTQiLCJwYXNzd29yZCI6IjEyMzQiLCJpYXQiOjE2ODQ4Mjc2NDV9.VtLn_R8DguxCccmj11eg-PavzizUqumb5DYQhIisAbI', 10, 0, 995500, 0, 0, -1, 0, 4500, 0, -1, 1, 1, '1234', '01001000000', '대한민국', '만세', '110110', 'cadmin', '', 0, 1000000, 0, 0, 1, 0, 0, '', '', 0, 1, '2023-05-23 17:15:37', '2023-05-23 16:40:31', '2023-05-23 17:15:42', '2023-05-23 16:39:28', 0, 1, 0),
(15, 'user6', 'user6', '1111', '221.165.5.243', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbl9pZCI6InVzZXI2IiwicGFzc3dvcmQiOiIxMTExIiwiaWF0IjoxNjg0ODM1NjgwfQ.qIi0_wzK4OniedetCvzsH48hNBNJvywDN8s5RhYyIzY', 0, 0, 98500, 0, 0, -1, 0, 1500, 0, -1, 1, 1, '1111', '1112223333', '111', '1111', '1112223333', 'cadmin', '', 0, 100000, 0, 0, 1, 0, 0, '', '', 0, 1, '2023-05-23 18:57:27', '2023-05-23 18:54:26', '2023-05-23 18:59:43', '2023-05-23 18:54:21', 0, 1, 0);

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `buyins`
--
ALTER TABLE `buyins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT for table `charges`
--
ALTER TABLE `charges`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `distributors`
--
ALTER TABLE `distributors`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `joins`
--
ALTER TABLE `joins`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `partners`
--
ALTER TABLE `partners`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `sales_table`
--
ALTER TABLE `sales_table`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sales_user`
--
ALTER TABLE `sales_user`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

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
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
