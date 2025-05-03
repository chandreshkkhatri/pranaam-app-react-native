CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_e164  text UNIQUE NOT NULL,
  created_at  timestamp with time zone DEFAULT now()
);

CREATE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles(id, phone_e164)
  VALUES (NEW.id, NEW.raw_user_meta->>'phone');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read profiles"
  ON public.profiles
  FOR SELECT
  USING ( true );
