import React from 'react'
import { getStatusIcon, getStatusLabel, getStatusColor } from '@/lib/utils';

const CategoryCard = ({name , icon, milestones, onStatusChange}: {name : string, icon : any, milestones : any, onStatusChange: any}) => {

  return (
    <>
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {name}
      </h2>
      <div className="space-y-3">
        {milestones.map((milestone : any, index : any) => (
          <div
            key={index}
            onClick={() => onStatusChange(milestone.milestoneId)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(
              milestone.status
            )}`}
          >
            <div className="flex justify-between items-start gap-3">
              <p className="text-sm font-medium flex-1">
                {milestone?.title}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold whitespace-nowrap">
                  {getStatusLabel(milestone.status)}
                </span>
                {getStatusIcon(milestone.status) && (
                  <span
                    className={
                      milestone.status === "mastered"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {getStatusIcon(milestone.status)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    </>
  )
}

export default CategoryCard
