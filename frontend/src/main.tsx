import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import PageLayout from './layouts/PageLayout.tsx'
import Home from './pages/Home.tsx'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Goal from './pages/Goal.tsx'
import CreateGoal from './pages/CreateGoal.tsx'
import { AlertProvider } from './features/alert/provider.tsx'
import Profile from './pages/Profile.tsx'
import LoginHandler from './pages/LoginHandler.tsx'
import MyGoal from './pages/MyGoal.tsx'


const route = createBrowserRouter([
  {
    path: '/',
    element: <PageLayout mainElement={<Home/>}/>,
    
  },
  {
    path: '/register',
    element: <PageLayout mainElement={<Register/>}/>,
  },
  {
    path: '/login',
    element: <PageLayout mainElement={<Login/>}/>,
  },
  {
    path: '/goals/:id',
    element: <PageLayout mainElement={<Goal/>}/>,
  },
  {
    path: '/goals/create',
    element: <PageLayout mainElement={<CreateGoal/>}/>,
  },
  {
    path: '/profile',
    element: <PageLayout mainElement={<Profile/>} />
  },

  {
    path: '/__/auth/handler',
    element: <PageLayout mainElement={<LoginHandler/>}/>,
  },

  {
    path: '/goals',
    element: <PageLayout mainElement={<MyGoal/>}/>,
  }

])

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20000
    }
  }
})
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <RouterProvider router={route} />
        <ReactQueryDevtools initialIsOpen={false}/>
      </AlertProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
