from collections import Counter


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


def count_remaining_words(candidates, guesses):
    """
    Calculate exactly in O(candidates × guesses × word length)
    Favors stateless simplicity over unncessary complexity with sample size
    """
    if not guesses:
        return len(candidates)
    return sum(
        all(evaluate_guess(guess["word"], candidate) == guess["evaluation"] for guess in guesses)
        for candidate in candidates
    )


def determine_status(guess, answer, attempt, maximum_attempts):
    if guess == answer:
        return "won"
    if attempt == maximum_attempts:
        return "lost"
    return "active"
