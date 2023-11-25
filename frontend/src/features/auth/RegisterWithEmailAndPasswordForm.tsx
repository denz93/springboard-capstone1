import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {z} from 'zod'
import { FirebaseError, UserCredential, useFirebaseState } from './auth-providers'
import { useSearchParams } from 'react-router-dom'
import { useRegisterMutation } from './queries'

const RegisterUserInput = z.object({
  email: z.string().email(),
  password: z.string().max(32, 'Password must be at most 32 characters long').min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().max(32, 'Password must be at most 32 characters long').min(8, 'Password must be at least 8 characters long'),
}).superRefine(({password, confirmPassword}, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    })
  }
})

export function RegisterWithEmailAndPasswordForm() {
  const [params] = useSearchParams()
  const {register, handleSubmit, formState: {errors}} = useForm<z.infer<typeof RegisterUserInput>>({
    resolver: zodResolver(RegisterUserInput),
    values: {email: params.get('email')??'', password: '', confirmPassword: ''}
  })
  const {registerUserWithEmailAndPassword, isLoading, signInWithEmailAndPassword} = useFirebaseState()
  const {mutate: registerUser, isPending: isRegistering} = useRegisterMutation()


  return <form onSubmit={handleSubmit(async (data) => {
    let credential: UserCredential | null = null
    try {
      credential = await registerUserWithEmailAndPassword(data.email, data.password)
    } catch (e) {
      if (!(e instanceof FirebaseError)) {
        return
      }
      if (e.code === 'auth/email-already-in-use') {
        credential = await signInWithEmailAndPassword(data.email, data.password)
      }
    }
    if (!credential) return
    const {user} = credential
    registerUser({email: user.email as string, firstName: '', lastName: '', firebaseIdToken: await user.getIdToken()})
  })}>
    <div className='form-control mb-2' >
      <label htmlFor='email' className='label'>Email</label>
      <label className='text-error label py-1'>{errors.email?.message}</label>
      <input type='email' {...register('email')} placeholder='Enter your email' className='input input-bordered'/>
    </div>
    <div className='form-control mb-2'>
      <label htmlFor='password' className='label'>Password</label>
      <label className='text-error label py-1'>{errors.password?.message}</label>
      <input type='password' {...register('password')} placeholder='Enter your password' className='input input-bordered'/>
    </div>
    <div className='form-control mb-2'>
      <label htmlFor='confirmPassword' className='label'>Confirm password</label>
      <label className='text-error label py-1'>{errors.confirmPassword?.message}</label>
      <input type='password' {...register('confirmPassword')} placeholder='Enter your confirm password' className='input input-bordered'/>
    </div>
    <div className='form-control mt-8'>
      <button className='btn' disabled={isLoading || isRegistering}>Register</button>
    </div>
  </form>
}