import { ButtonHTMLAttributes, PropsWithoutRef, useCallback, useEffect, useId } from "react"
import { signInWithGoogle, useFirebaseState, useProviderRedirectParam } from "./auth-providers"
import {BsGoogle} from 'react-icons/bs'
import { useLoginMutation, useRegisterMutation } from "./queries"
export function LoginWithGoogleButton({className, ...props}: PropsWithoutRef<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const {isRedirected, isRedirecting, setProvider, provider, clearProvider} = useProviderRedirectParam()
  const {mutate: login, isPending: isLoginPending, error: loginError, isError: isLoginError, reset: resetLogin } = useLoginMutation()
  const {mutateAsync: register, isPending: isRegisterPending, reset: resetRegister} = useRegisterMutation()
  const {user, isLoading: isFirebaseLoading} = useFirebaseState()
  const modalId = useId()
  const showRegisterConfirmModal = useCallback(() => (document.getElementById(modalId) as HTMLDialogElement).showModal(), [modalId])

  useEffect(() => {
    (async () => {
      if (isRedirected && user && !isFirebaseLoading) {
        login(await user.getIdToken())
      }
      
    })()
  }, [isRedirected, login, user, isFirebaseLoading])

  useEffect(() => {
    if (!isLoginError) return 
    (async () => {
      const {error} = loginError.body as {error: {detail: unknown, message: string}}
      if (error && 'message' in error && error.message === 'User not registered') {
        showRegisterConfirmModal()
      }

    })()
  }, [loginError, showRegisterConfirmModal, isLoginError])

  return <>
    <button 
      {...props} 
      className={`btn btn-info ${className??''}`} 
      disabled={isRedirected || isRedirecting || isLoginPending || isRegisterPending}
      onClick={() => {
        setProvider('google')
        signInWithGoogle()
      }}
      >
        <BsGoogle/>
        Login with Google
    </button>
    <dialog id={modalId} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box text-center">
        <h3 className="font-bold text-lg mt-0 mb-4 text-center">Register new account ?</h3>
        <p className="italic">There is no account associated with <span className="font-bold">{user?.email}</span> via <span className="font-bold capitalize">{provider}</span></p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            {/* if there is a button in form, it will close the modal */}
            <button 
              className="btn btn-primary"
              onClick={async () => {
                register({
                  email: user?.email ?? '', 
                  firebaseIdToken: await user?.getIdToken()??'',
                  firstName: user?.displayName?.split(' ')[0] ?? '',
                  lastName: user?.displayName?.split(' ')[1] ?? '',
                })
              }}
            >Yes (Register)</button>
            <button 
              className="btn btn-neutral"
              onClick={() => {
                resetRegister()
                resetLogin()
                clearProvider()
              }}
              >No</button>
          </form>
        </div>
      </div>
    </dialog>
  </>
}