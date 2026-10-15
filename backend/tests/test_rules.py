import unittest

from rules import count_remaining_words, determine_status, evaluate_guess


class GameRuleTests(unittest.TestCase):
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
        candidates = frozenset({"APPLE", "AMPLE", "ANGLE", "ANKLE", "ALLEY", "PLANT"})
        guesses = [
            {
                "word": "ALLEY",
                "evaluation": ["correct", "present", "absent", "present", "absent"],
            }
        ]
        self.assertEqual(count_remaining_words(candidates, guesses), 4)

    def test_status_resolves_attempt_boundaries(self):
        cases = [
            ("PLANT", "PLANT", 1, 6, "won"),
            ("PLANT", "PLANT", 6, 6, "won"),
            ("CRANE", "PLANT", 5, 6, "active"),
            ("CRANE", "PLANT", 6, 6, "lost"),
        ]
        for guess, answer, attempt, maximum_attempts, expected in cases:
            with self.subTest(guess=guess, attempt=attempt):
                self.assertEqual(
                    determine_status(guess, answer, attempt, maximum_attempts),
                    expected,
                )
