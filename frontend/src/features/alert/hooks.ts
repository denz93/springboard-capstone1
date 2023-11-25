import { useState, useCallback, useEffect } from "react";
import { useAlertContext } from "./context";

export type AlertType = {
  id: string
  message: string
  type: 'error' | 'success' | 'info' | 'warning'
  isFresh: boolean
}

export type AlertContextType = {
  alerts: AlertType[]
  config: {
    visibleDuration: number
    hideDuration: number
  }
}

export function useAlertData(config = {visibleDuration: 5000, hideDuration: 200}) {
  return useState<AlertContextType>({
    alerts: [],
    config: {...config}
  })
}

export function useAlert() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [alertData, setAlertData] = useAlertContext()
  const {config} = alertData
  const pop = useCallback((alertId: AlertType['id']) => {
    setAlertData((prev) => {
      const found = prev.alerts.find(a => a.id === alertId)
      if (!found) return prev
      found.isFresh = false
      return {...prev, alerts: prev.alerts}
    })
    setTimeout(() => {
      setAlertData((prev) => ({...prev, alerts: prev.alerts.filter((a) => a.id !== alertId)}))
    }, config.hideDuration)
  }, [setAlertData, config.hideDuration])

  const push = useCallback((input: Pick<AlertType, "message" | "type">) => {
    const id = randomID()
    const alert = {
      ...input,
      id,
      isFresh: true
    }
    setTimeout(() => {
      alert.isFresh = false
      setAlertData((prev) => ({...prev, alerts: prev.alerts}))
    }, config.visibleDuration)
    setTimeout(() => {
      setAlertData((prev) => ({...prev, alerts: prev.alerts.filter((a) => a.id !== id)}))
    }, config.visibleDuration + config.hideDuration)
    setAlertData((prev) => {
      return {
        ...prev,
        alerts: [...prev.alerts, alert]
      }
    })
  }, [setAlertData, config.hideDuration, config.visibleDuration])
  return {push, pop, alertList: alertData.alerts}
}

export function useAlertWatch(trueCondition: boolean, alert: Pick<AlertType, "message"| "type">) {
  const {push} = useAlert()
  const [preCondition, setPreCondition] = useState(trueCondition)
  useEffect(() => {

    if (trueCondition !== preCondition && trueCondition) {
      push(alert)
    }
    if (trueCondition !== preCondition) {
      setPreCondition(trueCondition)
    }
  }, [alert, preCondition, push, trueCondition])

}

function randomID() {
  const arr = new Uint32Array(1)
  crypto.getRandomValues(arr)
  return `${arr[0].toString()}-${Date.now().toString()}`
}