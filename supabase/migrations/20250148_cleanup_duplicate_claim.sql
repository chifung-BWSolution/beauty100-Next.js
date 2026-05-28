-- Cleanup duplicate salon profiles created by claim approval bug
-- Find the duplicate "admin test 2" that was created by the faulty approve logic
-- and reset the claim application

-- Step 1: Delete the duplicate salon profile created by claim approval
-- The duplicate is the one with application_id set (created by handleApproveApp)
-- while the original has no application_id and was imported from Shopify/data source
DELETE FROM salon_profiles
WHERE id IN (
  SELECT sp.id
  FROM salon_profiles sp
  INNER JOIN salon_applications sa ON sa.id = sp.application_id
  WHERE sa.application_type = 'claim'
    AND sa.salon_profile_id IS NOT NULL
);

-- Step 2: Reset the "admin test 2" claim applications to allow re-testing
-- Remove the approved claim applications for re-testing
UPDATE salon_applications
SET status = 'rejected', rejection_reason = 'Cleanup: duplicate created by bug, reset for re-test'
WHERE application_type = 'claim'
  AND status = 'approved'
  AND salon_profile_id IS NOT NULL;

-- Step 3: Clear the created_by on the original salon profiles that were claimed
-- (so user can re-claim them for testing)
UPDATE salon_profiles
SET created_by = NULL, created_by_email = NULL
WHERE id IN (
  SELECT salon_profile_id
  FROM salon_applications
  WHERE application_type = 'claim'
    AND status = 'rejected'
    AND rejection_reason = 'Cleanup: duplicate created by bug, reset for re-test'
    AND salon_profile_id IS NOT NULL
);
