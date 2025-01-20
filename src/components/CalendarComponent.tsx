import React, { useState, useRef, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarComponent.css";

const months = [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
];

const CalendarComponent: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [checkInDate, setCheckInDate] = useState<Date | null>(null);
    const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
    const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
    const [isCalendarVisible, setIsCalendarVisible] = useState<boolean>(false);

    const calendarContainerRef = useRef<HTMLDivElement | null>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const handleDateClick = (date: Date) => {
        if (!checkInDate) {
            setCheckInDate(date);
        } else if (!checkOutDate) {
            if (date < checkInDate) {
                setCheckInDate(date);
            } else {
                setCheckOutDate(date);
                setHoveredDate(null);
                setIsCalendarVisible(false);
            }
        } else {
            if (date < checkInDate) {
                setCheckInDate(date);
                setCheckOutDate(null);
            } else {
                setCheckOutDate(date);
                setHoveredDate(null);
                setIsCalendarVisible(false);
            }
        }

        if (checkOutDate && date > checkOutDate) {
            setCheckOutDate(null);
        }
    };

    const clearDate = (type: "checkIn" | "checkOut") => {
        if (type === "checkIn") {
            setCheckInDate(null);
        } else {
            setCheckOutDate(null);
        }
        setHoveredDate(null);
    };

    const handleYearChange = (direction: "prev" | "next") => {
        setSelectedYear((prevYear) => (direction === "prev" ? prevYear - 1 : prevYear + 1));
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return "";
        return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const isDateInRange = (date: Date): boolean => {
        if (checkInDate && hoveredDate && !checkOutDate) {
            const start = checkInDate < hoveredDate ? checkInDate : hoveredDate;
            const end = checkInDate > hoveredDate ? checkInDate : hoveredDate;
            return date > start && date < end;
        }
        if (checkInDate && checkOutDate) {
            return date > checkInDate && date < checkOutDate;
        }
        return false;
    };

    const handleMonthClick = (monthIndex: number) => {
        setSelectedMonth(monthIndex);
        const calendarContainer = calendarContainerRef.current;
        if (calendarContainer) {
            const targetMonth = calendarContainer.querySelectorAll(".calendar-month")[monthIndex];
            if (targetMonth) {
                targetMonth.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        }
    };

    useEffect(() => {
        if (isCalendarVisible) {
            const targetDate = checkInDate || checkOutDate;
            if (targetDate) {
                setSelectedMonth(targetDate.getMonth());
                setSelectedYear(targetDate.getFullYear());

                const calendarContainer = calendarContainerRef.current;
                if (calendarContainer) {
                    const targetMonth = calendarContainer.querySelectorAll(".calendar-month")[targetDate.getMonth()];
                    if (targetMonth) {
                        targetMonth.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }
                }
            }
        }
    }, [isCalendarVisible, checkInDate, checkOutDate]);

    return (
        <div className="calendar-wrapper">
            <div className="date-fields">
                <div className="date-field">
                    <div className="field-container">
                        <input
                            type="text"
                            value={formatDate(checkInDate)}
                            placeholder="Заезд"
                            readOnly
                            className="date-input"
                            onClick={() => setIsCalendarVisible(true)}
                        />
                        {checkInDate && (
                            <button
                                className="clear-button inside"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearDate("checkIn");
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
                <div className="date-field">
                    <div className="field-container">
                        <input
                            type="text"
                            value={formatDate(checkOutDate)}
                            placeholder="Выезд"
                            readOnly
                            className="date-input"
                            onClick={() => setIsCalendarVisible(true)}
                        />
                        {checkOutDate && (
                            <button
                                className="clear-button inside"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearDate("checkOut");
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isCalendarVisible && (
                <div className="calendar-container" ref={calendarContainerRef}>
                    <div className="year-navigation">
                        <button onClick={() => handleYearChange("prev")} className="year-nav-button">
                            &lt; Предыдущий год
                        </button>
                        <span className="current-year">{selectedYear}</span>
                        <button onClick={() => handleYearChange("next")} className="year-nav-button">
                            Следующий год &gt;
                        </button>
                    </div>

                    <div className="calendar-content">
                        <div className="sidebar">
                            {months.map((month, index) => (
                                <div
                                    key={month}
                                    className={`month ${selectedMonth === index ? "active" : ""}`}
                                    onClick={() => handleMonthClick(index)}
                                >
                                    {selectedMonth === index && <div className="active-marker" />}
                                    {month}
                                </div>
                            ))}
                        </div>

                        <div className="calendar-scroll">
                            {months.map((month, index) => (
                                <div key={month} className="calendar-month">
                                    <div className="calendar-header">{`${month} ${selectedYear}`}</div>
                                    <Calendar
                                        value={new Date(selectedYear, index, 1)}
                                        locale="ru"
                                        calendarType="iso8601"
                                        showNavigation={false}
                                        showNeighboringMonth={false}
                                        onClickDay={(date) => handleDateClick(date)}
                                        tileClassName={({ date, view }) => {
                                            if (view === "month" && date < today) {
                                                return "past-date";
                                            }
                                            if (checkInDate && date.getTime() === checkInDate.getTime()) {
                                                return "check-in-date";
                                            }
                                            if (checkOutDate && date.getTime() === checkOutDate.getTime()) {
                                                return "check-out-date";
                                            }
                                            if (isDateInRange(date)) {
                                                return "in-range";
                                            }
                                            return null;
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarComponent;
