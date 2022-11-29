reate extension if not exists 'uuid-ossp';

create table if not exists carts (
  id uuid primary key default uuid_generate_v4(),
  created_at date not null,
  updated_at date not null
);

create table if not exists cart_items (
  cart_id uuid,
  product_id uuid,
  count integer,
  foreign key ('cart_id') references 'carts' ('id')
);

insert into carts (created_at, updated_at) values ('2022-10-19', '2022-11-19');
insert into carts (created_at, updated_at) values ('2022-10-22', '2022-11-22');

insert into cart_items values ('2dec82dc-3b89-427e-8acb-65bc73f07958', '7567ec4b-b10c-45c5-9345-fc73c48a80a1', 3);
insert into cart_items values ('bfc21485-dfbb-4112-8628-3f95dee711e0', '7567ec4b-b10c-45c5-9345-fc73c48a80a1', 1);
insert into cart_items values ('bfc21485-dfbb-4112-8628-3f95dee711e0', '7567ec4b-b10c-48c5-9345-fc73c48a80a3', 1);
