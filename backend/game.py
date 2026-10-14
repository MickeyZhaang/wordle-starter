from collections import Counter
from secrets import choice
from uuid import uuid4

import storage
from schemas import GameResponse
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


def public_game(record):
    return GameResponse(
        id=record["id"],
        word_length=record["word_length"],
        max_attempts=record["word_length"] + 1,
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


def create_game(database_path, dictionaries, word_length):
    dictionary = dictionaries[DICTIONARY_VERSION]
    answer = choice(dictionary.answers[word_length])
    game_id = str(uuid4())
    with storage.connect(database_path) as connection, storage.transaction(connection):
        storage.insert_game(
            connection, game_id, answer, word_length, dictionary.version
        )
        return public_game(require_game(connection, game_id))


def retrieve_game(database_path, game_id):
    with storage.connect(database_path) as connection:
        return public_game(require_game(connection, game_id))


def submit_guess(database_path, dictionaries, game_id, word, expected_version):
    with storage.connect(database_path) as connection, storage.transaction(connection):
        record = require_game(connection, game_id)
        if record["version"] != expected_version:
            raise GameError(
                409, "stale_game", "Retrieve the latest game before submitting again."
            )
        if record["status"] != "active":
            raise GameError(409, "game_finished", "This game has already finished.")
        if len(word) != record["word_length"]:
            raise GameError(
                422, "wrong_length", "The guess must match the game's word length."
            )
        dictionary = dictionaries.get(record["dictionary_version"])
        if dictionary is None:
            raise GameError(
                503, "dictionary_unavailable", "This game's dictionary is unavailable."
            )
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
        return public_game(require_game(connection, game_id))
