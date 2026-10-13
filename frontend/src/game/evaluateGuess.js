const STATE_PRIORITY = {
  absent: 1,
  present: 2,
  correct: 3,
}

export function evaluateGuess(guess, answer) {
  const result = Array(guess.length).fill('absent')
  const remainingLetters = {}

  for (let index = 0; index < answer.length; index += 1) {
    if (guess[index] === answer[index]) {
      result[index] = 'correct'
    } else {
      remainingLetters[answer[index]] = (remainingLetters[answer[index]] ?? 0) + 1
    }
  }

  for (let index = 0; index < guess.length; index += 1) {
    if (result[index] === 'correct') continue
    const letter = guess[index]
    if ((remainingLetters[letter] ?? 0) > 0) {
      result[index] = 'present'
      remainingLetters[letter] -= 1
    }
  }

  return result
}

export function mergeKeyboardState(previous, guess, evaluation) {
  return evaluation.reduce((next, state, index) => {
    const letter = guess[index]
    if (!next[letter] || STATE_PRIORITY[state] > STATE_PRIORITY[next[letter]]) {
      next[letter] = state
    }
    return next
  }, { ...previous })
}
