import { useState, useEffect, useRef } from 'react';
import { Trash2, X } from 'lucide-react'
import { Button } from './ui/button';
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
import NativeDatePicker from './DatePicker';
import { GOOGLE_COLORS } from './colors';

const safeGetTime = (dateTimeStr) => {
    if (!dateTimeStr || !dateTimeStr.includes('T')) return "00:00";
    return dateTimeStr.split("T")[1].substring(0, 5);
};

export default function EventCard({eventData, onUpdate, onDelete}) {
    const isUserEdit = useRef(false)
    const [summary, setSummary] = useState(eventData.summary);
    const [desc, setDesc] = useState(eventData.description);
    const [loc, setLoc] = useState(eventData.location);
    const [startDate, setStartDate] = useState(() => new Date(eventData.startDateTime))
    const [startTime, setStartTime] = useState(() => safeGetTime(eventData.startDateTime))
    const [endDate, setEndDate] = useState(() => new Date(eventData.endDateTime))
    const [endTime, setEndTime] = useState(() => safeGetTime(eventData.endDateTime))
    const [colorId, setColorId] = useState(eventData.colorId || '1')

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

    const handleColorChange = (newId) => {
        setColorId(newId)
        onUpdate({ ...eventData, colorId: newId})
    }

    useEffect(() => {
        isUserEdit.current = false

        setSummary(eventData.summary)
        setDesc(eventData.description)
        setLoc(eventData.location)
        setStartDate(new Date(eventData.startDateTime))
        setStartTime(safeGetTime(eventData.startDateTime))
        setEndDate(new Date(eventData.endDateTime))
        setEndTime(safeGetTime(eventData.endDateTime))
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
            <CardContent className="grid grid-cols-2 gap-10">
                <div className='flex flex-col gap-5 justify-evenly' >
                    <NativeDatePicker
                        dateTitle="Start Date"
                        timeTitle="Start Time"
                        date={startDate}
                        setDate={(d) => handleInputChange(setStartDate, d)}
                        time={startTime}
                        setTime={(t) => handleInputChange(setStartTime, t)}
                    />
                    <NativeDatePicker
                        dateTitle="End Date"
                        timeTitle="End Time"
                        date={endDate}
                        setDate={(d) => handleInputChange(setEndDate, d)}
                        time={endTime}
                        setTime={(t) => handleInputChange(setEndTime, t)}
                    />
                    <div className="flex gap-2 mt-3 flex-wrap justify-center">
                    {GOOGLE_COLORS.map((c) => (
                        <div
                        key={c.id}
                        onClick={() => handleColorChange(c.id)}
                        className={`w-4.25 h-4.25 rounded-full cursor-pointer transition-all ${
                            colorId === c.id ? "ring-2 ring-offset-2 ring-black scale-110" : ""
                        }`}
                        style={{ backgroundColor: c.bg }}
                        title={c.name}
                        />
                    ))}
                    </div>
                </div>
                <div className='flex flex-col justify-between gap-2'>
                    <div className='flex flex-col items-start gap-1'>
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
                </div>
            </CardContent>
            <CardFooter className='flex flex-col items-start gap-2'>
                
            </CardFooter>
        </Card>
    )
}