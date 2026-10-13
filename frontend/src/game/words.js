export const ANSWERS = {
  5: ['PLANT', 'SHORE', 'BRICK', 'CLOUD'],
  6: ['GARDEN', 'PLANET', 'STREAM', 'MARKET'],
  7: ['ORCHARD', 'PICTURE', 'JOURNEY', 'BALANCE'],
  8: ['SEEDLING', 'NOTEBOOK', 'SUNSHINE', 'COMPUTER'],
}

const WORDS = {
  5: ['AUDIO', 'BRICK', 'CLOUD', 'CRANE', 'LEAST', 'PAINT', 'PLACE', 'PLANE', 'PLANT', 'RAISE', 'SHORE', 'SLATE', 'STARE', 'TRAIN'],
  6: ['BRIGHT', 'FRIEND', 'FROZEN', 'GARDEN', 'MARKET', 'ORANGE', 'PLANET', 'STREAM'],
  7: ['BALANCE', 'FLOWERS', 'JOURNEY', 'ORCHARD', 'PICTURE', 'TEACHER', 'VILLAGE'],
  8: ['BUILDING', 'COMPUTER', 'ELEPHANT', 'HOSPITAL', 'NOTEBOOK', 'QUESTION', 'SEEDLING', 'SUNSHINE'],
}

export const VALID_GUESSES = Object.fromEntries(
  Object.entries(WORDS).map(([length, words]) => [length, new Set(words)]),
)
