import { useState, useEffect, useRef } from 'react';
import { Trash2, X } from 'lucide-react'
import { Button } from './ui/button';
import DateWithTime from './ui/date-time';
import { Label } from './ui/label';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function EventCard({eventData, onUpdate, onDelete}) {
    const isUserEdit = useRef(false)

    const isAllDay = !eventData.startDateTime.includes('T');
    const [summary, setSummary] = useState(eventData.summary);
    const [desc, setDesc] = useState(eventData.description);
    const [loc, setLoc] = useState(eventData.location);
    const [startDate, setStartDate] = useState(() => new Date(eventData.startDateTime))
    const [startTime, setStartTime] = useState(() => {
        try {
            let time = eventData.startDateTime.split("T")[1].substring(0, 5);
        } catch (err) {
            console.log(err)
        }
        return eventData.startDateTime.split("T")[1].substring(0, 5);
    })
    const [endDate, setEndDate] = useState(() => new Date(eventData.endDateTime))
    const [endTime, setEndTime] = useState(() => {
        try {
            let time = eventData.endDateTime.split("T")[1].substring(0, 5);
        } catch (err) {
            console.log(err)
        }
        return eventData.endDateTime.split("T")[1].substring(0, 5);
    })

    const rebuildDateTime = (dateObj, timeStr) => {
        if (!dateObj) return ""

        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, "0")
        const day = String(dateObj.getDate()).padStart(2, "0")
        const time = timeStr || "00:00"
        console.log("Rebuilt: " + `${year}-${month}-${day}T${time}:00` )
        return `${year}-${month}-${day}T${time}:00`
    }

    const handleInputChange = (setter, value) => {
        isUserEdit.current = true
        setter(value)
    }

    useEffect(() => {
        isUserEdit.current = false

        setSummary(eventData.summary)
        setDesc(eventData.description)
        setLoc(eventData.location)
        setStartDate(new Date(eventData.startDateTime))
        setStartTime(eventData.startDateTime.split("T")[1].substring(0, 5))
        setEndDate(new Date(eventData.endDateTime))
        setEndTime(eventData.endDateTime.split("T")[1].substring(0, 5))
    }, [eventData])

    useEffect(() => {
        if (!isUserEdit.current) return

        const updatedData = {
            ...eventData,
            summary: summary,
            description: desc,
            location: loc,
            startDateTime: rebuildDateTime(startDate, startTime),
            endDateTime: rebuildDateTime(endDate, endTime),
        }
        onUpdate(updatedData)
    }, [summary, desc, loc, startDate, startTime, endDate, endTime])

    return (
        <Card className='w-full'>
            <CardHeader className="w-full flex items-start text-left">
                <CardTitle className='flex flex-col w-full items-start gap-2'>
                    <div className='flex w-full justify-between items-end'>
                        <Label htmlFor="eventTitle">Title:</Label>
                        <Button 
                            className="text-black hover:text-white bg-transparent border border-gray-200 hover:bg-red-500 hover:cursor-pointer" 
                            size="icon" 
                            onClick={onDelete}
                        >
                            <Trash2 size={16}/>
                        </Button>
                    </div>
                    <input 
                        className='w-full border-dashed border-2 rounded-sm p-1 pl-2'
                        id='eventTitle' 
                        type="text" 
                        value={`${summary}`}
                        placeholder="Title of Event Here!"
                        style={{ fontSize: 20 }}
                        onChange={(e) => handleInputChange(setSummary, e.target.value)}
                    />
                </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-evenly">
                <DateWithTime
                    dateTitle="Start Date"
                    timeTitle="Start Time"
                    date={startDate}
                    setDate={(d) => handleInputChange(setStartDate, d)}
                    time={startTime}
                    setTime={(t) => handleInputChange(setStartTime, t)}
                />
                <DateWithTime
                    dateTitle="End Date"
                    timeTitle="End Time"
                    date={endDate}
                    setDate={(d) => handleInputChange(setEndDate, d)}
                    time={endTime}
                    setTime={(t) => handleInputChange(setEndTime, t)}
                />
            </CardContent>
            <CardFooter className='flex flex-col items-start gap-2'>
                <div className='flex flex-col w-full items-start gap-1'>
                    <Label htmlFor="location">Location:</Label>
                    <input 
                        className='w-full border-dashed border-2 rounded-sm p-1 pl-2'
                        id='location' 
                        type="text" 
                        value={`${loc}`}
                        placeholder={`Write the location here!`} 
                        onChange={(e) => handleInputChange(setLoc, e.target.value)}
                    />
                </div>
                <div className='flex flex-col w-full items-start gap-1'>
                    <Label htmlFor="notes">Notes:</Label>
                    <textarea 
                        className='w-full h-20 border-dashed border-2 rounded-sm p-1 pl-2'
                        id='notes' 
                        value={`${desc}`}
                        placeholder={`Write some notes here!`}
                        onChange={(e) => handleInputChange(setDesc, e.target.value)}
                    />
                </div>
            </CardFooter>
        </Card>
    )
}