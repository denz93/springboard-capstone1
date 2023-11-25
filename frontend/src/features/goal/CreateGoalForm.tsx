import {useForm, Controller} from 'react-hook-form'
import {z} from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import {format, addDays} from 'date-fns'
import {FaCalendarCheck as FaCalendarXmark} from 'react-icons/fa6'
import { Calendar } from '../../components/ui/calendar';
import { useEffect } from 'react';
import { CreateGoalInputSchema } from './CreateGoal.schema'
import { useCategoryHierarchy, useCreateGoalMutation } from './queries'
import { useAlertWatch } from '../alert/hooks'
import SearchBox from '../../components/ui/searchbox'

function CreateGoalForm() {
  const {
    register, 
    control,
    handleSubmit, 
    formState: {errors}, 
    setValue, 
    watch,
    
    } = useForm<z.infer<typeof CreateGoalInputSchema>>({
      resolver: zodResolver(CreateGoalInputSchema),
    })
    const {mutate, isPending, isError, error } = useCreateGoalMutation()
    const {data: categoryHierarchy} = useCategoryHierarchy()
    const formValues = watch()
    
    useAlertWatch(isError, {message: error?.message??'Error', type: 'error'})

    useEffect(() => {
      if (!formValues.endDate) return 
      if (formValues.startDate >= formValues.endDate) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setValue('endDate', undefined) 
      }
    }, [formValues.startDate, formValues.endDate, setValue])
  
  return (
    
    <form onSubmit={handleSubmit((data) => mutate(data))} className='flex flex-col items-center'>
      <div className='form-control mb-3 w-full max-w-xs'>
        <label className='label '>Title</label>
        <label className='text-red-500 px-1'>{errors.title?.message}</label>
        <input 
          {...register('title', {required: true})}
          className={`input input-bordered w-full max-w-xs  ${errors.title ? 'input-error' : ''}`}
          placeholder='Ex: Learn React in 30 days'
        />
      </div>

      <div className='form-control mb-3 w-full max-w-xs'>
        <label htmlFor="description" className='label'>
          Description
        </label>
        {errors.description && <label className='text-red-500 px-1'>{errors.description.message}</label>}
        <textarea
          {...register('description', {required: false, minLength: 1, maxLength: 1000})}
          className={`textarea textarea-bordered w-full max-w-xs ${errors.description ? 'textarea-error' : ''}`}
          placeholder='Ex: Understand the basic and advanced concepts of React'
          rows={3}
        />
      </div>

      <div className='form-control mb-3 w-full max-w-xs'>
        <label className='label'>Start Date</label>
        {errors.startDate && <label className='text-red-500 px-1'>{errors.startDate.message}</label>}
        <Controller
          control={control}
          name='startDate'
          render={({field: {onChange, value}}) => (
            <div className='dropdown dropdown-top' >
              <div tabIndex={0} className='join w-full focus:!outline-2 focus:!outline-offset-2 focus:!outline-neutral-600' >
                <div className='input input-bordered w-full max-w-xs text-left text-gray-400 join-item flex items-center'>
                  {(value !== null && value !== undefined) ? format(value, 'PPP') : 'Select a date'}
                </div>
                <div className='join-item input input-bordered flex items-center'><FaCalendarXmark/></div>
              </div>
              <div className='dropdown-content bg-base-100 z-10 border-solid border-[1px] border-gray-500' tabIndex={0}>
                <Calendar
                  mode='single'
                  selected={new Date(value)}
                  onSelect={onChange}
                  disabled={{before: new Date()}}
                />
              </div>
            </div>
          )}
        />
      </div>
      <div className='form-control mb-3 w-full max-w-xs'>
        <label className='label'>End Date</label>
        {errors.endDate && <label className='text-red-500 px-1'>{errors.endDate.message}</label>}
        <Controller
          control={control}
          name='endDate'
          render={({field: {onChange, value}}) => (
            <div className='dropdown dropdown-top'>
               <div tabIndex={0} className='join w-full focus:!outline-2 focus:!outline-offset-2 focus:!outline-neutral-600' >
                <div className='input input-bordered w-full max-w-xs text-left text-gray-400 join-item flex items-center'>
                  {(value !== null && value !== undefined) ? format(value, 'PPP') : 'Select a date'}
                </div>
                <div className='join-item input input-bordered flex items-center'><FaCalendarXmark/></div>
              </div>
              <div className='dropdown-content bg-base-100 z-10 border-solid border-[1px] border-gray-500' tabIndex={0}>
                <Calendar
                  mode='single'
                  selected={new Date(value)}
                  disabled={ formValues.startDate ? {before: addDays(formValues.startDate, 1)} : undefined}
                  onSelect={onChange}
                />
              </div>
            </div>
          )}
        />
      </div>
      <div className='form-control mb-3 w-full max-w-xs'>
        <label className='label'>Category</label>
        {errors.categoryId && <label className='text-red-500 px-1'>{errors.categoryId.message}</label>}
        <Controller
          control={control}
          name='categoryId'
          render={({field: {onChange, value}}) => (
            <SearchBox 
              groups={categoryHierarchy??[]}
              getDisplayValue={(t) => t.name??''} 
              getValue={(t) => t.id??0}
              className='max-w-xs w-full '
              dropdownClassName='rounded-xl'
              placeholder='Select a category'
              onSelected={onChange}
              selected={value}
            />
            
          )}
        />
      </div>
      <div className='form-control w-full max-w-xs'>
        <button className='btn btn-sm btn-outline w-full max-w-xs' disabled={isPending} type='submit'>Create</button>
      </div>
    </form>
  );
}

export default CreateGoalForm;