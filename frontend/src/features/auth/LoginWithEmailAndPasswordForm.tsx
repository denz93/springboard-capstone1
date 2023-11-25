import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {z} from 'zod'
import { FirebaseError, useFirebaseState } from './auth-providers';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation } from './queries';

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(32, 'Password must be at most 32 characters long'),
})
function LoginWithEmailAndPasswordForm() {
  const {register, handleSubmit, formState: {errors}, getValues} = useForm<z.infer<typeof LoginInputSchema>>({
    resolver: zodResolver(LoginInputSchema)
  }) 
  const navigate = useNavigate()
  const {signInWithEmailAndPassword, isLoading, getSignInMethodsForEmail } = useFirebaseState()
  const {mutate: login, isPending: isLoginPending} = useLoginMutation()

  const [error, setError] = useState<JSX.Element|null>(null)
  const errorModalRef = useRef<HTMLDialogElement>(null)
  const registerModalRef = useRef<HTMLDialogElement>(null)

  const redirectToRegister = useCallback(() => {
    navigate(`/register?email=${encodeURIComponent(getValues('email'))}`)
  }, [getValues, navigate])

  const showRedirectModal = useCallback(() => {
    registerModalRef.current?.showModal()
  }, [registerModalRef])

  const clearError = useCallback(() => {
    setError(null)
    errorModalRef.current?.close()
  }, [])

  useEffect(() => {
    if (!error) return 
    errorModalRef.current?.showModal()
  }, [error])

  return (
    <>
      <form onSubmit={handleSubmit(
        async (data) => {
          try {
            const credential = await signInWithEmailAndPassword(data.email, data.password)
            login(await credential.user.getIdToken())
          } catch (e) {
            if (!(e instanceof FirebaseError)) {
              console.error(e)
              return
            }
            if (e.code === 'auth/invalid-login-credentials') {
              const provider = (await getSignInMethodsForEmail(data.email)).provider
              if (provider === null) {
                showRedirectModal()
              } else if (provider.toLowerCase() === 'password') {
                setError(<span>
                  Invalid email or password
                </span>)
              
              } else {
                setError(<span>
                  You have used the email <span  className='font-bold'>{data.email}</span> with <span className='font-bold uppercase'>{provider}</span> already
                </span>)
              }
            }
          }
        })
        }>
        <div className='form-control w-full mb-2'>
          <label className='label'>Email</label>
          <label className='text-error label pt-0'>{errors.email?.message}</label>
          <input
            {...register('email')}
            className='input input-bordered w-full'
            placeholder='Enter your email'
            autoComplete='email'
          />
        </div>
        <div className='form-control w-full mb-2'>
          <label className='label'>Password</label>
          <label className='text-error label pt-0'>{errors.password?.message}</label>
          <input
            {...register('password')}
            className='input input-bordered w-full'
            placeholder='Enter your password'
            type='password'
            autoComplete='current-password'
          />
        </div>
        <div className='form-control w-full mt-4'>
          <button className='btn btn-neutral' disabled={isLoading || isLoginPending}>Login</button>
        </div>
      </form>

      <dialog ref={errorModalRef} className="modal modal-top sm:modal-middle" onClose={() => clearError()}>
        <div className="modal-box text-center">
          <h3 className="font-bold text-lg">Login failed</h3>
          <p className="py-4" >{error}</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog ref={registerModalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box text-center">
          <h3 className="font-bold text-lg">Account not registered!</h3>
          <p className="py-4">You have to register an account first.</p>
          <div className="modal-action">
            <form method="dialog" className=' flex gap-2'>
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-primary" onClick={() => redirectToRegister()}>Register</button>
              <button className="btn">Close</button>

            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}

export default LoginWithEmailAndPasswordForm;