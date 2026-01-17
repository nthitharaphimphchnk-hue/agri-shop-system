CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerPhone` varchar(20),
	`customerAddress` text,
	`customerProvince` varchar(100),
	`customerDistrict` varchar(100),
	`totalDebt` decimal(12,2) DEFAULT '0',
	`totalPaid` decimal(12,2) DEFAULT '0',
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyClose` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`closeDate` timestamp NOT NULL,
	`totalSales` decimal(12,2) DEFAULT '0',
	`totalCash` decimal(12,2) DEFAULT '0',
	`totalCredit` decimal(12,2) DEFAULT '0',
	`totalTransactions` int DEFAULT 0,
	`notes` text,
	`closedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dailyClose_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debtTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerId` int NOT NULL,
	`saleId` int,
	`debtAmount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) NOT NULL,
	`paymentDate` timestamp NOT NULL DEFAULT (now()),
	`paymentMethod` enum('cash','transfer','check','other') DEFAULT 'cash',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debtTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`oldPrice` decimal(10,2) NOT NULL,
	`newPrice` decimal(10,2) NOT NULL,
	`changedBy` int NOT NULL,
	`changeDate` timestamp NOT NULL DEFAULT (now()),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`productCode` varchar(100),
	`productCategory` varchar(100),
	`productUnit` varchar(50),
	`costPrice` decimal(10,2),
	`sellingPrice` decimal(10,2),
	`currentStock` int DEFAULT 0,
	`minimumStock` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saleItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`saleId` int NOT NULL,
	`productId` int NOT NULL,
	`quantity` decimal(10,2) NOT NULL,
	`unitPrice` decimal(10,2) NOT NULL,
	`totalPrice` decimal(12,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saleItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shopId` int NOT NULL,
	`customerId` int,
	`saleDate` timestamp NOT NULL DEFAULT (now()),
	`totalAmount` decimal(12,2) NOT NULL,
	`paidAmount` decimal(12,2) DEFAULT '0',
	`debtAmount` decimal(12,2) DEFAULT '0',
	`paymentMethod` enum('cash','credit','transfer','other') DEFAULT 'cash',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shops` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shopName` varchar(255) NOT NULL,
	`shopPhone` varchar(20),
	`shopAddress` text,
	`shopProvince` varchar(100),
	`shopDistrict` varchar(100),
	`shopSubDistrict` varchar(100),
	`shopPostalCode` varchar(10),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `customers_shopId_idx` ON `customers` (`shopId`);--> statement-breakpoint
CREATE INDEX `dailyClose_shopId_idx` ON `dailyClose` (`shopId`);--> statement-breakpoint
CREATE INDEX `dailyClose_closeDate_idx` ON `dailyClose` (`closeDate`);--> statement-breakpoint
CREATE INDEX `debtTransactions_customerId_idx` ON `debtTransactions` (`customerId`);--> statement-breakpoint
CREATE INDEX `debtTransactions_paymentDate_idx` ON `debtTransactions` (`paymentDate`);--> statement-breakpoint
CREATE INDEX `priceHistory_productId_idx` ON `priceHistory` (`productId`);--> statement-breakpoint
CREATE INDEX `priceHistory_changeDate_idx` ON `priceHistory` (`changeDate`);--> statement-breakpoint
CREATE INDEX `products_shopId_idx` ON `products` (`shopId`);--> statement-breakpoint
CREATE INDEX `saleItems_saleId_idx` ON `saleItems` (`saleId`);--> statement-breakpoint
CREATE INDEX `saleItems_productId_idx` ON `saleItems` (`productId`);--> statement-breakpoint
CREATE INDEX `sales_shopId_idx` ON `sales` (`shopId`);--> statement-breakpoint
CREATE INDEX `sales_customerId_idx` ON `sales` (`customerId`);--> statement-breakpoint
CREATE INDEX `sales_saleDate_idx` ON `sales` (`saleDate`);--> statement-breakpoint
CREATE INDEX `shops_userId_idx` ON `shops` (`userId`);