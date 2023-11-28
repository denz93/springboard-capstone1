import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../features/auth/queries';
import { useNavigate } from 'react-router-dom';
import {FaTasks} from 'react-icons/fa'
import {GiProgression} from 'react-icons/gi'
import {SiSmartthings} from 'react-icons/si'
function Home() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)
  const [currentSlide, setCurrentSlide] = useState('0')

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/goals')
    }
  })

  useEffect(() => {
    if (!ref.current) return 
    const ele = ref.current
    const options: IntersectionObserverInit = {
      root: ref.current,
      rootMargin: '0px',
      threshold: 0.2
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const idx = entry.target.getAttribute('slide-idx') as string 
        if (entry.intersectionRatio > 0.2) {
          
          setCurrentSlide(idx)
        }
      })
    }, options)
    for (const child of ele.children) {
      observer.observe(child)
    }
    return () => {
      for (const child of ele.children) {
        observer.unobserve(child)
      }
    }
  }, [])

  useEffect(() => {
    if (!ref.current) return

    const width = ref.current?.clientWidth??0
    const numOfSlides = ref.current?.children.length
    const intervalId = setInterval(() => {
      const currentSlide = Math.round((ref.current?.scrollLeft??0) / width)
      const isLastSlide = currentSlide === numOfSlides - 1
      if (isLastSlide) {
        ref.current?.scrollTo({left: 0})
      } else {
        ref.current?.scrollBy({left: width})
      }
    }, 5000)

    return () => clearInterval(intervalId)
  }, [ref])

  if (isAuthenticated) {
    
    return <></>
  }
  

  return (
    <div>
      {/** Hero section */}
      <section className='relative'>
        <div ref={ref} className='w-full carousel snap-always h-[calc(100svh-80px)]'>
          <div className="carousel-item w-full" slide-idx="0">
            <div className='card w-full bg-base-200 shadow-xl image-full items-center before:!absolute before:!inset-0 rounded-none before:!rounded-none'>
              <figure className='m-0 rounded-none h-full'>
                <img src="/hero1.jpg" className="w-full rounded-none" alt="Tailwind CSS Carousel component" />
              </figure>
              <div className='card-body text-center items-center'>
                <h2 className='mt-0'>Unlock Your Path to Success with <span className='bg-gradient-to-r from-cyan-500 via-green-500 to-blue-500 text-transparent bg-clip-text'>Master Planner</span>!</h2>
                <a className='btn w-32 no-underline' href="/login">Sign up now</a>
              </div>
            </div>
          </div>
          <div className="carousel-item w-full" slide-idx="1">
            <div className='card w-full bg-base-200 shadow-xl image-full items-center before:!absolute before:!inset-0 rounded-none before:!rounded-none'>
              <figure className='m-0 rounded-none h-full'>
                <img src="/hero2.jpg" className="w-full rounded-none" alt="Tailwind CSS Carousel component" />
              </figure>
              <div className='card-body text-center items-center'>
                <h2 className='mt-0'>Effortlessly <span className='bg-gradient-to-r from-cyan-500 via-green-500 to-blue-500 text-transparent bg-clip-text'>Manage</span> Your Plans.</h2>
                  <a className='btn w-32 no-underline' href="/login">Sign up now</a>
              </div>
            </div>
          </div> 
          <div className="carousel-item w-full" slide-idx="2">
            <div className='card w-full bg-base-200 shadow-xl image-full items-center before:!absolute before:!inset-0 rounded-none before:!rounded-none'>
              <figure className='m-0 rounded-none h-full'>
                <img src="/hero3.jpg" className="w-full rounded-none" alt="Tailwind CSS Carousel component" />
              </figure>
              <div className='card-body text-center items-center'>
                <h2 className='mt-0'><span className='bg-gradient-to-r from-cyan-500 via-green-500 to-blue-500 text-transparent bg-clip-text'>Achieve</span> Your Goals.</h2>
                  <a className='btn w-32 no-underline' href="/login">Sign up now</a>
              </div>
            </div>
          </div> 
          <div className="carousel-item w-full" slide-idx="3">
            <div className='card w-full bg-base-200 shadow-xl image-full items-center before:!absolute before:!inset-0 rounded-none before:!rounded-none'>
              <figure className='m-0 rounded-none h-full'>
                <img src="/hero4.jpg" className="w-full rounded-none" alt="Tailwind CSS Carousel component" />
              </figure>
              <div className='card-body text-center items-center'>
                <h2 className='mt-0'><span className='bg-gradient-to-r from-cyan-500 via-green-500 to-blue-500 text-transparent bg-clip-text'>Transform</span> Your Life.</h2>
                  <a className='btn w-32 no-underline' href="/login">Sign up now</a>
              </div>
            </div>
          </div> 
        </div>

        <div className="flex justify-center w-full py-2 gap-2 absolute bottom-1 z-20">
          <span className={`bg-base-200 w-2.5 h-2.5 btn-circle ${currentSlide === '0' ? 'opacity-100' : 'opacity-50'}`}></span> 
          <span className={`bg-base-200 w-2.5 h-2.5 btn-circle ${currentSlide === '1' ? 'opacity-100' : 'opacity-50'}`}></span> 
          <span className={`bg-base-200 w-2.5 h-2.5 btn-circle ${currentSlide === '2' ? 'opacity-100' : 'opacity-50'}`}></span> 
          <span className={`bg-base-200 w-2.5 h-2.5 btn-circle ${currentSlide === '3' ? 'opacity-100' : 'opacity-50'}`}></span> 

        </div>
      </section>
      
      <h1 className='divider mt-8 h-fit bg-gradient-to-r from-rose-500 via-slate-500 to-yellow-500 text-transparent bg-clip-text'>Popularity</h1>

      {/** Stat */}
      <section className='flex justify-center items-center'>
        <div className="stats stats-vertical shadow sm:stats-horizontal">
          
          <div className="stat">
            <div className="stat-title">Downloads</div>
            <div className="stat-value">31K</div>
            <div className="stat-desc">Jan 1st - Feb 1st</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">New Users</div>
            <div className="stat-value">4,200</div>
            <div className="stat-desc">↗︎ 400 (22%)</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">New Registers</div>
            <div className="stat-value">1,200</div>
            <div className="stat-desc">↘︎ 90 (14%)</div>
          </div>
          
        </div>
      </section>

      <h1 className='divider mt-8 h-fit bg-gradient-to-r from-rose-500 via-slate-500 to-yellow-500 text-transparent bg-clip-text'>Features</h1>
      <section className='px-4 flex flex-col items-center'>
        <div className="flex flex-col gap-4 items-center justify-center max-w-md">
          <div className='text-6xl m-0'>
            <FaTasks/>
          </div>
          <div className="">
            <h2 className="mt-0 text-center">Easy Planning</h2>
            <p className='text-justify'>Effortlessly create and manage your plans with our intuitive planning tools. Stay on top of your tasks without the hassle.</p>   
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center justify-center max-w-md">
          <div className='text-6xl m-0'>
            <GiProgression/>
          </div>
          <div className="">
            <h2 className="mt-0 text-center">Progress Tracking</h2>
            <p className='text-justify'>Monitor your progress in real-time. Celebrate victories, overcome challenges, and keep moving towards your objectives.</p>   
          </div>
        </div>

        <div className="flex flex-col gap-4 items-center justify-center max-w-md">
          <div className='text-6xl m-0'>
            <SiSmartthings/>
          </div>
          <div className="">
            <h2 className="mt-0 text-center">AI Power</h2>
            <p className='text-justify'>Leverage the power of artificial intelligence to track your goals and stay on top of your priorities.</p>   
          </div>
        </div>

      </section>
    </div>
  );
}

export default Home;