import { useEffect, useState } from 'react'
import ProcessingSpinner from './components/LoadingWave';
import EventCard from './components/EventCard';
import { Button } from './components/ui/button';
import { Spinner } from './components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { ButtonGroup } from './components/ui/button-group';
import { ArrowLeft, ArrowRight} from 'lucide-react'
import './App.css'

const MOCK_DATA = {
  events: [
    {
      description: "First day of classes",
      endDateTime: "2026-01-12T23:59:59",
      location: "Not Specified",
      startDateTime: "2026-01-12T00:00:00",
      summary: "First day of classes"
    },
    {
      description: "Martin Luther King, Jr. Day",
      endDateTime: "2026-01-19T23:59:59",
      location: "Not Specified",
      startDateTime: "2026-01-19T00:00:00",
      summary: "Martin Luther King, Jr. Day"
    },
    {
      description: "Last day to drop a class",
      endDateTime: "2026-01-28T23:59:59",
      location: "Not Specified",
      startDateTime: "2026-01-28T00:00:00",
      summary: "Last day to drop a class"
    },
    {
      description: "Spring Break",
      endDateTime: "2026-03-21T23:59:59",
      location: "Not Specified",
      startDateTime: "2026-03-16T00:00:00",
      summary: "Spring Break"
    }
  ]
};

const API_URL = "https://calendar-extractor-extension.onrender.com/extract"

