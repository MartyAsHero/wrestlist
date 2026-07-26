-- ============================================================
-- WRESTLIST — database schema
-- Run this once in the Supabase SQL Editor (see README.md)
-- ============================================================

-- 1. PROFILES ---------------------------------------------------
-- One row per user, auto-created when someone signs up.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. ENTRIES ------------------------------------------------------
-- The shared catalog: shows, PLEs/PPVs, documentaries, movies.
-- Everyone can read this; only you (via the SQL editor / a future
-- admin panel) can add or edit entries.
create table if not exists entries (
  id text primary key,
  title text not null,
  promotion text not null check (promotion in ('WWE', 'AEW')),
  category text not null check (category in ('Weekly Show', 'Premium Live Event', 'Special', 'Documentary', 'Movie')),
  network text,
  venue text,
  note text,
  synopsis text,
  air_date date,
  episodes int,
  state_override text, -- e.g. 'Ongoing' for always-running weekly shows
  cover_image_url text, -- optional: paste in your own licensed image URL to override the generated poster art
  created_at timestamptz default now()
);

alter table entries enable row level security;

create policy "Entries are viewable by everyone"
  on entries for select
  using (true);

-- 3. USER_ENTRIES (each person's tracked list) ---------------------
create table if not exists user_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_id text not null references entries(id) on delete cascade,
  status text not null check (status in ('Plan to Watch', 'Watching', 'Completed', 'On Hold', 'Dropped')),
  rating int check (rating >= 0 and rating <= 10) default 0,
  progress int default 0,
  updated_at timestamptz default now(),
  unique (user_id, entry_id)
);

alter table user_entries enable row level security;

create policy "Users can view their own list"
  on user_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert into their own list"
  on user_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own list"
  on user_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete from their own list"
  on user_entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. SEED DATA — 2026 WWE / AEW catalog
