import { useState, useMemo, useCallback } from 'react';
import { Button, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { BookingAvailabilitySlot } from '../../../types';

interface DatePickerProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  availabilitySlots: BookingAvailabilitySlot[];
  blockedDates: string[];
  timezone: string;
  minBookingAdvanceHours?: number;
  maxBookingAdvanceDays?: number;
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DatePicker = ({
  selectedDate,
  onDateSelect,
  availabilitySlots,
  blockedDates,
  minBookingAdvanceHours = 0,
  maxBookingAdvanceDays = 60
}: DatePickerProps) => {
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  // Displayed month/year (navigable)
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [displayYear, setDisplayYear] = useState(today.getFullYear());

  // Get days that have availability configured
  const availableDaysOfWeek = useMemo(() => {
    const days = new Set<number>();
    availabilitySlots.forEach((slot) => days.add(slot.dayOfWeek));
    return days;
  }, [availabilitySlots]);

  // Calculate min/max bookable dates based on advance settings
  const minBookableDate = useMemo(() => {
    const d = new Date(Date.now() + minBookingAdvanceHours * 60 * 60 * 1000);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minBookingAdvanceHours]);

  const maxBookableDate = useMemo(() => {
    const d = new Date(today.getTime() + maxBookingAdvanceDays * 24 * 60 * 60 * 1000);
    return d;
  }, [today, maxBookingAdvanceDays]);

  // Generate calendar weeks for the displayed month
  const calendarWeeks = useMemo(() => {
    const weeks: Date[][] = [];
    const startDate = new Date(displayYear, displayMonth, 1);

    // Go back to Sunday of the first week
    const firstDayOfMonth = startDate.getDay();
    startDate.setDate(startDate.getDate() - firstDayOfMonth);

    // Generate 6 weeks (always 6 rows for consistent height)
    for (let week = 0; week < 6; week++) {
      const weekDays: Date[] = [];
      for (let day = 0; day < 7; day++) {
        weekDays.push(new Date(startDate));
        startDate.setDate(startDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    return weeks;
  }, [displayMonth, displayYear]);

  // Can navigate to previous month? (not before current month)
  const canGoPrev = displayYear > today.getFullYear() ||
    (displayYear === today.getFullYear() && displayMonth > today.getMonth());

  // Can navigate to next month? (not beyond maxBookableDate's month)
  const canGoNext = displayYear < maxBookableDate.getFullYear() ||
    (displayYear === maxBookableDate.getFullYear() && displayMonth < maxBookableDate.getMonth());

  const goToPrevMonth = useCallback(() => {
    if (!canGoPrev) return;
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  }, [canGoPrev, displayMonth]);

  const goToNextMonth = useCallback(() => {
    if (!canGoNext) return;
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  }, [canGoNext, displayMonth]);

  // Check if a date is available for booking
  const isDateAvailable = (date: Date): boolean => {
    if (date < today) return false;
    if (date < minBookableDate) return false;
    if (date > maxBookableDate) return false;
    if (!availableDaysOfWeek.has(date.getDay())) return false;
    const dateStr = date.toISOString().split('T')[0];
    if (blockedDates.includes(dateStr)) return false;
    return true;
  };

  const isSelected = (date: Date): boolean => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === selectedDate;
  };

  const isToday = (date: Date): boolean => {
    return date.getTime() === today.getTime();
  };

  const handleDateClick = (date: Date) => {
    if (isDateAvailable(date)) {
      onDateSelect(date.toISOString().split('T')[0]);
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm zoom-in-normal">
      {/* Month header with navigation arrows */}
      <div className="mb-4 flex items-center justify-between fade-down-fast">
        <IconButton
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          size="small"
          sx={{ color: canGoPrev ? 'text.primary' : 'text.disabled' }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            {MONTHS[displayMonth]} {displayYear}
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">Selecciona una fecha disponible</p>
        </div>
        <IconButton
          onClick={goToNextMonth}
          disabled={!canGoNext}
          size="small"
          sx={{ color: canGoNext ? 'text.primary' : 'text.disabled' }}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>

      {/* Days of week header */}
      <div className="mb-2 grid grid-cols-7 gap-1 sm:gap-2 fade-left-normal">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-1 sm:py-2 text-center text-xs sm:text-sm font-medium text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="space-y-1 sm:space-y-2 flip-up-normal">
        {calendarWeeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1 sm:gap-2">
            {week.map((date, dayIndex) => {
              const available = isDateAvailable(date);
              const selected = isSelected(date);
              const todayDate = isToday(date);
              const isDisplayedMonth = date.getMonth() === displayMonth;

              return (
                <Button
                  key={dayIndex}
                  onClick={() => handleDateClick(date)}
                  disabled={!available}
                  variant={selected ? 'contained' : 'text'}
                  sx={{
                    aspectRatio: '1',
                    minWidth: 0,
                    p: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    fontWeight: selected ? 'bold' : available ? 600 : 'normal',
                    borderRadius: '6px',
                    color: !isDisplayedMonth ? '#d1d5db' : selected ? 'white' : available ? '#1e40af' : '#d1d5db',
                    bgcolor: selected ? 'primary.main' : available ? '#dbeafe' : 'transparent',
                    '&:hover': {
                      bgcolor: selected ? 'primary.dark' : available ? '#bfdbfe' : 'transparent',
                    },
                    '&.Mui-disabled': {
                      color: '#d1d5db',
                      bgcolor: 'transparent',
                    },
                    ...(todayDate && !selected && {
                      border: '2px solid',
                      borderColor: 'primary.main',
                    }),
                    ...(selected && {
                      boxShadow: '0 0 0 2px',
                      boxShadowColor: 'primary.main',
                    }),
                  }}
                >
                  {date.getDate()}
                </Button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 fade-up-slow">
        <div className="flex items-center gap-1 fade-right-fast">
          <div className="h-3 w-3 rounded-sm bg-blue-100 ring-2 ring-blue-500" />
          <span>Hoy</span>
        </div>
        <div className="flex items-center gap-1 zoom-in-fast">
          <div className="h-3 w-3 rounded-sm bg-blue-600" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1 fade-left-fast">
          <div className="h-3 w-3 rounded-sm bg-blue-100" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-1 fade-left-fast">
          <div className="h-3 w-3 rounded-sm bg-gray-100" />
          <span>No disponible</span>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
