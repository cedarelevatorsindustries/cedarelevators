-- Function to set session config for RLS
CREATE OR REPLACE FUNCTION set_config(setting text, value text)
RETURNS void AS $$
BEGIN
  PERFORM set_config(setting, value, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
