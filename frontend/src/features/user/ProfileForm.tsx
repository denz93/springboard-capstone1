import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { UpdateUserInputSchema, useUpdateProfileMutation } from './queries';
import { useAuth } from '../auth/queries';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAlertWatch } from '../alert/hooks';

function ProfileForm() {
  const {currentUser} = useAuth()
  const {register, formState: {isDirty, errors}, handleSubmit, reset} = useForm<z.infer<typeof UpdateUserInputSchema>>({
    resolver: zodResolver(UpdateUserInputSchema)
  })
  const {mutate: updateUser, isPending, isError, isSuccess, error} = useUpdateProfileMutation()
  useAlertWatch(isSuccess, {message: 'Updated profile successfully', type: 'success'})
  useAlertWatch(isError, {message: error?.message??'Update failed', type: 'error'})

  return (
    <form onSubmit={handleSubmit((input) => { 
      updateUser({userId: currentUser?.id??'', input});
      reset(input, { keepDirty: false });
    })}>
      <div className='form-control mb-3'>
        <label className='label'>First Name</label>
        <label className='text-error'>{errors.firstName?.message}</label>
        <input
          {...register('firstName')}
          className='input input-bordered w-full'
          defaultValue={currentUser?.firstName}
        />
      </div>
      <div className='form-control mb-3'>
        <label className='label'>Last Name</label>
        <label className='text-error'>{errors.lastName?.message}</label>
        <input
          {...register('lastName')}
          className='input input-bordered w-full'
          defaultValue={currentUser?.lastName}
        />
      </div>
      <div className='form-control mb-3'>
        <label className='label'>Email</label>
        <input
          disabled={true}
          className='input input-bordered w-full'
          defaultValue={currentUser?.email}
        />
      </div>
      <div className='form-control'>
        <button className={`btn btn-success ${isPending ? 'animate-pulse' : ''}`} disabled={!isDirty || isPending}>Update</button>
      </div>
    </form>
  );
}

export default ProfileForm;