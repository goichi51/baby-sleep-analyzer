CREATE TABLE `diaries` (
	`date` date PRIMARY KEY,
	`text` varchar(256) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `states` (
	`type` varchar(10) NOT NULL,
	`date` date NOT NULL,
	CONSTRAINT PRIMARY KEY(`type`,`date`)
);
--> statement-breakpoint
ALTER TABLE `events` ADD `memo` varchar(256) DEFAULT '';