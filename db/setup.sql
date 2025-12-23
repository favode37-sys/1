-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create PROFILES table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text,
  stack_amount integer default 1000 not null,
  xp_total integer default 0 not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create HAND_SCENARIOS table
create table public.hand_scenarios (
  id uuid default uuid_generate_v4() primary key,
  context jsonb not null, 
  -- Example Context: 
  -- { 
  --   "holeCards": [{"rank": "A", "suit": "spades"}, {"rank": "K", "suit": "spades"}], 
  --   "communityCards": [], 
  --   "potSize": 100,
  --   "position": "BTN" 
  -- }
  correct_action text check (correct_action in ('fold', 'call', 'raise')) not null,
  chip_explanation text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.hand_scenarios enable row level security;

-- PROFILES Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- HAND_SCENARIOS Policies
create policy "Scenarios are viewable by everyone."
  on hand_scenarios for select
  using ( true );

-- 4. Create Trigger for New User Signup
-- This ensures a profile is created automatically when a user signs up via Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, stack_amount)
  values (new.id, new.raw_user_meta_data ->> 'username', 1000);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Insert Seed Data (Reference Scenarios)
insert into public.hand_scenarios (context, correct_action, chip_explanation, difficulty)
values
  (
    '{
      "holeCards": [{"rank": "7", "suit": "spades"}, {"rank": "2", "suit": "hearts"}], 
      "communityCards": [], 
      "potSize": 10,
      "position": "UTG"
    }',
    'fold',
    '7-2 offsuit is statistically the worst hand in poker. Adding the UTG (Under The Gun) position makes this an instant fold!',
    'easy'
  ),
  (
    '{
      "holeCards": [{"rank": "A", "suit": "hearts"}, {"rank": "K", "suit": "hearts"}], 
      "communityCards": [{"rank": "Q", "suit": "hearts"}, {"rank": "J", "suit": "hearts"}, {"rank": "2", "suit": "clubs"}], 
      "potSize": 150,
      "position": "BTN"
    }',
    'raise',
    'You have a Royal Flush draw AND a straight flush draw AND top two pair. This is a monster. Build the pot!',
    'easy'
  ),
  (
    '{
      "holeCards": [{"rank": "10", "suit": "clubs"}, {"rank": "9", "suit": "clubs"}], 
      "communityCards": [{"rank": "A", "suit": "hearts"}, {"rank": "K", "suit": "diamonds"}, {"rank": "2", "suit": "spades"}], 
      "potSize": 50,
      "position": "BB"
    }',
    'fold',
    'You missed the board completely against an assumed opening range. Don''t chase emptiness on a dry heavy board.',
    'medium'
  ),
  (
    '{
      "holeCards": [{"rank": "J", "suit": "spades"}, {"rank": "J", "suit": "diamonds"}], 
      "communityCards": [{"rank": "4", "suit": "hearts"}, {"rank": "5", "suit": "clubs"}, {"rank": "9", "suit": "diamonds"}], 
      "potSize": 80,
      "position": "CO"
    }',
    'raise',
    'Overpair on a safe board. Value bet to charge weaker pairs and straight draws.',
    'medium'
  ),
  (
    '{
       "holeCards": [{"rank": "8", "suit": "hearts"}, {"rank": "9", "suit": "hearts"}],
       "communityCards": [{"rank": "7", "suit": "hearts"}, {"rank": "6", "suit": "hearts"}, {"rank": "2", "suit": "clubs"}],
       "potSize": 200,
       "position": "BTN"
    }',
    'call',
    'You have a Straight Flush draw! While raising is okay, calling keeps the opponent in the hand when you have massive implied odds.',
    'hard'
  );
