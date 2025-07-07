import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Calendar({ className, ...props }) {
    const [selectedDate, setSelectedDate] = React.useState(new Date());

    return (
        <div className={`p-4 ${className}`}>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                {...props}
            />
        </div>
    );
}

export { Calendar };
