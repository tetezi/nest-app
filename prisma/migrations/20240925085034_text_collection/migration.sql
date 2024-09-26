-- CreateTable
CREATE TABLE `text_collection` (
    `id` VARCHAR(36) NOT NULL,
    `text` VARCHAR(250) NOT NULL,
    `author` VARCHAR(50) NULL,
    `source` VARCHAR(50) NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
