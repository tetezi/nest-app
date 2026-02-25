-- CreateTable
CREATE TABLE `reservation_order` (
    `id` VARCHAR(36) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `productType` VARCHAR(191) NOT NULL,
    `reservationStatus` VARCHAR(191) NOT NULL,
    `isDepositPaid` BOOLEAN NOT NULL,
    `depositAmount` DECIMAL(10, 2) NOT NULL,
    `reservationStartTime` DATETIME(3) NOT NULL,
    `reservationEndTime` DATETIME(3) NOT NULL,
    `contactPhone` VARCHAR(191) NOT NULL,
    `specialRequirements` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
