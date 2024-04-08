
CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  steam_id TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  max_appt INTEGER NOT NULL DEFAULT 3
    CHECK (max_appt >= 0 AND max_appt < 5),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE availability (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 0 AND day < 7),
  time INTEGER NOT NULL CHECK (time >= 0 AND time < 24)
);


CREATE TABLE games (
  game_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  img_url TEXT
);

CREATE TABLE owned (
  username VARCHAR(25)
    REFERENCES users ON DELETE CASCADE,
  game_id INTEGER
    REFERENCES games ON DELETE CASCADE,
  PRIMARY KEY (username, game_id)
);

CREATE TABLE appts (
  appt_id SERIAL PRIMARY KEY,
  player_1 VARCHAR(25)
    REFERENCES users(username) ON DELETE CASCADE,
  player_2 VARCHAR(25)
    REFERENCES users(username) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  complete BOOLEAN NOT NULL DEFAULT FALSE,
  cancelled BOOLEAN NOT NULL DEFAULT FALSE,
  rating INTEGER DEFAULT 0
);

CREATE TABLE messages (
  room_id INTEGER
    REFERENCES appts(appt_id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender VARCHAR(25)
    REFERENCES users(username) ON DELETE CASCADE,
  send_time TIMESTAMP NOT NULL
);

