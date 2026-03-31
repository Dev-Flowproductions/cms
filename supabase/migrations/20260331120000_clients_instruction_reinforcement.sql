-- Optional editorial reinforcement (admin): appended to clients.custom_instructions at generation time (not brand identity).
alter table public.clients
  add column if not exists instruction_reinforcement text;

comment on column public.clients.instruction_reinforcement is 'Optional admin editorial guidance (voice, narrative, scannability, audience). Appended to custom_instructions when building system prompts; separate from brand block.';
