import React from 'react'

const MilestoneItem = ({milestone} : {milestone : any}) => {
    const statusColor : any = {
    "mastered": "bg-green-200",
    "not-started": "bg-red-200",
    "in-progress": "bg-yellow-200"
  };

  return (
<>
 <div className={`flex justify-between items-center p-3 rounded-lg ${statusColor[milestone?.status]}`}>
      <span>{milestone.title}</span>

      <label className="flex items-center gap-2">
        <span className="text-sm">
          {milestone.status === "mastered" ? "Mastered" :
           milestone.status === "in-progress" ? "In Progress" :
           "Not Started"}
        </span>

        <input 
          type="checkbox"
          checked={milestone.status === "mastered"}
          onChange={() => console.log("Update milestone status")}
        />
      </label>
    </div>
</>
  )
}

export default MilestoneItem
