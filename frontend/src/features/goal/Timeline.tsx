import { useEffect, useState } from 'react';
import dayjs from 'dayjs'
import RelativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'

dayjs.extend(RelativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale(window.navigator.language)

type TimelineProps = {
  startDate?: Date,
  endDate?: Date
}

const datetimeFormater = Intl.DateTimeFormat(window.navigator.language)

const InProgressTimeLine = ({startDate, endDate}: Required<TimelineProps>) => {
  const today = new Date()
  const isTodayCloserStartDate = (today.getTime() - startDate.getTime()) < (endDate.getTime() - today.getTime())
  const leftWidth = isTodayCloserStartDate ? 'w-[calc(50%-2rem)] md:w-[calc(50%-4rem)]' : 'w-[calc(50%+2rem)] md:w-[calc(50%+4rem)]'
  const translateOffPos = isTodayCloserStartDate ? '-translate-x-[2rem] md:-translate-x-[4rem]' : 'translate-x-[2rem] md:translate-x-[4rem]'
  const elapsedTime = dayjs(today).to(endDate)
  return (
    <div className='w-full h-fit flex flex-col items-center p-4 relative text-[12px] text-center md:text-sm'>
        <div className={`w-min flex flex-col gap-1 items-center ${translateOffPos}`}>
          <div className='text-gray-400 text-center'><span className='animate-pulse uppercase'>Today</span> {datetimeFormater.format()}</div>
          <div className='w-3 h-3 rounded-full bg-violet-500 animate-pulse'></div>
          <div className='h-5 w-[1px] border-l-[1px] border-violet-500 border-dashed shadow-slate-100 shadow-sm'></div>
        </div>

        <div className='w-[60%] h-[1px] border-t-[1px] border-gray-500 border-dashed relative'>
          <div className={`absolute top-[-1px] ${leftWidth} h-[2px] bg-slate-500`}></div>
        </div>

        <div className='flex w-[60%] justify-between'>

          <div className='translate-x-[-50%] w-min flex flex-col gap-1 items-center'>
            <div className='h-5 w-[1px] border-l-[1px] border-gray-500 border-dashed'></div>
            <div className='w-3 h-3 rounded-full bg-gray-500'></div>
            <div className='text-gray-500 uppercase'>Start {dayjs(startDate).format('L')}</div>
          </div>
          <div className='translate-x-[50%] w-min flex flex-col gap-1 items-center '>
            <div className='absolute -top-5 text-gray-400 w-max'>{elapsedTime}</div>
            <div className='h-5 w-[1px] border-l-[1px] border-gray-500 border-dashed'></div>
            <div className='w-3 h-3 rounded-full bg-gray-500'></div>
            <div className='text-gray-500  uppercase text-center'>End {dayjs(endDate).format('L')}</div>
          </div>
        </div>
      </div>
  );
}

const PrestartTimeLine = ({startDate, endDate, today}: TimelineProps & {today: Date}) => {
  if (!startDate || !endDate || startDate > endDate) {
    return <div>Invalid date</div>
  }
  const diffInMinutes = dayjs(startDate).diff(today, 'minute')
  const diffInSeconds = dayjs(startDate).diff(today, 'second')
  const elapsedTime = dayjs(today).to(startDate)
  const eslapedInMinutes = `in ${Math.floor(diffInSeconds/60)}:${`${diffInSeconds%60}`.padStart(2, '0')} minutes`
  const showElapsedTime = diffInMinutes <= 60 ? eslapedInMinutes : elapsedTime

  return (
    <div className='w-full h-fit flex flex-col items-center p-4 relative text-[12px] text-center md:text-sm'>
        
        <div className=' text-gray-400 w-max'>Start {showElapsedTime}</div>

        <div className='w-[60%] h-[1px] border-t-[1px] border-gray-500 border-dashed relative'>
        </div>

        <div className='flex w-[60%] justify-between'>

          <div className='translate-x-[-50%] w-min flex flex-col gap-1 items-center'>
            <div className='h-5 w-[1px] border-l-[1px] border-gray-500 border-dashed'></div>
            <div className='w-3 h-3 rounded-full bg-violet-500 animate-pulse'></div>
            <div className='text-gray-400 uppercase'><span className='animate-pulse'>Today</span> {dayjs(today).format('L')}</div>
          </div>
          <div className='translate-x-[50%] w-min flex flex-col gap-1 items-center '>
            <div className='h-5 w-[1px] border-l-[1px] border-gray-500 border-dashed'></div>
            <div className='w-3 h-3 rounded-full bg-gray-500'></div>
            <div className='text-gray-500  uppercase text-center'>Start {dayjs(startDate).format('L')}</div>
          </div>
        </div>
      </div>
  ); 
}

const PostStartTimeLine = ({endDate, today}: TimelineProps & {today: Date}) => {
 
  const elapsedTime = dayjs(endDate).from(today)
  return (
    <div className='w-full h-fit flex flex-col items-center p-4 relative text-[12px] text-center md:text-sm'>
        
        <div className=' text-gray-400 w-max'>{elapsedTime}</div>

        <div className='w-[60%] h-[1px] border-t-[1px] border-gray-500 border-dashed relative'>
        </div>

        <div className='flex w-[60%] justify-between'>

          <div className='translate-x-[-50%] w-min flex flex-col gap-1 items-center'>
            <div className='h-5 w-[1px] border-l-[1px] border-gray-500 border-dashed'></div>
            <div className='w-3 h-3 rounded-full  bg-gray-500 '></div>
            <div className='text-gray-400 uppercase'>End {dayjs(endDate).format('L')}</div>
          </div>
          <div className='translate-x-[50%] w-min flex flex-col gap-1 items-center '>
            <div className='h-5 w-[1px] border-l-[1px] border-gray-500 border-dashed'></div>
            <div className='w-3 h-3 rounded-full  bg-violet-500 animate-pulse'></div>
            <div className='text-gray-500  uppercase text-center'><span className='animate-pulse'>Today</span> {dayjs(today).format('L')}</div>
          </div>
        </div>
      </div>
  ); 
}
function Timeline({startDate, endDate}: TimelineProps) {
  
  const [today, setToday] = useState(new Date())
  useEffect(() => {
    const interval = setInterval(() => {
      setToday(new Date())
    }, 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!startDate || !endDate || startDate > endDate) {
    return <div>Invalid date</div>
  }

  if (today < startDate) {
    return <PrestartTimeLine today={today} startDate={startDate} endDate={endDate}></PrestartTimeLine>
  }

  if (today >= endDate) {
    return <PostStartTimeLine today={today} startDate={startDate} endDate={endDate}></PostStartTimeLine>
  }

  return <InProgressTimeLine startDate={startDate} endDate={endDate}  ></InProgressTimeLine>
}

export default Timeline;