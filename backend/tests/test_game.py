import unittest
from types import SimpleNamespace

from game import count_remaining_words, evaluate_guess


class EvaluationTests(unittest.TestCase):
    def test_exact_matches_take_priority_over_duplicate_yellows(self):
        cases = [
            ("APPLE", "APPLE", ["correct"] * 5),
            ("BRICK", "PLANT", ["absent"] * 5),
            ("ALLEY", "APPLE", ["correct", "present", "absent", "present", "absent"]),
            ("PAPAL", "APPLE", ["present", "present", "correct", "absent", "present"]),
            ("EERIE", "SERVE", ["absent", "correct", "correct", "absent", "correct"]),
            ("SASSY", "GLASS", ["present", "present", "absent", "correct", "absent"]),
        ]
        for guess, answer, expected in cases:
            with self.subTest(guess=guess, answer=answer):
                self.assertEqual(evaluate_guess(guess, answer), expected)

    def test_repeated_letters_for_every_supported_length(self):
        for length in range(5, 9):
            with self.subTest(length=length):
                answer = "A" + "B" * (length - 1)
                self.assertEqual(
                    evaluate_guess("A" * length, answer), ["correct"] + ["absent"] * (length - 1)
                )

    def test_remaining_words_respect_duplicate_letter_evaluations(self):
        dictionary = SimpleNamespace(
            guesses={5: frozenset({"APPLE", "AMPLE", "ANGLE", "ANKLE", "ALLEY", "PLANT"})},
        )
        record = {
            "word_length": 5,
            "guesses": [
                {
                    "word": "ALLEY",
                    "evaluation": ["correct", "present", "absent", "present", "absent"],
                }
            ],
        }
        self.assertEqual(count_remaining_words(dictionary, record), 4)
