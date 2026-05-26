UPDATE order_items oi
SET 
  image_url = COALESCE(oi.image_url, t.image_url),
  redeem_start_date = COALESCE(oi.redeem_start_date, t.redeem_start_date),
  redeem_end_date = COALESCE(oi.redeem_end_date, t.redeem_end_date)
FROM treatments t
WHERE oi.treatment_id = t.id
  AND (oi.image_url IS NULL OR oi.redeem_start_date IS NULL OR oi.redeem_end_date IS NULL);

UPDATE order_items oi
SET salon_name = sp.salon_name
FROM salon_profiles sp
WHERE oi.salon_profile_id = sp.id
  AND oi.salon_name IS NULL
  AND oi.salon_profile_id IS NOT NULL;
