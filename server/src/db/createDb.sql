-- database: db.db
DROP TABLE IF EXISTS Aste;
DROP TABLE IF EXISTS Players;
DROP TABLE IF EXISTS Fantallenatori;
DROP TABLE IF EXISTS PlayersTaken;

CREATE TABLE Aste (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    max_crediti INTEGER NOT NULL
);

CREATE TABLE Players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asta_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    team TEXT NOT NULL,
    role_classic TEXT NOT NULL,
    role_mantra_1 TEXT NOT NULL,
    role_mantra_2 TEXT NOT NULL,
    role_mantra_3 TEXT NOT NULL,
    index_classic INTEGER NOT NULL,
    index_mantra_1 INTEGER NOT NULL,
    index_mantra_2 INTEGER NOT NULL,
    index_mantra_3 INTEGER NOT NULL,
    notes TEXT NOT NULL,
    taken INTEGER NOT NULL
);

CREATE TABLE Fantallenatori (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asta_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    crediti_spent INTEGER NOT NULL
);

CREATE TABLE PlayersTaken (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    fantallenatore_id INTEGER NOT NULL,
    crediti INTEGER NOT NULL,
    index_taken INTEGER NOT NULL
);
