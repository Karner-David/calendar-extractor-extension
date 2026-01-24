import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export default function NativeDatePicker({
    dateTitle, 
    timeTitle, 
    date, 
    setDate, 
    time, 
    setTime
}) {
    const dateValue = date && !isNaN(date) ? date.toLocaleDateString('en-CA') : "";

  return (
    <FieldGroup className="max-w-xs flex-row gap-2">
      <Field className="w-40 g-1">
        <FieldLabel> {dateTitle} </FieldLabel>
        <Input 
          type="date" 
          className="w-32 justify-start text-left font-normal"
          value={dateValue}
          onChange={(e) => setDate(e.target.valueAsDate)}
        />
      </Field>
      
      <Field className="w-32">
        <FieldLabel> {timeTitle} </FieldLabel>
        <Input 
          type="time" 
          defaultValue="10:30" 
          value={time || ""}
          onChange={(e) => setTime(e.target.value)}
        />
      </Field>
    </FieldGroup>
  )
}