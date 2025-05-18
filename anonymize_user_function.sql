-- Function to anonymize user data
CREATE OR REPLACE FUNCTION anonymize_user_data(user_uuid UUID)
RETURNS VOID 
LANGUAGE plpgsql
AS $function$
DECLARE
  random_email TEXT;
  random_string TEXT;
BEGIN
  -- Generate random values for anonymization
  random_email := 'anon_' || substr(md5(random()::text), 1, 10) || '@anonymized.invalid';
  random_string := 'Anonymized_' || substr(md5(random()::text), 1, 8);
  
  -- Update users table with anonymized data
  UPDATE auth.users
  SET email = random_email,
      phone = NULL,
      email_confirmed_at = NULL,
      phone_confirmed_at = NULL,
      last_sign_in_at = NULL
  WHERE id = user_uuid;
  
  -- Update profiles table with anonymized data
  -- Note: In the profiles table, the id field is the user's UUID
  UPDATE public.profiles
  SET bio = NULL,
      location = NULL,
      website = NULL,
      phone_number = NULL,
      address = NULL,
      city = NULL,
      state = NULL,
      country = NULL,
      postal_code = NULL
  WHERE id = user_uuid;
END;
$function$; 