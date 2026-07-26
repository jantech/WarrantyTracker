-- =====================================================================
-- Revamp WarrantyTracker product data: consolidate to a single company
-- (JP Solar) selling solar panels, inverters, batteries, and
-- charge controllers / mounting hardware. Also renames the generic
-- "devices" concept to "products" to match the domain.
--
-- WARNING - DESTRUCTIVE SCRIPT:
--   This drops the `brands` table entirely, renames `devices` to
--   `products`, and replaces all existing rows in `products`,
--   `purchase_sources`, and `user_warranty_register`.
--   A backup was taken before running this
--   (WarrantyTracker_backup_before_solar_revamp.sql).
--
-- This version is fully static (no session variables, no PREPARE/
-- EXECUTE) using the actual constraint names found in this database:
--   fk_device_brand    -> devices.brand_id references brands.id
--   fk_register_device -> user_warranty_register.device_id references devices.id
--
-- Matches WarrantyTracker.Server/Models/Product.cs (renamed from
-- Device.cs; Brand/BrandId removed, Category added) and
-- WarrantyTracker.Server/Models/UserWarrantyRegister.cs (DeviceId ->
-- ProductId).
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- 1. Drop the two foreign keys touching devices.brand_id and
--    user_warranty_register.device_id
-- ---------------------------------------------------------------------
ALTER TABLE `user_warranty_register` DROP FOREIGN KEY `fk_register_device`;
ALTER TABLE `devices` DROP FOREIGN KEY `fk_device_brand`;

-- ---------------------------------------------------------------------
-- 2. Reshape `devices` -> `products`: drop brand_id (also drops its
--    supporting index), add category, rename the table itself
-- ---------------------------------------------------------------------
ALTER TABLE `devices` DROP COLUMN `brand_id`;
ALTER TABLE `devices` ADD COLUMN `category` VARCHAR(50) NOT NULL DEFAULT 'Solar Panel' AFTER `name`;
RENAME TABLE `devices` TO `products`;

-- ---------------------------------------------------------------------
-- 3. Rename user_warranty_register.device_id -> product_id and
--    re-create the foreign key against `products`
-- ---------------------------------------------------------------------
ALTER TABLE `user_warranty_register` CHANGE COLUMN `device_id` `product_id` INT NOT NULL;
ALTER TABLE `user_warranty_register`
    ADD CONSTRAINT `fk_register_product`
    FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

-- ---------------------------------------------------------------------
-- 4. Drop `brands` - a single-company app no longer needs a brand table
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `brands`;

-- ---------------------------------------------------------------------
-- 5. Replace existing product + registration + purchase-source data
--    with JP Solar's own catalog
-- ---------------------------------------------------------------------
DELETE FROM `user_warranty_register`;
DELETE FROM `products`;
DELETE FROM `purchase_sources`;

INSERT INTO `products` (`name`, `category`, `model_number`, `warranty_months`, `created_at`) VALUES
('Monocrystalline Solar Panel 450W', 'Solar Panel', 'SP-MONO-450', 300, NOW()),
('Polycrystalline Solar Panel 330W', 'Solar Panel', 'SP-POLY-330', 240, NOW()),
('Bifacial Solar Panel 550W', 'Solar Panel', 'SP-BIFA-550', 300, NOW()),
('Hybrid Solar Inverter 5kW', 'Inverter', 'INV-HYB-5K', 60, NOW()),
('On-Grid Solar Inverter 3kW', 'Inverter', 'INV-ONG-3K', 60, NOW()),
('Off-Grid Solar Inverter 8kW', 'Inverter', 'INV-OFG-8K', 60, NOW()),
('Lithium Solar Battery 5kWh', 'Battery', 'BAT-LI-5K', 120, NOW()),
('Lead-Acid Solar Battery 150Ah', 'Battery', 'BAT-PB-150', 36, NOW()),
('Tubular Solar Battery 200Ah', 'Battery', 'BAT-TUB-200', 48, NOW()),
('MPPT Charge Controller 60A', 'Charge Controller & Mounting', 'CC-MPPT-60', 60, NOW()),
('PWM Charge Controller 30A', 'Charge Controller & Mounting', 'CC-PWM-30', 36, NOW()),
('Solar Panel Roof Mounting Kit', 'Charge Controller & Mounting', 'MNT-ROOF-KIT', 120, NOW());

INSERT INTO `purchase_sources` (`name`, `created_at`) VALUES
('JP Solar Company Store', NOW()),
('JP Solar Authorized Dealer', NOW()),
('JP Solar Online Store', NOW()),
('Amazon', NOW()),
('Flipkart', NOW()),
('Local Solar Retail Shop', NOW());

COMMIT;
