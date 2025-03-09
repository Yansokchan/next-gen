-- Create a function to decrease product stock
CREATE OR REPLACE FUNCTION decrease_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the product stock and status if stock becomes 0
  UPDATE products
  SET 
    stock = GREATEST(0, stock - p_quantity),
    status = CASE 
      WHEN GREATEST(0, stock - p_quantity) = 0 THEN 'unavailable'::text 
      ELSE status 
    END
  WHERE id = p_product_id
  AND stock >= p_quantity;

  -- If no rows were updated, it means we don't have enough stock
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product %', p_product_id;
  END IF;
END;
$$; 