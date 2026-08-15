CREATE TABLE `diaries` (
	`date` date PRIMARY KEY,
	`text` varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`datetime` datetime NOT NULL,
	`name` varchar(64) NOT NULL,
	`memo` varchar(256) DEFAULT ''
);
--> statement-breakpoint
CREATE TABLE `room_climate_logs` (
	`datetime` datetime PRIMARY KEY,
	`temperature` double NOT NULL,
	`humidity` double NOT NULL
);
--> statement-breakpoint
CREATE TABLE `states` (
	`type` varchar(10) NOT NULL,
	`datetime` datetime NOT NULL,
	CONSTRAINT PRIMARY KEY(`type`,`datetime`)
);
