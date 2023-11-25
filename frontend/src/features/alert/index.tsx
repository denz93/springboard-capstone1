import { useAlert } from "./hooks";

function Alert() {
  const {alertList, pop} = useAlert()
  const alerts = alertList.map((alert) => (
    <div 
      key={alert.id} 
      className={`alert alert-${alert.type} ${alert.isFresh ? 'opacity-100' : 'opacity-0 '} transition-all`} 
      onClick={() => pop(alert.id)}
    >
      <span>{alert.message}</span>
    </div>
  ))
  return (<div className="z-30 toast toast-top toast-center">
    {alerts}
</div>);
}

export default Alert;