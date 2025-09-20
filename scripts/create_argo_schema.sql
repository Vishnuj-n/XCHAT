-- Create the exact Indian Ocean ARGO profiles table schema
CREATE TABLE IF NOT EXISTS public.argo_profiles (
  id BIGSERIAL NOT NULL,
  file TEXT NULL,
  date TIMESTAMP WITH TIME ZONE NULL,
  lat DOUBLE PRECISION NULL,
  lon DOUBLE PRECISION NULL,
  mld DOUBLE PRECISION NULL,
  thermoclinedepth DOUBLE PRECISION NULL,
  salinitymindepth DOUBLE PRECISION NULL,
  salinitymaxdepth DOUBLE PRECISION NULL,
  meanstratification DOUBLE PRECISION NULL,
  ohc_0_200m DOUBLE PRECISION NULL,
  surfacetemp DOUBLE PRECISION NULL,
  surfacesal DOUBLE PRECISION NULL,
  n_levels INTEGER NULL,
  direction TEXT NULL,
  CONSTRAINT argo_profiles_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_argo_profiles_date ON public.argo_profiles(date);
CREATE INDEX IF NOT EXISTS idx_argo_profiles_location ON public.argo_profiles(lat, lon);
CREATE INDEX IF NOT EXISTS idx_argo_profiles_temp ON public.argo_profiles(surfacetemp);
CREATE INDEX IF NOT EXISTS idx_argo_profiles_sal ON public.argo_profiles(surfacesal);
CREATE INDEX IF NOT EXISTS idx_argo_profiles_mld ON public.argo_profiles(mld);
