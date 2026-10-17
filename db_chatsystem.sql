-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 17, 2026 at 07:52 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_chatsystem`
--

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('private','group') NOT NULL DEFAULT 'private',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `type`, `created_at`, `updated_at`) VALUES
(2, 'private', '2026-10-17 01:45:56', '2026-10-17 05:36:01'),
(3, 'private', '2026-10-17 02:18:50', '2026-10-17 02:18:50'),
(4, 'private', '2026-10-17 02:19:28', '2026-10-17 02:19:28'),
(5, 'private', '2026-10-17 02:19:30', '2026-10-17 02:19:30'),
(6, 'private', '2026-10-17 02:31:19', '2026-10-17 02:31:19'),
(7, 'private', '2026-10-17 05:49:12', '2026-10-17 05:49:12'),
(8, 'private', '2026-10-17 05:50:21', '2026-10-17 05:50:21'),
(9, 'private', '2026-10-17 05:50:21', '2026-10-17 05:51:30');

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `last_read_message_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `conversation_participants`
--

INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_message_id`, `created_at`) VALUES
(3, 2, 5, NULL, '2026-10-17 01:45:56'),
(4, 2, 6, NULL, '2026-10-17 01:45:56'),
(5, 3, 6, NULL, '2026-10-17 02:18:50'),
(6, 3, 7, NULL, '2026-10-17 02:18:50'),
(7, 4, 5, NULL, '2026-10-17 02:19:28'),
(8, 4, 7, NULL, '2026-10-17 02:19:28'),
(9, 5, 5, NULL, '2026-10-17 02:19:31'),
(10, 5, 8, NULL, '2026-10-17 02:19:31'),
(11, 6, 6, NULL, '2026-10-17 02:31:19'),
(12, 6, 8, NULL, '2026-10-17 02:31:19'),
(13, 7, 7, NULL, '2026-10-17 05:49:12'),
(14, 7, 8, NULL, '2026-10-17 05:49:12'),
(15, 8, 9, NULL, '2026-10-17 05:50:21'),
(16, 8, 6, NULL, '2026-10-17 05:50:21'),
(17, 9, 9, NULL, '2026-10-17 05:50:21'),
(18, 9, 5, NULL, '2026-10-17 05:50:21');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `original_content` text NOT NULL,
  `masked_content` text NOT NULL,
  `status` enum('sent','delivered','read') NOT NULL DEFAULT 'sent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `original_content`, `masked_content`, `status`, `created_at`) VALUES
(8, 2, 5, 'Hi Bob! Welcome to the new secure real-time chat.', 'Hi Bob! Welcome to the new secure real-time chat.', 'read', '2026-10-17 01:45:56'),
(9, 2, 6, 'Hey Alice! Glad to be here. Did you get the project docs?', 'Hey Alice! Glad to be here. Did you get the project docs?', 'read', '2026-10-17 01:45:56'),
(10, 2, 5, 'Not yet. Could you email them to me at alice.work@company.org or text my phone +91 98765 43210?', 'Not yet. Could you email them to me at a********k@company.org or text my phone +91 98*****210?', 'read', '2026-10-17 01:45:56'),
(11, 2, 6, 'Sure! You can also reach me at bob.smith@example.com or call (555) 123-4567.', 'Sure! You can also reach me at b*******h@example.com or call 55******67.', 'read', '2026-10-17 01:45:56'),
(12, 2, 5, 'Hey Bob, call my personal mobile 9876543210 or email secret@private.com', 'Hey Bob, call my personal mobile 98******10 or email s****t@private.com', 'read', '2026-10-17 02:10:01'),
(13, 2, 6, 'hiiii', 'hiiii', 'read', '2026-10-17 02:18:57'),
(14, 2, 5, 'Hey Bob, call my personal mobile 9876543210 or email secret@private.com', 'Hey Bob, call my personal mobile 98******10 or email s****t@private.com', 'read', '2026-10-17 05:36:00'),
(15, 9, 9, 'hiii', 'hiii', 'read', '2026-10-17 05:50:40'),
(16, 9, 5, 'hiii', 'hiii', 'read', '2026-10-17 05:51:30');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` enum('online','offline') NOT NULL DEFAULT 'offline',
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `avatar`, `status`, `last_seen_at`, `created_at`, `updated_at`) VALUES
(5, 'Alice Johnson', 'alice@example.com', '+1 555-019-2834', '$2a$10$OfoO7jRwf16FbufFsNON8eyssX11.H3c6Q6uvTsnWq8JV843s6LWW', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'online', '2026-10-17 05:50:50', '2026-10-17 01:45:56', '2026-10-17 05:50:50'),
(6, 'Bob Smith', 'bob.smith@example.com', '+91 98765 43210', '$2a$10$OfoO7jRwf16FbufFsNON8eyssX11.H3c6Q6uvTsnWq8JV843s6LWW', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'offline', '2026-10-17 05:39:02', '2026-10-17 01:45:56', '2026-10-17 05:39:02'),
(7, 'Charlie Brown', 'charlie.brown@example.com', '(555) 123-4567', '$2a$10$OfoO7jRwf16FbufFsNON8eyssX11.H3c6Q6uvTsnWq8JV843s6LWW', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', 'offline', '2026-10-17 05:49:26', '2026-10-17 01:45:56', '2026-10-17 05:49:26'),
(8, 'Diana Prince', 'diana@example.com', '9876543210', '$2a$10$OfoO7jRwf16FbufFsNON8eyssX11.H3c6Q6uvTsnWq8JV843s6LWW', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'offline', '2026-10-17 01:45:56', '2026-10-17 01:45:56', '2026-10-17 01:45:56'),
(9, 'shivam kumar', 'shivamnnr66@gmail.com', '9575775862', '$2a$10$uFVNaoejwEZZZchoi4zVhesLqGh6O.NVBMwgW.mXwGrbneubajxSe', 'https://api.dicebear.com/7.x/initials/svg?seed=shivam%20kumar', 'online', NULL, '2026-10-17 05:50:09', '2026-10-17 05:50:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversations_updated_at` (`updated_at`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_convo_user` (`conversation_id`,`user_id`),
  ADD KEY `idx_participant_user` (`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_convo_history` (`conversation_id`,`created_at`),
  ADD KEY `fk_msg_sender` (`sender_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `fk_cp_convo` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_msg_convo` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
