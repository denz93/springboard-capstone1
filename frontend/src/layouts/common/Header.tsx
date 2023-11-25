
import { Link } from 'react-router-dom'
import { useAuth } from '../../features/auth/queries'

function Header() {
  const { currentUser, isAuthenticated, logout} = useAuth()

  const displayName = currentUser && currentUser.firstName && currentUser.lastName
    ? currentUser.firstName === "" || currentUser.lastName === ""
      ? 'User' 
      : (currentUser?.firstName??'')[0] + (currentUser?.lastName??'')[0]
    : 'User'
  const authenticatedMenuItems = isAuthenticated ? (
    <>
      <Link to={'/goals/create'} className='btn  btn-sm uppercase me-2'>+ New goal</Link>
      <div className="flex-none">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
            <div className="bg-neutral-focus text-neutral-content rounded-full w-12">
             <span>{displayName  }</span>
            </div>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-200 rounded-box w-52">
            <li className='justify-between'>
              <a href="">
                Hi <span className='font-bold'>{`${currentUser?.firstName} ${currentUser?.lastName}`}!</span>
              </a>
              </li>
            <li>
              <a className="justify-between" href='/goals'>
                My goals
              </a>
            </li>
            <li><a href='/profile'>Profile</a></li>
            <li><a onClick={() => logout()}>Logout</a></li>
          </ul>
        </div>
      </div>
    </>
  ) : (<></>)
  const unAuthenticatedMenuItems = isAuthenticated ? (<></>) : (
    <>
      <Link to={'/login'} className='btn btn-ghost btn-xs normal-case'>Login</Link>
    </>
  )
  return (
    <header className=''>
      <div className="navbar bg-base-100 gap-0">
        <div className="flex-1">
          <Link to={'/'}>
            <img className="w-24" src="/logo.png"/>
          </Link>
        </div>
        {authenticatedMenuItems}
        {unAuthenticatedMenuItems}
      </div>
    </header>
  );
}

export default Header;