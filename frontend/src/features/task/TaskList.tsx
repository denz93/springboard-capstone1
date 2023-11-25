import React, { useCallback } from 'react';
import { useDeleteTaskMutation, useTaskCompletionMutation, useTaskList } from './queries';
import { Goal, Task } from '../../api-service-factory';
import {FaDeleteLeft} from 'react-icons/fa6'
type TaskListProps = {
  goalId: NonNullable<Goal['id']>
}
function TaskList({goalId}: TaskListProps) {
  const {data: tasks} = useTaskList(goalId)
  const { mutate, variables, isPending } = useTaskCompletionMutation(goalId)
  const { mutate: deleteTask, isPending: isDeletingTask} = useDeleteTaskMutation(goalId)
  const totalTasks = tasks?.length??0
  const completedTasks = tasks?.filter(task => task.isCompleted).length??0
  const percentage = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0
  const onCheckboxChangeFactory = useCallback((task: Task) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      task.isCompleted = event.target.checked //optimistic
      mutate({
        taskId: task.id as number, 
        updateTaskCompletionInput: {isCompleted: event.target.checked}
      })
    }
  }, [mutate])

  return (
    <div className="w-full flex flex-col items-center gap-2">
      { <div className="radial-progress bg-neutral text-base-200 border-4 border-neutral" style={{"--value": percentage} as never} role="progressbar">{percentage}%</div> }
      <ul className='list-none grid gap-2 p-0 m-0 grid-cols-1 md:grid-cols-2'>
        {tasks?.length === 0 && <li key={-1} className='italic text-center md:col-span-2'>No tasks</li>}
        {tasks?.map(task => {
          const isDescriptionExisted = task.description && task.description !== ""
          return <li className='' key={task.id}>
            <div tabIndex={isDescriptionExisted ? 0 : undefined} className=' min-w-full carousel carousel-end' onTouchStart={(e) => e.currentTarget.focus()} onBlur={(e) => e.currentTarget.scrollTo({left: 0, behavior : 'smooth'})} >

              <div className={`carousel-item  w-full items-center`}> 
                <div tabIndex={isDescriptionExisted ? 0 : undefined}  className={`collapse bg-base-200 ${isDescriptionExisted ? 'collapse-plus' : ''} `}>
                  <div className="collapse-title font-medium overflow-hidden text-ellipsis ">
                    <div className='flex gap-2 items-center '>
                      <input type="checkbox" className={`checkbox peer`} disabled={isPending && variables.taskId === task.id} checked={task.isCompleted}  onChange={onCheckboxChangeFactory(task)} />
                      <div className='peer-checked:line-through'>
                        {task.title}
                      </div>
                    </div>
                  </div>
                  <div className="collapse-content italic opacity-75"> 
                    { isDescriptionExisted &&<p className={isDescriptionExisted ? '' : 'opacity-40'}>{isDescriptionExisted ? task.description : 'No description'}</p>}
                  </div>
                </div>

              </div>

              <div className='carousel-item flex items-center p-4'>
                <span className={`btn btn-error ${isDeletingTask ? 'btn-disabled animate-pulse' : ''}`} onClick={() => deleteTask({id: task.id as number})}><FaDeleteLeft/>Delete</span>
              </div>
            </div>
          </li>
        })}
      </ul>
    </div>
  );
}

export default TaskList;