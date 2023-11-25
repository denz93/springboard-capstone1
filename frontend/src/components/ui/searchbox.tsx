import React, { HTMLAttributes } from 'react';
import Highlight from './highlight';
import {useClickAway} from '@uidotdev/usehooks'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore: TS2430
interface GroupContent<TContent extends object> extends TContent {
  children: TContent[],
}

function SearchBox<TContent extends object, TReturnValue>({
  groups, 
  getDisplayValue, 
  getValue, 
  dropdownClassName, 
  onSelected,
  selected,
  ...props }: HTMLAttributes<HTMLInputElement> & {
  groups: GroupContent<TContent>[],
  getDisplayValue: (content: TContent) => string,
  getValue: (content: TContent) => TReturnValue,
  dropdownClassName?: string,
  onSelected?: (value: TReturnValue) => void
  selected?: TReturnValue
}) {
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  const [filterValue, setFilterValue] = React.useState<string>(String(props.defaultValue??'')??'')
  const [selection, setSelection] = React.useState<TContent|null>(
    selected ? groups.flatMap(g => g.children).find(c => getValue(c) === selected)??null : null
  )
  const filterGroups = groups.filter((group) => {
    return getDisplayValue(group as TContent).toLowerCase().includes(filterValue.toLowerCase()) || group.children.some((content) => {
      return getDisplayValue(content).toLowerCase().includes(filterValue.toLowerCase())
    })
  })
  const ref = useClickAway<HTMLDivElement>(() => {
    setFilterValue(selection ? getDisplayValue(selection) : '')
  })
  
  return (
    <div ref={ref} className={`dropdown dropdown-top relative ${props.className??''}`}>
      <input
        {...props}
        ref={inputRef}
        className={`input input-bordered z-1 w-full`}
        value={filterValue}
        onChange={(e) => {
          setFilterValue(e.target.value)
        }}
      />
      <div 
        ref={dropdownRef} 
        tabIndex={0} 
        className={`dropdown-content shadow-xl bg-base-200 overflow-hidden  w-full ${dropdownClassName??''}`}
        
        >
        <div className='h-56 max-h-56 overflow-x-hidden overflow-y-scroll w-full'>
          <table className='table table-pin-rows table-zebra w-full table-fixed m-0'>
            {filterGroups.length === 0 && <tbody><tr><td className='px-2 py-4 italic text-center'>No results matching</td></tr></tbody>}
            {filterGroups.map((group, groupIndex) => (
              <React.Fragment key={groupIndex}>
                <thead className='border-none'>
                  <tr className='bg-neutral-900 border-none -top-[1px]'>
                    <th className='px-4 py-4 border-none'>{getDisplayValue(group as TContent)}</th>
                  </tr>
                </thead>
                <tbody>
                  {group.children.filter((content) => getDisplayValue(content).toLowerCase().includes(filterValue.toLowerCase())).map((content, contentIndex) => (
                    <tr 
                      className='border-gray-800' 
                      key={contentIndex} 
                      onClick={() => {
                        setSelection(content)
                        setFilterValue(getDisplayValue(content))
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        onSelected?.(getValue(content))
                      }}>
                      <td className='px-4 py-4 whitespace-nowrap text-ellipsis overflow-hidden'>
                        <Highlight highlight={filterValue}>{getDisplayValue(content)}</Highlight>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </React.Fragment>
            ))}
          </table>
        </div>
        <div className='flex justify-center bg-neutral-900'>
          <div className='btn btn-ghost btn-neutral  btn-sm' onClick={() => {
            setFilterValue('')
            inputRef.current?.focus()
          }}>Clear</div>
        </div>
      </div>
    </div>
  );
}
export default SearchBox;
