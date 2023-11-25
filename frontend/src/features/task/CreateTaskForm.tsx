import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { CreateTaskInputSchema, useCreateTaskMutation } from './queries';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAlert, useAlertWatch } from '../alert/hooks';

function CreateTaskForm({goalId}: {goalId: number}) {
  const formId = useId()
  const {push} = useAlert()
  const { register, formState: { errors }, handleSubmit } = useForm<z.infer<typeof CreateTaskInputSchema>>({
    resolver: zodResolver(CreateTaskInputSchema),
  })
  const { mutate, isPending, isError, error } = useCreateTaskMutation(goalId, {
    onSuccess: () => {
      ((window.document.getElementById(formId) as HTMLFormElement).closest('dialog') as HTMLDialogElement).close()
      push({message: 'Task created successfully', type: 'success'})

    }
  })
  useAlertWatch(isError, { message: error?.message??'Error', type: 'error' })
  return (
    <form id={formId} method='dialog' onSubmit={handleSubmit((data) => {
      mutate(data)

    })}>
      <div className='form-control mb-3'>
        <label className='label'>Title</label>
        <label className='text-red-500 px-1'>{errors.title?.message}</label>
        <input
          {...register("title")}
          className='input input-bordered w-full'
          placeholder='Ex: Learn React in 30 days'
        />
      </div>
      <div className='form-control mb-3'>
        <label className='label'>Description</label>
        <label className='text-red-500 px-1'>{errors.description?.message}</label>
        <textarea 
          {...register("description")}
          className='textarea textarea-bordered w-full'
          rows={3}
          placeholder='Ex: Understand the basic and advanced concepts of React'
          ></textarea>
      </div>
      <div className='modal-action'>

        <button 
          className='btn btn-secondary'
          disabled={isPending}
          >Add</button>
        <button 
          className='btn' 
          onClick={(e) => {
            e.preventDefault();
            ((window.document.getElementById(formId) as HTMLFormElement).closest('dialog') as HTMLDialogElement).close()
          }}
        >
          Close</button>
        
          
      </div>
    </form>
  );
}

export default CreateTaskForm;