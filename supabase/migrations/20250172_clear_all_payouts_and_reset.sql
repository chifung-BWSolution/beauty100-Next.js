-- Step 1: Clear payout_id from all order_items
UPDATE order_items SET payout_id = NULL WHERE payout_id IS NOT NULL;

-- Step 2: Delete all payout_items
DELETE FROM payout_items;

-- Step 3: Delete all payouts
DELETE FROM payouts;
