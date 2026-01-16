import * as React from "react"
import { 
    ChevronDownIcon, 
    ChevronLeftIcon, 
    ChevronRightIcon 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function DateWithTime({ dateTitle, timeTitle, date, setDate, time, setTime }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex gap-2">
      <div className="flex flex-col">
        <Label htmlFor="date-picker" className="px-1">
          {dateTitle}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className="w-32 justify-between font-normal"
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => {
                setDate(d)
                setOpen(false)
              }}
              className="rounded-md border"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-2 sm:space-x-2 sm:space-y-0",
                table: "w-full border-collapse",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-1",
                cell: "h-7 w-7 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100"
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex flex-col">
        <Label htmlFor="time-picker" className="px-1">
          {timeTitle}
        </Label>
        <Input
          type="time"
          id="time-picker"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="bg-background"
        />
      </div>
    </div>
  )
}