-- ============================================================
insert into entries (id, title, promotion, category, network, venue, note, synopsis, air_date, episodes, state_override) values
('wwe-raw', 'Monday Night Raw', 'WWE', 'Weekly Show', 'Netflix', null, 'Mondays', 'WWE''s flagship weekly show — the storylines that drive every other WWE program run through here first.', null, 30, 'Ongoing'),
('wwe-smackdown', 'SmackDown', 'WWE', 'Weekly Show', 'USA Network', null, 'Fridays', 'The Friday-night blue-brand counterpart to Raw, built around its own title picture and roster.', null, 30, 'Ongoing'),
('wwe-nxt', 'NXT', 'WWE', 'Weekly Show', 'The CW', null, 'Tuesdays', 'WWE''s developmental brand, spotlighting the next generation of talent before their main-roster call-up.', null, 30, 'Ongoing'),
('wwe-speed', 'WWE Speed', 'WWE', 'Weekly Show', 'WWE digital / X', null, 'Tuesdays', 'A short-form, fast-paced weekly series built around quick, high-intensity singles matches.', null, 28, 'Ongoing'),
('wwe-main-event', 'Main Event', 'WWE', 'Weekly Show', 'Peacock', null, 'Weekly', 'A midcard-focused companion show filling in undercard storylines between the main brands.', null, 28, 'Ongoing'),
('aew-dynamite', 'AEW Dynamite', 'AEW', 'Weekly Show', 'TBS', null, 'Wednesdays', 'AEW''s flagship weekly show, the home of its top titles and its biggest ongoing rivalries.', null, 30, 'Ongoing'),
('aew-collision', 'AEW Collision', 'AEW', 'Weekly Show', 'TNT / HBO Max', null, 'Saturdays', 'AEW''s Saturday-night show, giving a deeper roster room to build its own stories.', null, 30, 'Ongoing'),
('roh-wrestling', 'ROH Wrestling', 'AEW', 'Weekly Show', 'HonorClub', null, 'Fridays (digital)', 'Ring of Honor''s weekly digital show, run under the AEW umbrella with its own title lineage.', null, 26, 'Ongoing'),
('wwe-royal-rumble', 'Royal Rumble 2026', 'WWE', 'Premium Live Event', 'ESPN Unlimited / Netflix', 'Riyadh, Saudi Arabia', null, 'The 30-superstar over-the-top-rope battle royal, run outside North America for the first time.', '2026-01-31', null, null),
('wwe-elimination-chamber', 'Elimination Chamber 2026', 'WWE', 'Premium Live Event', 'ESPN Unlimited', 'United Center, Chicago, IL', null, 'The steel-structure gauntlet event, setting the final table for WrestleMania season.', '2026-02-28', null, null),
('wwe-wrestlemania-42', 'WrestleMania 42', 'WWE', 'Premium Live Event', 'ESPN Unlimited / Netflix', 'Las Vegas, NV', null, 'WWE''s two-night season finale, the culmination of the year''s biggest storylines.', '2026-04-05', null, null),
('wwe-clash-in-italy', 'Clash in Italy', 'WWE', 'Premium Live Event', 'Netflix', 'Inalpi Arena, Turin, Italy', null, 'The first-ever WWE Premium Live Event in Italy, part of the European Summer Tour.', '2026-05-31', null, null),
('wwe-snme-nyc', 'Saturday Night''s Main Event: NYC', 'WWE', 'Special', 'Peacock', 'Madison Square Garden, New York, NY', null, 'A revived special-event format bringing marquee matchups to MSG outside the usual PLE slate.', '2026-07-18', null, null),
('wwe-summerslam-1', 'SummerSlam 2026: Night One', 'WWE', 'Premium Live Event', 'ESPN Unlimited', 'U.S. Bank Stadium, Minneapolis, MN', null, 'Night one of WWE''s self-styled "biggest party of the summer," spread across two nights this year.', '2026-08-01', null, null),
('wwe-summerslam-2', 'SummerSlam 2026: Night Two', 'WWE', 'Premium Live Event', 'ESPN Unlimited', 'U.S. Bank Stadium, Minneapolis, MN', null, 'The concluding night of SummerSlam weekend, with the top titles on the line.', '2026-08-02', null, null),
('wwe-aaa-worlds-collide', 'WWE/AAA Worlds Collide', 'WWE', 'Special', 'Peacock', 'Allstate Arena, Chicago, IL', null, 'A crossover supercard between WWE and Lucha Libre AAA rosters.', '2026-09-26', null, null),
('wwe-mitb', 'Money in the Bank 2026', 'WWE', 'Premium Live Event', 'ESPN Unlimited', 'TBA', null, 'The ladder-match briefcase event, shifted later in the calendar from its usual summer date.', '2026-10-10', null, null),
('wwe-crown-jewel', 'Crown Jewel 2026', 'WWE', 'Premium Live Event', 'ESPN Unlimited', 'TBA', null, 'WWE''s Saudi Arabia international showcase event, date and card still being finalized.', '2026-10-24', null, null),
('wwe-survivor-series', 'Survivor Series: WarGames 2026', 'WWE', 'Premium Live Event', 'ESPN Unlimited', 'Daikin Park, Houston, TX', null, 'The traditional Thanksgiving-weekend event, built around the multi-team WarGames steel-cage match.', '2026-11-28', null, null),
('aew-revolution', 'AEW Revolution 2026', 'AEW', 'Premium Live Event', 'PPV / HBO Max', 'Crypto.com Arena, Los Angeles, CA', null, 'AEW''s early-spring pay-per-view, the seventh edition of Revolution.', '2026-03-15', null, null),
('aew-slam-dunk', 'Collision: Slam Dunk Weekend', 'AEW', 'Special', 'TNT / HBO Max', 'Save Mart Center, Fresno, CA', null, 'A two-night Collision special built around March Madness weekend energy.', '2026-03-21', null, null),
('aew-dynasty', 'AEW Dynasty 2026', 'AEW', 'Premium Live Event', 'PPV / HBO Max', 'Rogers Arena, Vancouver, BC', null, 'AEW''s spring pay-per-view, marking its first show ever held in Vancouver.', '2026-04-12', null, null),
('aew-spring-breakthru', 'Spring Break-Thru', 'AEW', 'Special', 'TBS / TNT', 'Angel of the Winds Arena, Everett, WA', null, 'A two-night Dynamite/Collision themed taping leading into the summer stretch.', '2026-04-15', null, null),
('aew-double-or-nothing', 'Double or Nothing 2026', 'AEW', 'Premium Live Event', 'PPV / HBO Max', 'Las Vegas, NV', null, 'AEW''s flagship Memorial Day weekend pay-per-view.', '2026-05-24', null, null),
('aew-forbidden-door', 'Forbidden Door 2026', 'AEW', 'Premium Live Event', 'PPV / HBO Max', 'TBA', null, 'The annual AEW x NJPW crossover supershow, opening the roster to dream matches.', '2026-06-27', null, null),
('aew-redemption', 'AEW: Redemption', 'AEW', 'Special', 'PPV / HBO Max', 'Bell Centre, Montreal, QC', null, 'A one-off special event airing live from Montreal.', '2026-07-26', null, null),
('aew-grand-slam-mexico', 'Grand Slam: Mexico', 'AEW', 'Special', 'TBS / HBO Max', 'Arena Mexico, Mexico City, MX', null, 'AEW''s first Grand Slam-branded show outside the U.S., taped at the legendary Arena Mexico.', '2026-08-05', null, null),
('aew-all-in', 'All In 2026', 'AEW', 'Premium Live Event', 'PPV / HBO Max', 'Wembley Stadium, London, UK', null, 'AEW''s stadium-scale international showcase, its biggest single-night gate of the year.', '2026-08-23', null, null),
('aew-full-gear', 'Full Gear 2026', 'AEW', 'Premium Live Event', 'PPV / HBO Max', 'Phoenix, AZ', null, 'AEW''s late-fall pay-per-view, historically one of its highest-rated shows of the year.', '2026-11-14', null, null),
('aew-worlds-end', 'Worlds End 2026', 'AEW', 'Premium Live Event', 'PPV / HBO Max', 'TBA', null, 'AEW''s year-closing pay-per-view, wrapping up the year''s remaining storylines.', '2026-12-19', null, null),
('doc-wwe24-cena', 'WWE 24: The Last Lap', 'WWE', 'Documentary', 'Peacock', null, null, 'A behind-the-scenes look at a superstar''s farewell tour, told through the road, the locker room, and the final matches.', '2026-03-01', null, null),
('doc-mr-mcmahon', 'Mr. McMahon', 'WWE', 'Documentary', 'Netflix', null, null, 'A multi-part documentary examining Vince McMahon''s rise and the controversies that ended his run atop WWE.', '2024-09-25', null, null),
('doc-wrestlers', 'Wrestlers', 'AEW', 'Documentary', 'Netflix', null, null, 'A docuseries following the day-to-day survival of an independent promotion outside the WWE/AEW spotlight.', '2023-08-09', null, null),
('movie-iron-claw', 'The Iron Claw', 'WWE', 'Movie', 'A24 / Theatrical', null, null, 'A dramatization of the Von Erich wrestling family and the tragedies behind their rise in the territory era.', '2023-12-22', null, null),
('movie-fighting-family', 'Fighting with My Family', 'WWE', 'Movie', 'MGM / Theatrical', null, null, 'A biographical comedy-drama following WWE Superstar Paige''s journey from a UK wrestling family to WWE.', '2019-02-14', null, null),
('movie-queen-of-ring', 'Queen of the Ring', 'WWE', 'Movie', 'Theatrical', null, null, 'A biopic of Mildred Burke, one of the first women to headline wrestling cards in the mid-20th century.', '2024-03-08', null, null)
on conflict (id) do nothing;
