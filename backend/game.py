from collections import Counter
from functools import lru_cache
from secrets import choice
from uuid import uuid4

import storage
from schemas import GameHistoryResponse, GameResponse, GameSummaryResponse
from words import DICTIONARY_VERSION


class GameError(Exception):
    def __init__(self, status_code, code, message):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def evaluate_guess(guess, answer):
    evaluation = ["absent"] * len(guess)
    remaining = Counter()
    for index, letter in enumerate(answer):
        if guess[index] == letter:
            evaluation[index] = "correct"
        else:
            remaining[letter] += 1
    for index, letter in enumerate(guess):
        if evaluation[index] != "correct" and remaining[letter] > 0:
            evaluation[index] = "present"
            remaining[letter] -= 1
    return evaluation


@lru_cache(maxsize=4096)
def _count_compatible_words(dictionary_version, word_length, candidates, constraints):
    return sum(
        all(
            tuple(evaluate_guess(guess, candidate)) == evaluation
            for guess, evaluation in constraints
        )
        for candidate in candidates
    )


def count_remaining_words(dictionary, record):
    word_length = record["word_length"]
    candidates = dictionary.guesses[word_length]
    if not record["guesses"]:
        return len(candidates)
    constraints = tuple((guess["word"], tuple(guess["evaluation"])) for guess in record["guesses"])
    return _count_compatible_words(dictionary.version, word_length, candidates, constraints)


def public_game(record, dictionaries):
    dictionary = dictionaries.get(record["dictionary_version"])
    return GameResponse(
        id=record["id"],
        word_length=record["word_length"],
        max_attempts=record["word_length"] + 1,
        remaining_word_count=count_remaining_words(dictionary, record) if dictionary else None,
        status=record["status"],
        version=record["version"],
        guesses=record["guesses"],
        answer=record["answer"] if record["status"] != "active" else None,
    )


def require_game(connection, game_id):
    record = storage.get_game(connection, game_id)
    if record is None:
        raise GameError(404, "game_not_found", "This game does not exist.")
    return record


def create_game(database_path, dictionaries, word_length, player_id):
    dictionary = dictionaries[DICTIONARY_VERSION]
    answer = choice(dictionary.answers[word_length])
    game_id = str(uuid4())
    with storage.connect(database_path) as connection, storage.transaction(connection):
        storage.insert_game(connection, game_id, answer, word_length, dictionary.version)
        storage.insert_player_game(connection, player_id, game_id)
        record = require_game(connection, game_id)
    return public_game(record, dictionaries)


def retrieve_game(database_path, dictionaries, game_id):
    with storage.connect(database_path) as connection:
        record = require_game(connection, game_id)
    return public_game(record, dictionaries)


def attach_game(database_path, dictionaries, player_id, game_id):
    with storage.connect(database_path) as connection, storage.transaction(connection):
        record = require_game(connection, game_id)
        owner = storage.get_game_owner(connection, game_id)
        if owner is not None and owner != player_id:
            raise GameError(409, "game_owned", "This game belongs to another player profile.")
        if owner is None:
            storage.insert_player_game(connection, player_id, game_id)
    return public_game(record, dictionaries)


def list_games(database_path, player_id, limit, cursor):
    with storage.connect(database_path) as connection:
        cursor_position = None
        if cursor is not None:
            cursor_position = storage.get_history_position(connection, player_id, cursor)
            if cursor_position is None:
                raise GameError(422, "invalid_cursor", "The history cursor is invalid.")
        records = storage.list_player_games(connection, player_id, limit + 1, cursor_position)
    page = records[:limit]
    next_cursor = page[-1]["id"] if len(records) > limit else None
    return GameHistoryResponse(
        games=[
            GameSummaryResponse(
                id=record["id"],
                word_length=record["word_length"],
                max_attempts=record["word_length"] + 1,
                status=record["status"],
                version=record["version"],
                created_at=record["created_at"],
                answer=record["answer"] if record["status"] != "active" else None,
            )
            for record in page
        ],
        next_cursor=next_cursor,
    )


def submit_guess(database_path, dictionaries, game_id, word, expected_version):
    with storage.connect(database_path) as connection, storage.transaction(connection):
        record = require_game(connection, game_id)
        if record["version"] != expected_version:
            raise GameError(409, "stale_game", "Retrieve the latest game before submitting again.")
        if record["status"] != "active":
            raise GameError(409, "game_finished", "This game has already finished.")
        if len(word) != record["word_length"]:
            raise GameError(422, "wrong_length", "The guess must match the game's word length.")
        dictionary = dictionaries.get(record["dictionary_version"])
        if dictionary is None:
            raise GameError(503, "dictionary_unavailable", "This game's dictionary is unavailable.")
        if word not in dictionary.guesses[record["word_length"]]:
            raise GameError(422, "invalid_word", "Not in word list.")

        evaluation = evaluate_guess(word, record["answer"])
        attempt = record["version"] + 1
        if word == record["answer"]:
            status = "won"
        elif attempt == record["word_length"] + 1:
            status = "lost"
        else:
            status = "active"
        storage.insert_guess(connection, game_id, attempt, word, evaluation, status)
        record = require_game(connection, game_id)
    return public_game(record, dictionaries)
