-- Add FK from clients.user_id to public.profiles so PostgREST can resolve profiles() join
ALTER TABLE public.clients
  ADD CONSTRAINT clients_user_id_profiles_fk
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
