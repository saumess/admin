create or replace function admin_students(p_q text default null)
returns table(roll_no text, name text, mess_card_no text, status text,
              paid_upto date, due_amount numeric, card_version int)
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'not allowed'; end if;
  return query
  select s.roll_no, s.name, s.mess_card_no, s.status, s.paid_upto, s.due_amount, s.card_version
  from students s
  where p_q is null or s.roll_no ilike '%' || p_q || '%'
     or s.mess_card_no ilike '%' || p_q || '%' or s.name ilike '%' || p_q || '%'
  order by s.mess_card_no limit 500;
end $$;

revoke all on function admin_students(text) from public, anon;
grant execute on function admin_students(text) to authenticated;
