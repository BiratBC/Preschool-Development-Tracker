import React from 'react'
import MilestoneItem from './MilestoneItem'

const CategoryCard = ({name , icon, milestones}: {name : string, icon : any, milestones : any}) => {
  return (
    <>
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-2xl font-bold mb-4">
        {icon} {name}
      </h2>

      <div className="flex flex-col gap-3">
        {milestones?.map((m : any) => (
          <MilestoneItem key={m.milestoneId} milestone={m} />
        ))}
      </div>
    </div>
    
    </>
  )
}

export default CategoryCard
