ALTER TABLE public.device_tokens
  ENABLE ROW LEVEL SECURITY;

-- 2) Allow each user to insert only their own token
CREATE POLICY "Insert own token"
  ON public.device_tokens
  FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- 3) (Also allow updates so you can upsert)
CREATE POLICY "Update own token"
  ON public.device_tokens
  FOR UPDATE
  USING ( auth.uid() = user_id );

-- 4) (Optional but recommended) Let users read their tokens back
CREATE POLICY "Select own token"
  ON public.device_tokens
  FOR SELECT
  USING ( auth.uid() = user_id );