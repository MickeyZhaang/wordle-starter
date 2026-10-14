import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path


@contextmanager
def connect(database_path: Path):
    connection = sqlite3.connect(database_path, timeout=5, isolation_level=None)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    try:
        yield connection
    finally:
        connection.close()


@contextmanager
def transaction(connection):
    connection.execute("BEGIN IMMEDIATE")
    try:
        yield
        connection.commit()
    except BaseException:
        connection.rollback()
        raise


def initialize(database_path: Path):
    database_path.parent.mkdir(parents=True, exist_ok=True)
    with connect(database_path) as connection:
        connection.execute("PRAGMA journal_mode = WAL")
        connection.executescript("""
            CREATE TABLE IF NOT EXISTS games (
                id TEXT PRIMARY KEY,
                answer TEXT NOT NULL,
                word_length INTEGER NOT NULL CHECK (word_length BETWEEN 5 AND 8),
                status TEXT NOT NULL CHECK (status IN ('active', 'won', 'lost')),
                version INTEGER NOT NULL DEFAULT 0 CHECK (version BETWEEN 0 AND word_length + 1),
                dictionary_version TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
                CHECK (length(answer) = word_length)
            );
            CREATE TABLE IF NOT EXISTS guesses (
                game_id TEXT NOT NULL REFERENCES games(id),
                attempt INTEGER NOT NULL CHECK (attempt BETWEEN 1 AND 9),
                word TEXT NOT NULL,
                evaluation TEXT NOT NULL,
                PRIMARY KEY (game_id, attempt)
            );
        """)


def insert_game(connection, game_id, answer, word_length, dictionary_version):
    connection.execute(
        """
        INSERT INTO games (id, answer, word_length, status, dictionary_version)
        VALUES (?, ?, ?, 'active', ?)
        """,
        (game_id, answer, word_length, dictionary_version),
    )


def get_game(connection, game_id):
    rows = connection.execute(
        """
        SELECT games.*, guesses.word, guesses.evaluation
        FROM games
        LEFT JOIN guesses ON guesses.game_id = games.id
        WHERE games.id = ?
        ORDER BY guesses.attempt
        """,
        (game_id,),
    ).fetchall()
    if not rows:
        return None
    game = dict(rows[0])
    del game["word"]
    del game["evaluation"]
    game["guesses"] = [
        {"word": row["word"], "evaluation": json.loads(row["evaluation"])}
        for row in rows
        if row["word"] is not None
    ]
    return game


def insert_guess(connection, game_id, attempt, word, evaluation, status):
    connection.execute(
        "INSERT INTO guesses (game_id, attempt, word, evaluation) VALUES (?, ?, ?, ?)",
        (game_id, attempt, word, json.dumps(evaluation)),
    )
    connection.execute(
        "UPDATE games SET status = ?, version = ? WHERE id = ?",
        (status, attempt, game_id),
    )
