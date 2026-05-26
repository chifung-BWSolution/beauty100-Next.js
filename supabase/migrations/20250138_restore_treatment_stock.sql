UPDATE treatments
SET limited_quantity = limited_quantity + 2,
    updated_at = NOW()
WHERE limited_quantity = 0
  AND limited_quantity IS NOT NULL;
