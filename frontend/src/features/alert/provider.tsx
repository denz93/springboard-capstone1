import Alert from "."
import { alertContext } from "./context"
import { useAlertData } from "./hooks"

export function AlertProvider({children}: {children: React.ReactNode}) {
  const state = useAlertData()
  return <alertContext.Provider value={state}>
    <Alert/>
    {children}
  </alertContext.Provider>
}