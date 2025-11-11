import React, { useState, useEffect } from 'react';

const LiveClock: React.FC = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timerId);
        };
    }, []);
    
    const timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    };
    
    const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Dhaka',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    };

    const formattedTime = time.toLocaleString('en-US', timeOptions);
    const formattedDate = time.toLocaleString('en-US', dateOptions);

    return (
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-base-200/50 border border-primary/20 rounded-lg text-center">
             <div className="flex flex-col items-center justify-center">
                 <p className="font-mono text-sm font-semibold text-primary tracking-wider">{formattedTime}</p>
                 <p className="text-xs text-muted-content">{formattedDate}</p>
            </div>
        </div>
    );
};

export default LiveClock;
