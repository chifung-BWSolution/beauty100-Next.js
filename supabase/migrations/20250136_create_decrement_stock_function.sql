CREATE OR REPLACE FUNCTION decrement_treatment_stock(p_treatment_id UUID, p_quantity INTEGER DEFAULT 1)
RETURNS VOID AS $$
BEGIN
  UPDATE treatments
  SET limited_quantity = GREATEST(limited_quantity - p_quantity, 0),
      updated_at = NOW()
  WHERE id = p_treatment_id
    AND limited_quantity IS NOT NULL
    AND limited_quantity > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
