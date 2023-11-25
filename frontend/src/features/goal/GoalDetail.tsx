import { useId } from 'react';
import { Goal as GoalModel } from '../../api-service-factory';
import { useDeleteGoal, useGoal } from './queries';
import Timeline from './Timeline';
import TaskList from '../task/TaskList';
import dayjs from 'dayjs'
import RelativeTime from 'dayjs/plugin/relativeTime'
import CreateTaskForm from '../task/CreateTaskForm';
import { FaDeleteLeft } from 'react-icons/fa6';
import TaskListRecommened from '../task/TaskListRecommened';
import { useTaskList } from '../task/queries';

dayjs.extend(RelativeTime)

type GoalDetailProps = {
  goalId: NonNullable<GoalModel['id']>
}
function GoalDetail({goalId}: GoalDetailProps) {
  const { data: goal, isLoading } = useGoal(goalId)
  const {data: taskList} = useTaskList(goalId)
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoal()
  const addTaskModalId = useId()

  if (isLoading) return <div>Loading</div>
  if (!goal) return <div>Goal not found</div>
  if (!goal.startDate || !goal.endDate) return <div>Goal not started</div>

  const goalStatus = goal.status
  const goalStatusClass = goalStatus === 'completed'
    ? 'badge-secondary'
    : goalStatus === 'planning'
      ? 'badge-neutral'
      : goalStatus === 'overdue'
        ? 'badge-error'
        : 'badge-success'
  return (
    <div>
      <div className='carousel carousel-end w-full'>
        <div className='carousel-item card card-compact bg-base-200 w-full'>
          <div className='card-body'>
            <div className='flex justify-between'>
              <div className='text-gray-500 italic self-start'>{dayjs(goal.createdAt).fromNow()}</div>
              <div className={`badge ${goalStatusClass} self-end uppercase`}>{goalStatus}</div>
            </div>
            <Timeline startDate={goal.startDate} endDate={goal.endDate}></Timeline>
            <h2 className='card-title'>{goal.title}</h2>
            <p className='text-gray-500 w-full line-clamp-3'>{goal.description}</p>
          </div>
        </div>
        <div className='carousel-item ps-2 flex items-center'>
          <span 
            className={`btn btn-error ${isDeleting ? 'btn-disabled animate-pulse' : ''}`}
            onClick={() => deleteGoal(goalId)}
            >
              <FaDeleteLeft/>Delete
          </span>
        </div>
      </div>
      <h2 className='divider'>
      </h2>

      <div className='flex gap-2 flex-wrap justify-center'>
        <button 
          className="btn" 
          disabled={goal.status !== 'planning'}
          onClick={()=>{
            (document.getElementById(addTaskModalId) as HTMLDialogElement).showModal()
          }}
        >+ Add Task</button>
        <dialog id={addTaskModalId} className="modal">
          <div className="modal-box">
            <h1 className="font-bold text-center">Add a task</h1>
            <CreateTaskForm goalId={goalId}></CreateTaskForm>
           
          </div>
        </dialog>

      </div>

      { goal?.status === 'planning' && taskList?.length === 0 && <h2 className='text-center divider'>OpenAI</h2> }
      { goal?.status === 'planning' && taskList?.length === 0 && <TaskListRecommened goalId={goalId}/> }

      <h2 className='text-center divider'>Task List</h2>

      <TaskList goalId={goalId}></TaskList>
    </div>
  );
}

export default GoalDetail;