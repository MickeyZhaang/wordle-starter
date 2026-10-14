const STATE_PRIORITY = {
  absent: 1,
  present: 2,
  correct: 3,
}

function applyGuess(state, guess, evaluation) {
  for (let index = 0; index < evaluation.length; index += 1) {
    const letter = guess[index]
    const result = evaluation[index]

    if (!state[letter] || STATE_PRIORITY[result] > STATE_PRIORITY[state[letter]]) {
      state[letter] = result
    }
  }
}

export function mergeKeyboardState(previous, guess, evaluation) {
  const next = { ...previous }
  applyGuess(next, guess, evaluation)
  return next
}

export function deriveKeyboardState(guesses) {
  const state = {}

  for (const guess of guesses) {
    applyGuess(state, guess.word, guess.evaluation)
  }

  return state
}
