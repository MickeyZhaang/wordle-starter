import { useContext } from 'react'
import { GameActionsContext, GameStateContext } from './gameContext.js'

function useRequiredContext(context, name) {
  const value = useContext(context)
  if (value === null) throw new Error(`${name} must be used within GameProvider`)
  return value
}

export function useGameState() {
  return useRequiredContext(GameStateContext, 'useGameState')
}

export function useGameActions() {
  return useRequiredContext(GameActionsContext, 'useGameActions')
}
