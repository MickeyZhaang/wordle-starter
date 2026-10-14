import sqlite3
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Barrier
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

import storage
from main import create_app
from words import DICTIONARY_VERSION

ANSWERS = {5: "PLANT", 6: "GARDEN", 7: "ORCHARD", 8: "SEEDLING"}
INCORRECT = {5: "CRANE", 6: "PLANET", 7: "PICTURE", 8: "NOTEBOOK"}


class ApiTests(unittest.TestCase):
    def setUp(self):
        directory = self.enterContext(TemporaryDirectory())
        self.database_path = Path(directory) / "wordle.db"
        self.app = create_app(self.database_path)
        self.client = self.enterContext(TestClient(self.app))

    def new_game(self, length=5):
        with patch("game.choice", return_value=ANSWERS[length]):
            response = self.client.post("/games", json={"wordLength": length})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.headers["location"], f"/games/{response.json()['id']}")
        return response.json()

    def submit(self, game, word, version=None):
        return self.client.post(
            f"/games/{game['id']}/guesses",
            json={
                "word": word,
                "expectedVersion": game["version"] if version is None else version,
            },
        )

    def assert_error(self, response, status, code):
        self.assertEqual(response.status_code, status, response.text)
        self.assertEqual(response.json()["error"]["code"], code)
        self.assertIsInstance(response.json()["error"]["message"], str)

    def test_create_and_retrieve_every_length_without_answer(self):
        for length in range(5, 9):
            with self.subTest(length=length):
                game = self.new_game(length)
                self.assertEqual(
                    set(game), {"id", "wordLength", "maxAttempts", "status", "version", "guesses"}
                )
                self.assertEqual(game["wordLength"], length)
                self.assertEqual(game["maxAttempts"], length + 1)
                self.assertEqual(game["status"], "active")
                self.assertEqual(game["version"], 0)
                self.assertEqual(game["guesses"], [])
                self.assertEqual(self.client.get(f"/games/{game['id']}").json(), game)

    def test_games_are_independent(self):
        first = self.new_game()
        second = self.new_game()
        self.assertNotEqual(first["id"], second["id"])
        self.assertEqual(self.submit(first, "PLANT").json()["status"], "won")
        self.assertEqual(self.client.get(f"/games/{second['id']}").json(), second)

    def test_create_rejects_invalid_lengths_types_and_extra_fields(self):
        for body in [
            {},
            {"wordLength": 4},
            {"wordLength": 9},
            {"wordLength": "5"},
            {"wordLength": 5.0},
            {"wordLength": True},
            {"wordLength": None},
            {"wordLength": 5, "answer": "PLANT"},
        ]:
            with self.subTest(body=body):
                self.assert_error(self.client.post("/games", json=body), 422, "invalid_request")

    def test_guess_rejects_malformed_values_without_consuming_a_turn(self):
        game = self.new_game()
        bodies = [
            {},
            {"word": "PLANT"},
            {"word": "PLANT", "expectedVersion": "0"},
            {"word": "PLANT", "expectedVersion": True},
            {"word": "PLANT", "expectedVersion": -1},
            {"word": "PLANT", "expectedVersion": 10},
            {"word": "PLANT", "expectedVersion": 0, "evaluation": ["correct"] * 5},
        ]
        bodies.extend(
            {"word": word, "expectedVersion": 0}
            for word in [
                None,
                12345,
                "",
                "ABCD",
                "ABCDEFGHI",
                "A1BCD",
                "APP LE",
                "ßLANT",
                "PLANT\n",
            ]
        )
        for body in bodies:
            with self.subTest(body=body):
                response = self.client.post(f"/games/{game['id']}/guesses", json=body)
                self.assert_error(response, 422, "invalid_request")
                self.assertEqual(self.client.get(f"/games/{game['id']}").json(), game)

    def test_invalid_word_and_wrong_length_do_not_consume_turns(self):
        game = self.new_game()
        for word, code in [("ZZZZZ", "invalid_word"), ("GARDEN", "wrong_length")]:
            with self.subTest(word=word):
                self.assert_error(self.submit(game, word), 422, code)
                self.assertEqual(self.client.get(f"/games/{game['id']}").json(), game)

    def test_lowercase_is_normalized_and_evaluation_is_returned(self):
        game = self.new_game()
        response = self.submit(game, "crane")
        self.assertEqual(response.status_code, 200)
        result = response.json()
        self.assertEqual(result["version"], 1)
        self.assertEqual(result["status"], "active")
        self.assertNotIn("answer", result)
        self.assertEqual(
            result["guesses"],
            [{"word": "CRANE", "evaluation": ["absent", "absent", "correct", "correct", "absent"]}],
        )

    def test_duplicate_letter_feedback_through_api(self):
        with patch("game.choice", return_value="APPLE"):
            game = self.client.post("/games", json={"wordLength": 5}).json()
        result = self.submit(game, "ALLEY").json()
        self.assertEqual(
            result["guesses"][0]["evaluation"],
            ["correct", "present", "absent", "present", "absent"],
        )

    def test_repeated_and_plural_guesses_are_allowed(self):
        game = self.new_game()
        for word in ["TREES", "TREES"]:
            response = self.submit(game, word)
            self.assertEqual(response.status_code, 200)
            game = response.json()
        self.assertEqual(game["version"], 2)

    def test_correct_letters_are_not_required_in_later_guesses(self):
        game = self.new_game()
        game = self.submit(game, "PLANE").json()
        self.assertEqual(self.submit(game, "BRICK").status_code, 200)

    def test_win_on_last_turn_for_every_length(self):
        for length in range(5, 9):
            with self.subTest(length=length):
                game = self.new_game(length)
                for _ in range(length):
                    game = self.submit(game, INCORRECT[length]).json()
                    self.assertEqual(game["status"], "active")
                game = self.submit(game, ANSWERS[length]).json()
                self.assertEqual(game["status"], "won")
                self.assertEqual(game["version"], length + 1)
                self.assertEqual(game["answer"], ANSWERS[length])
                self.assert_error(self.submit(game, INCORRECT[length]), 409, "game_finished")

    def test_loss_at_limit_for_every_length(self):
        for length in range(5, 9):
            with self.subTest(length=length):
                game = self.new_game(length)
                for _ in range(length + 1):
                    game = self.submit(game, INCORRECT[length]).json()
                self.assertEqual(game["status"], "lost")
                self.assertEqual(len(game["guesses"]), length + 1)
                self.assertEqual(game["answer"], ANSWERS[length])
                self.assert_error(self.submit(game, ANSWERS[length]), 409, "game_finished")

    def test_first_turn_win(self):
        game = self.submit(self.new_game(), "PLANT").json()
        self.assertEqual(game["status"], "won")
        self.assertEqual(game["version"], 1)
        self.assertEqual(game["answer"], "PLANT")

    def test_missing_and_malformed_game_ids(self):
        for game_id, status, code in [
            (str(uuid4()), 404, "game_not_found"),
            ("bad-id", 422, "invalid_request"),
        ]:
            with self.subTest(game_id=game_id):
                self.assert_error(self.client.get(f"/games/{game_id}"), status, code)
                self.assert_error(self.submit({"id": game_id, "version": 0}, "PLANT"), status, code)

    def test_stale_submission_cannot_consume_another_turn(self):
        game = self.new_game()
        accepted = self.submit(game, "CRANE").json()
        self.assert_error(self.submit(game, "CRANE"), 409, "stale_game")
        self.assertEqual(self.client.get(f"/games/{game['id']}").json(), accepted)

    def test_concurrent_submissions_accept_only_one_guess(self):
        game = self.new_game()
        barrier = Barrier(2)

        def submit(word):
            barrier.wait(timeout=5)
            return self.submit(game, word)

        with ThreadPoolExecutor(max_workers=2) as executor:
            responses = list(executor.map(submit, ["CRANE", "BRICK"]))
        self.assertEqual(sorted(response.status_code for response in responses), [200, 409])
        stored = self.client.get(f"/games/{game['id']}").json()
        self.assertEqual(stored["version"], 1)
        self.assertEqual(len(stored["guesses"]), 1)

    def test_failure_after_insert_rolls_back_both_history_and_version(self):
        game = self.new_game()
        insert_guess = storage.insert_guess

        def fail_after_insert(*args):
            insert_guess(*args)
            raise sqlite3.OperationalError("simulated storage failure")

        with patch("storage.insert_guess", side_effect=fail_after_insert), self.assertLogs("main"):
            self.assert_error(self.submit(game, "CRANE"), 503, "storage_unavailable")
        self.assertEqual(self.client.get(f"/games/{game['id']}").json(), game)
        self.assertEqual(self.submit(game, "CRANE").status_code, 200)

    def test_game_survives_application_restart(self):
        database = self.database_path.parent / "restart.db"
        with (
            TestClient(create_app(database)) as first_client,
            patch("game.choice", return_value="PLANT"),
        ):
            game = first_client.post("/games", json={"wordLength": 5}).json()
            accepted = first_client.post(
                f"/games/{game['id']}/guesses",
                json={"word": "CRANE", "expectedVersion": 0},
            ).json()
        with TestClient(create_app(database)) as second_client:
            self.assertEqual(second_client.get(f"/games/{game['id']}").json(), accepted)
            won = second_client.post(
                f"/games/{game['id']}/guesses",
                json={"word": "PLANT", "expectedVersion": 1},
            ).json()
        with TestClient(create_app(database)) as third_client:
            self.assertEqual(third_client.get(f"/games/{game['id']}").json(), won)
            self.assertEqual(won["status"], "won")

    def test_dictionary_version_is_persisted_and_missing_version_is_explicit(self):
        game = self.new_game()
        with storage.connect(self.database_path) as connection:
            self.assertEqual(
                storage.get_game(connection, game["id"])["dictionary_version"], DICTIONARY_VERSION
            )
            connection.execute(
                "UPDATE games SET dictionary_version = ? WHERE id = ?", ("unavailable", game["id"])
            )
        self.assertEqual(self.client.get(f"/games/{game['id']}").status_code, 200)
        self.assert_error(self.submit(game, "CRANE"), 503, "dictionary_unavailable")

    def test_openapi_documents_requests_responses_and_errors(self):
        document = self.client.get("/openapi.json").json()
        operation = document["paths"]["/games/{game_id}/guesses"]["post"]
        self.assertTrue({"200", "404", "409", "422", "503"}.issubset(operation["responses"]))
        schema = document["components"]["schemas"]["GuessRequest"]
        self.assertEqual(set(schema["required"]), {"word", "expectedVersion"})
        self.assertEqual(self.client.get("/docs").status_code, 200)

    def test_health_and_cors(self):
        self.assertEqual(self.client.get("/health").json(), {"status": "healthy"})
        response = self.client.options(
            "/games",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:5173")
