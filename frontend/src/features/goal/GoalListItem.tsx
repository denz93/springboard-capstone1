import {Goal as GoalModel} from '../../api-service-factory'
import {Link} from 'react-router-dom'
import dayjs from 'dayjs'
import RelativeTime from 'dayjs/plugin/relativeTime'
import { FaDeleteLeft } from 'react-icons/fa6'
import { useDeleteGoal } from './queries'
import { useTaskList } from '../task/queries'
dayjs.extend(RelativeTime)

type GoalProps = {
  goal: NonNullable<GoalModel>
}
function GoalListItem({goal}: GoalProps) {
  const {data: tasks} = useTaskList(goal.id??0)
  const {mutate: deleteGoal, isPending: isDeleting} = useDeleteGoal()
  const totalTasks = tasks?.length??0
  const completedTasks = tasks?.filter(task => task.isCompleted).length??0
  // const percentage = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0

  const today = new Date()
  const goalStatus = goal.isCompleted 
    ? 'completed'
    : !goal.startDate || !goal.endDate
      ? 'invalid date'
      : today < goal.startDate
        ? 'planning'
        : today > goal.endDate 
          ? 'overdue'
          : 'in progress'
  const goalStatusClass = goalStatus === 'completed'
  ? 'badge-secondary'
  : goalStatus === 'planning'
    ? 'badge-neutral'
    : goalStatus === 'overdue'
      ? 'badge-error'
      : 'badge-success'
  return (
    <div className='carousel carousel-end w-full h-full'>
      <div className='carousel-item card card-compact bg-base-200 w-full min-h-full'>
        
        <div className='card-body'>
          <progress className={`progress w-full relative overflow-visible after:content-[attr(aria-about)] after:absolute after:inset-0 after:flex after:items-center after:justify-center after:brightness-50`} value={completedTasks} max={totalTasks}></progress>
          <div className='flex justify-between flex-wrap '>
            <div className='text-gray-500 italic self-start'>{dayjs(goal.createdAt).fromNow()}</div>
            <div className={`badge ${goalStatusClass} self-end uppercase`}>{goalStatus}</div>
          </div>
          <h2 className='card-title'>{goal.title}</h2>
          <p className='text-gray-500 w-full line-clamp-2'>{goal.description}</p>
          <Link to={`/goals/${goal.id}`} className='btn btn-neutral btn-sm'>See more</Link>
        </div>
      </div>

      <div className='carousel-item ps-2 flex items-center'>
        <button className='btn btn-error' disabled={isDeleting} onClick={() => deleteGoal(goal.id as number)}><FaDeleteLeft/>Delete</button>
      </div>
    </div>
  );
}

export default GoalListItem;