function App() {
  const [status, setStatus] = useState('done');
  const [logs, setLogs] = useState([])
  const [data, setData] = useState(MOCK_DATA)
  const [isFile, setIsFile] = useState(false)
  const [textAreaValue, setTextAreaValue] = useState('')
  const [eventIndex, setEventIndex] = useState(1);
  const [isDisabledLeft, setIsDisabledLeft] = useState(true);
  const [isDisabledRight, setIsDisabledRight] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProcess = async (file) => {
    setStatus("processing")

    // authenticate user
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        setLogs(prev => [...prev, `Error: ${errorMsg}`]);
        console.error("Auth Error:", errorMsg); 
        return;
      }
      
      if (!token) {
        setLogs(prev => [...prev, "Login failed: No token received."]);
        return;
      }

      // send token to backend
      const formData = new FormData()
      formData.append('file', file)
      setLogs(prev => [...prev, "Analyzing pdf with Gemini"])

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        })

        const data = await response.json()

        const validEvents = data.events.filter(event => {
          const hasSummary = event.summary;

          const hasStartTime = event.startDateTime;

          return hasSummary && hasStartTime;
        })

        setData({ ... data, events: validEvents })
        setEventIndex(1)

        setStatus("done")
      } catch (err) {
        console.error(err)
        setStatus('error')
      }
    })
    
  }

  const handleEventChange = (newEventData) => {
    setData(prevData => {
      
      const copyEvents = [...prevData.events];
      copyEvents[eventIndex - 1] = newEventData;
      return { ...prevData, events: copyEvents}
    })
  }

  const submitEvents = async () => {
    if (!data.events || data.events.length === 0) {
      return;
    }

    setIsSubmitting(true)

    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        console.error("Auth Error:", chrome.runtime.lastError?.message)
        setIsSubmitting(false)
        return;
      }

      let success = 0
      let fail = 0
      for (const event of data.events) {
        try {
          const startDate = new Date(event.startDateTime);
          const endDate = new Date(event.endDateTime);

          // If end is before start, make end to be start + 1 hour
          if (endDate <= startDate) {
              console.warn(`Fixing invalid time for ${event.summary}`);
              const fixedEnd = new Date(startDate.getTime() + 60 * 60 * 1000); 
              event.endDateTime = fixedEnd.toISOString().split('.')[0]; 
          }
          await createCalendarEvent(event, token);
          success++
        } catch (err) {
          console.error("Failed to upload event: ", event, err)
          fail++;
        }
      }
      setIsSubmitting(false)
      if (fail === 0) {
          alert("All events uploaded successfully!");
      }
    })
  }

  const createCalendarEvent = async (eventData, token) => {
    const isAllDay = !eventData.startDateTime.includes('T');

    const event = {
      summary: eventData.summary,
      location: eventData.location || "",
      start: {},
      end: {}
    };

    if (isAllDay) {
      event.start.date = eventData.startDateTime; 
      event.end.date = eventData.endDateTime;     
    } else {
      event.start.dateTime = eventData.startDateTime;
      event.end.dateTime = eventData.endDateTime;

      event.start.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      event.end.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    console.log("Uploading Event:", JSON.stringify(event)); 

    // change long thing to primary later maybe
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
        const err = await response.json();
        console.error("Google Calendar API Error:", err);
        throw new Error(err.error.message);
    }
  }

  const increaseIndex = () => {
    if (eventIndex < data.events.length) {
      setEventIndex(prev => prev + 1)
    }
  }

  const decreaseIndex = () => {
    if (eventIndex - 1 > 0) {
      setEventIndex(prev => prev - 1)
    }
  }

  const updateDisabledArrows = () => {
    if (data && data.events.length > 0) {
      if (data.events.length === eventIndex) {
        setIsDisabledRight(true)
      }
      if (eventIndex < data.events.length) {
        setIsDisabledRight(false)
      }
      if (1 === eventIndex) {
        setIsDisabledLeft(true)
      }
      if (eventIndex > 1) {
        setIsDisabledLeft(false)
      }
    }
  }

  const handleDelete = () => {
    setData(prevData => {
      const copyEvents = [...prevData.events]
      console.log(eventIndex)
      copyEvents.splice(eventIndex-1, 1)
      return { ...prevData, events: copyEvents}
    })

    if (eventIndex === data.events.length) {
      setEventIndex(prev => prev - 1)
    }
  }

  useEffect(() => {
    updateDisabledArrows();

  }, [data, eventIndex])

  return (
      <div className="flex flex-col text-center gap-3" style={{width: 650, padding: 10}}>
        <h2 className='text-5xl mt-3 font-sans font-bold' style={{ color: "#BF5700"}}>Event Extractor</h2>
        <div className='w-full grid grid-cols-2 px-3 gap-2'>
          <div 
            className={`${isFile ? "border-b-2 border-[#BF5700] text-[#BF5700]" : "border-b-2 border-transparent"} font-sans font-medium cursor-pointer hover:text-[#BF5700] hover:border-[#BF5700] hover:border-b-2 transition-all duration-200`}
            onClick={() => setIsFile(true)}
          >
            <h2 className='text-xl'>Upload File</h2>
          </div>
          <div
            className={`${!isFile ? "border-b-2 border-[#BF5700] text-[#BF5700]" : "border-b-2 border-transparent"} font-sans font-medium cursor-pointer hover:text-[#BF5700] hover:border-[#BF5700] hover:border-b-2 transition-all duration-200`}
            onClick={() => setIsFile(false)}
          >
            <h2 className='text-xl'>Upload Text</h2>
          </div>
        </div>
        {status !== "processing" && (
          <>
            {isFile ? (
              <input 
                className="input_file rounded-2xl border-gray-200 border"
                type="file" 
                style={{ margin: 0 }}
                onChange={(e) => handleProcess(e.target.files[0])}
              />
            ) : (
              <textarea 
                className="p-3.5 rounded-2xl border-dashed border-2 border-gray-300 hover:border-gray-400 bg-white focus-visible:border-gray-400 focus-visible:border-solid"
                placeholder={`Place your text here!`}
                style={{ margin: 0 }}
                value={textAreaValue}
                onChange={(e) => setTextAreaValue(e.target.value)}
              />
            )}
            <Button
              className="h-11 text-#080808 hover:bg-green-500 hover:cursor-pointer" 
              variant="outline"
              // onClick={submitInfo}
              disabled={isSubmitting}
              >
                {isSubmitting ? "Uploading..." : `Submit ${isFile ? "File" : "Text"}!`}
            </Button>
          </>
        )}

        {status === "processing" && (
          <div className='flex justify-center p-2 pt-3 pb-1 bg-white rounded-2xl border-gray-200 border'>
            <ProcessingSpinner text='currently processing!'/>
          </div>
        )}

        <div className="events-list flex flex-col">
          {data && data.events.length >= 1 && (
            <>
              <div className='flex flex-row text-center items-center'>
                <ArrowLeft 
                  className={`arrow transition-colors duration-200 ${
                    isDisabledLeft 
                      ? "text-[#d4d2d2] cursor-not-allowed"       
                      : "text-black hover:text-[#BF5700] cursor-pointer" 
                  }`}
                  size={24} 
                  onClick={() => decreaseIndex()} disabled={isDisabledLeft}/>
                <h3>{eventIndex} of {data.events.length}</h3>
                <ArrowRight 
                  className={`arrow transition-colors duration-200 ${
                    isDisabledRight
                      ? "text-[#d4d2d2] cursor-not-allowed"       
                      : "text-black hover:text-[#BF5700] cursor-pointer" 
                  }`}
                  size={24} 
                  onClick={() => increaseIndex()} disabled={isDisabledRight}/>
              </div>
              <EventCard 
                key={eventIndex} 
                eventData={data.events[eventIndex - 1]}
                onUpdate={handleEventChange}
                onDelete={handleDelete}
              />
            </>
          )}
        </div>
        {data && data.events.length >= 1 && (
          <Button 
            className="h-11 text-#080808 hover:bg-green-500 hover:cursor-pointer" 
            variant="outline"
            onClick={submitEvents}
            disabled={isSubmitting}
            >
              {isSubmitting ? "Uploading..." : "Submit Events!"}
          </Button>
        )}
      </div>
  )
}

export default App
