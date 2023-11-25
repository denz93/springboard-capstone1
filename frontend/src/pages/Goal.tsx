import GoalDetail from '../features/goal/GoalDetail';
import {useParams} from 'react-router-dom'
function Goal() {
  const params = useParams()
  if (!params.id) {
    return <div>Goal not found</div>
  }
  return (
    <div>
      <h1 className=' text-center'>Goal in Detail</h1>
      <GoalDetail goalId={parseInt(params.id)}></GoalDetail>
    </div>
  );
}

export default Goal;