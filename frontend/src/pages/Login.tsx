import RanbowSpan from "../components/ui/ranbow-span";
import LoginWithEmailAndPasswordForm from "../features/auth/LoginWithEmailAndPasswordForm";
import { LoginWithGoogleButton } from "../features/auth/LoginWithGoogleButton";
import { useFirebaseState, useProviderRedirectParam } from "../features/auth/auth-providers";

function Login() {
  const {user} = useFirebaseState()
  const {isRedirected, isRedirecting, provider} = useProviderRedirectParam()
  return (
    <div>
      <h1 className="text-center mb-12">Login to <RanbowSpan>Master Planning</RanbowSpan></h1>
      <div className="flex flex-col items-center gap-4">
        { isRedirecting && 
          <p className="text-center text-sm opacity-60">
            Redirecting to <span className="capitalize font-bold">{provider}</span>
          </p>
        }
        { isRedirected &&
          <p className="text-center text-sm opacity-80 animate-pulse">
            Logging in as <span>{user?.displayName}</span> using <span className="capitalize font-bold">{provider}</span> account
          </p>
        }
        <div tabIndex={0} className="collapse collapse-arrow w-10/12 max-w-sm rounded-lg">
          <input type="checkbox" className="min-h-[2rem]" />
          <div className="collapse-title btn py-0 min-h-[2.2rem] pe-4">Login with email</div>
          <div className="collapse-content bg-base-200 -translate-y-1">

            <LoginWithEmailAndPasswordForm ></LoginWithEmailAndPasswordForm>
            <a className="btn btn-link" href="/register">Register?</a>
          </div>
        </div>
        <div className="w-10/12 max-w-sm">
          <LoginWithGoogleButton className="w-full "></LoginWithGoogleButton>
        </div>
      </div>
    </div>
  );
}

export default Login;