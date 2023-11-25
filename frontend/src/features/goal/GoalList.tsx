import GoalListItem from './GoalListItem';
import { useGoals } from './queries';
import { useQueryClient } from '@tanstack/react-query'
import React from 'react'

function GoalList() {
  const queryClient = useQueryClient()
  const { data, isLoading } = useGoals()
  console.log({data})
  if (isLoading) return <ul className='grid list-none grid-rows-[auto] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-0 justify-center'><li className='italic text-center md:col-span-2 lg:col-span-3'>Loading goals</li></ul>
  if (!data) return <ul className='grid list-none grid-rows-[auto] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-0 justify-center'><li className='italic text-center md:col-span-2 lg:col-span-3'>No goals</li></ul>
  const { pages } = data
  const isEmptyGoal = pages.length === 0 || !pages[0] || pages[0].goals?.length === 0
  return (
    <ul className='grid list-none grid-rows-[auto] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-0'>
      {isEmptyGoal && <li className='italic text-center md:col-span-2 lg:col-span-3'>No goals</li>}

      {!isEmptyGoal && pages.map((page, _index) => <React.Fragment key={_index}>
        {page.goals?.map(goal => {
          queryClient.setQueryData(['goals', goal.id], goal)
          return <li className='' key={goal.id}><GoalListItem goal={goal} /></li>
        })}
      </React.Fragment>)}
    </ul>
  );
}

export default GoalList;