import { useCallback, useEffect, useState } from 'react';
import { Goal } from '../../api-service-factory';
import { useCreateTaskMutation, useSuggestTasksQuery } from './queries';

function TaskListRecommened({goalId}: {goalId: NonNullable<Goal['id']>}) {
  const {data: tasks, isPending } = useSuggestTasksQuery(goalId)
  const {mutate: createTask, isPending: isCreating} = useCreateTaskMutation(goalId, {
    onSuccess: (data) => {
      setTasksWithSelection(tasksWithSelection.filter(t => t.title !== data.title))
    }
  })

  const [tasksWithSelection, setTasksWithSelection] = useState<((NonNullable<typeof tasks>)[number] & {selected: boolean})[]>([])
  // const selectedTasks = tasksWithSelection.filter(t => t.selected)

  const addTaskCallbacks = useCallback(() => {
    console.log('accept clicked')
    const selectedTasks = tasksWithSelection.filter(t => t.selected)
    selectedTasks.forEach(task => {
      createTask({title: task.title as string})
    })
  }, [createTask, tasksWithSelection])

  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      return setTasksWithSelection([])
    }
    setTasksWithSelection(tasks.map(t => ({...t, selected: true})))
  }, [tasks])
  return (
    <div className='indicator w-full'>
      <div className='indicator-item indicator-top indicator-start left-12 z-10'>
        <button className='btn btn-outline btn-primary btn-sm' onClick={addTaskCallbacks} disabled={isCreating}>Accept</button>
      </div>
      <div className="collapse bg-base-200 collapse-arrow">
        <input type="checkbox" /> 
        <div className="collapse-title text-xl font-medium">
          Generative Tasks {isPending && <span className="loading loading-ring loading-xs"></span>}
        </div>
        <div className="collapse-content"> 
          <ul className='p-0 m-0 list-none flex flex-wrap gap-2'>
            {isPending && <li className='w-full self-center place-items-center'><div className='animate-pulse'>Loading</div></li>}
            {!isPending && tasksWithSelection?.map(({title, selected}, idx) => <li className='w-full' key={idx}>

            <div className='form-control'>
              <label className='label cursor-pointer'>
                <span className={`label-text ${selected ? '' : 'line-through'}`}>{title}</span>
                <input 
                  type="checkbox" 
                  className={`checkbox`} 
                  checked={selected} 
                  disabled={isCreating}
                  onChange={(event) => {
                    const newSelectedTasks = [...tasksWithSelection]
                    newSelectedTasks[idx].selected = event.target.checked
                    setTasksWithSelection(newSelectedTasks)
                }}/>
              </label>
            </div>
            </li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TaskListRecommened;