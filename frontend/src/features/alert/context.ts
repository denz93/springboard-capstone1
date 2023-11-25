import { createContext, useContext } from "react"
import { AlertContextType } from "./hooks"

export const alertContext = createContext<
  [AlertContextType, React.Dispatch<React.SetStateAction<AlertContextType>>]
>([{alerts: [], config: {visibleDuration: 5000, hideDuration: 150}}, () => ({alerts: []})])
alertContext.displayName = 'AlertContext'
export function useAlertContext() {
  return useContext(alertContext)
}
