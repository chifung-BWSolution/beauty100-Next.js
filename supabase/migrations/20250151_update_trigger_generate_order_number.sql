-- Update the trigger function to also generate order_number when order is paid
CREATE OR REPLACE FUNCTION populate_order_items_on_paid()
RETURNS TRIGGER AS $$
DECLARE
  item JSONB;
  v_salon_profile_id UUID;
  v_order_number TEXT;
BEGIN
  IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status != 'paid') THEN
    -- Extract salon_profile_id from first item
    v_salon_profile_id := NULL;
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items) LIMIT 1
    LOOP
      IF item->>'salon_profile_id' IS NOT NULL AND item->>'salon_profile_id' != '' THEN
        v_salon_profile_id := (item->>'salon_profile_id')::UUID;
      END IF;
    END LOOP;

    -- Generate order number if we have a salon_profile_id
    IF v_salon_profile_id IS NOT NULL THEN
      v_order_number := generate_order_number(v_salon_profile_id);
      
      UPDATE orders 
      SET order_number = v_order_number,
          salon_profile_id = v_salon_profile_id
      WHERE id = NEW.id;
    END IF;

    -- Populate order items
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
    LOOP
      INSERT INTO order_items (
        order_id, treatment_id, salon_profile_id, member_id, name, 
        quantity, unit_price, image_url, salon_name, 
        redeem_start_date, redeem_end_date, status
      ) VALUES (
        NEW.id,
        (item->>'treatment_id')::UUID,
        CASE WHEN item->>'salon_profile_id' IS NOT NULL AND item->>'salon_profile_id' != '' 
          THEN (item->>'salon_profile_id')::UUID ELSE NULL END,
        NEW.member_id,
        item->>'name',
        COALESCE((item->>'quantity')::INTEGER, 1),
        COALESCE((item->>'promo_price')::INTEGER, (item->>'original_price')::INTEGER),
        item->>'image_url',
        item->>'salon_name',
        CASE WHEN item->>'redeem_start_date' IS NOT NULL AND item->>'redeem_start_date' != '' 
          THEN (item->>'redeem_start_date')::DATE ELSE NULL END,
        CASE WHEN item->>'redeem_end_date' IS NOT NULL AND item->>'redeem_end_date' != '' 
          THEN (item->>'redeem_end_date')::DATE ELSE NULL END,
        'pending_use'
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
