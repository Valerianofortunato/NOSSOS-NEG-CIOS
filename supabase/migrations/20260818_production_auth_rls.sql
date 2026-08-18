-- NOSSOS NEGÓCIOS: production auth + RLS foundation
-- Safe to re-run. Existing custom profile IDs are preserved.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()::text), false);
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

do $$
begin
  if exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='password') then
    alter table public.profiles drop column password;
  end if;
end $$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, phone, account_type, referral_code, avatar)
  values (
    new.id::text,
    coalesce(new.raw_user_meta_data->>'name', split_part(coalesce(new.email,''),'@',1), 'Utilizador'),
    lower(coalesce(new.email, '')),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'account_type', 'cliente'),
    coalesce(new.raw_user_meta_data->>'referral_code', 'REF-' || upper(substr(replace(new.id::text,'-',''),1,8))),
    new.raw_user_meta_data->>'avatar'
  )
  on conflict (id) do update set
    email = excluded.email,
    phone = coalesce(excluded.phone, public.profiles.phone),
    name = coalesce(nullif(excluded.name,''), public.profiles.name),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

do $$
declare
  t text;
begin
  foreach t in array array['profiles','products','favorites','conversations','chat_messages','notifications','user_ratings','commission_negotiations','transactions','payment_orders','ad_campaigns','kyc_submissions','reports','job_candidacies'] loop
    if to_regclass('public.' || t) is not null then
      execute format('alter table public.%I enable row level security', t);
    end if;
  end loop;
end $$;

drop policy if exists "profiles_public_read" on public.profiles;
create policy "profiles_public_read" on public.profiles for select to anon, authenticated using (true);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (id = auth.uid()::text);
drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles for update to authenticated using (id = auth.uid()::text or public.is_admin()) with check (id = auth.uid()::text or public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select to anon, authenticated using (true);
drop policy if exists "products_insert_owner" on public.products;
create policy "products_insert_owner" on public.products for insert to authenticated with check (seller_id = auth.uid()::text or public.is_admin());
drop policy if exists "products_update_owner" on public.products;
create policy "products_update_owner" on public.products for update to authenticated using (seller_id = auth.uid()::text or public.is_admin()) with check (seller_id = auth.uid()::text or public.is_admin());
drop policy if exists "products_delete_owner" on public.products;
create policy "products_delete_owner" on public.products for delete to authenticated using (seller_id = auth.uid()::text or public.is_admin());

drop policy if exists "favorites_own" on public.favorites;
create policy "favorites_own" on public.favorites for all to authenticated using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

drop policy if exists "conversations_participants" on public.conversations;
create policy "conversations_participants" on public.conversations for all to authenticated using (buyer_id = auth.uid()::text or seller_id = auth.uid()::text or public.is_admin()) with check (buyer_id = auth.uid()::text or seller_id = auth.uid()::text or public.is_admin());

drop policy if exists "chat_messages_participants" on public.chat_messages;
create policy "chat_messages_participants" on public.chat_messages for all to authenticated using (sender_id = auth.uid()::text or exists (select 1 from public.conversations c where c.id = conversation_id and (c.buyer_id = auth.uid()::text or c.seller_id = auth.uid()::text)) or public.is_admin()) with check (sender_id = auth.uid()::text or public.is_admin());

drop policy if exists "notifications_own" on public.notifications;
create policy "notifications_own" on public.notifications for all to authenticated using (target_user_id = auth.uid()::text or public.is_admin()) with check (target_user_id = auth.uid()::text or public.is_admin());

drop policy if exists "ratings_public_read" on public.user_ratings;
create policy "ratings_public_read" on public.user_ratings for select to anon, authenticated using (true);
drop policy if exists "ratings_author_write" on public.user_ratings;
create policy "ratings_author_write" on public.user_ratings for all to authenticated using (author_id = auth.uid()::text or public.is_admin()) with check (author_id = auth.uid()::text or public.is_admin());

drop policy if exists "kyc_own_or_admin" on public.kyc_submissions;
create policy "kyc_own_or_admin" on public.kyc_submissions for all to authenticated using (user_id = auth.uid()::text or public.is_admin()) with check (user_id = auth.uid()::text or public.is_admin());
drop policy if exists "reports_own_or_admin" on public.reports;
create policy "reports_own_or_admin" on public.reports for all to authenticated using (reporter_id = auth.uid()::text or public.is_admin()) with check (reporter_id = auth.uid()::text or public.is_admin());
drop policy if exists "candidacies_own_or_admin" on public.job_candidacies;
create policy "candidacies_own_or_admin" on public.job_candidacies for all to authenticated using (candidate_id = auth.uid()::text or public.is_admin()) with check (candidate_id = auth.uid()::text or public.is_admin());

drop policy if exists "transactions_participants" on public.transactions;
create policy "transactions_participants" on public.transactions for all to authenticated using (buyer_id = auth.uid()::text or seller_id = auth.uid()::text or public.is_admin()) with check (buyer_id = auth.uid()::text or seller_id = auth.uid()::text or public.is_admin());
drop policy if exists "payment_orders_owner_admin" on public.payment_orders;
create policy "payment_orders_owner_admin" on public.payment_orders for all to authenticated using (user_id = auth.uid()::text or public.is_admin()) with check (user_id = auth.uid()::text or public.is_admin());

drop policy if exists "commission_seller_admin" on public.commission_negotiations;
create policy "commission_seller_admin" on public.commission_negotiations for all to authenticated using (seller_id = auth.uid()::text or public.is_admin()) with check (seller_id = auth.uid()::text or public.is_admin());

drop policy if exists "ad_campaigns_public_read" on public.ad_campaigns;
create policy "ad_campaigns_public_read" on public.ad_campaigns for select to anon, authenticated using (status = 'approved' or company_id = auth.uid()::text or public.is_admin());
drop policy if exists "ad_campaigns_owner_admin" on public.ad_campaigns;
create policy "ad_campaigns_owner_admin" on public.ad_campaigns for all to authenticated using (company_id = auth.uid()::text or public.is_admin()) with check (company_id = auth.uid()::text or public.is_admin());

create index if not exists idx_products_seller_id on public.products(seller_id);
create index if not exists idx_favorites_user_id on public.favorites(user_id);
create index if not exists idx_conversations_buyer_id on public.conversations(buyer_id);
create index if not exists idx_conversations_seller_id on public.conversations(seller_id);
create index if not exists idx_chat_messages_sender_id on public.chat_messages(sender_id);
create index if not exists idx_notifications_target_user_id on public.notifications(target_user_id);
create index if not exists idx_transactions_buyer_id on public.transactions(buyer_id);
create index if not exists idx_transactions_seller_id on public.transactions(seller_id);
create index if not exists idx_reports_reporter_id on public.reports(reporter_id);
