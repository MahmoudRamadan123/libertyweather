// hooks/useHolidays.js
import { useState, useEffect } from 'react';

export const useHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [isHolidayToday, setIsHolidayToday] = useState(false);
  const [todayHoliday, setTodayHoliday] = useState(null);
  const [mascotVideoUrl, setMascotVideoUrl] = useState('');
  const [holidayColors, setHolidayColors] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const today = new Date();
        const currentMMDD = String(today.getMonth() + 1).padStart(2, '0') + '/' + String(today.getDate()).padStart(2, '0');
        
        const res = await fetch('/holidays.json');
        const data = await res.json();
        setHolidays(data);

        // Check if today matches a holiday
        const matchedHoliday = data.holidays.find((holiday) => {
          const yearly = holiday.yearly_date;

          // Case 1: Exact date (ex: 02/14)
          if (!yearly.includes('-')) {
            return yearly === currentMMDD;
          }

          // Case 2: Date range (ex: 01/15-01/21)
          const [start, end] = yearly.split('-');
          const toNumber = (dateStr) => {
            const [m, d] = dateStr.split('/');
            return parseInt(m + d);
          };

          const todayNum = toNumber(currentMMDD);
          const startNum = toNumber(start);
          const endNum = toNumber(end);
          
          return todayNum >= startNum && todayNum <= endNum;
        });

        if (matchedHoliday) {
          setIsHolidayToday(true);
          setTodayHoliday(matchedHoliday);
          setMascotVideoUrl(matchedHoliday.video_url);
          setHolidayColors(matchedHoliday.colors || []);
        } else {
          setIsHolidayToday(false);
        }
      } catch (error) {
        console.error('Failed to fetch holidays:', error);
      }
    };

    fetchHolidays();
  }, []);

  return {
    holidays,
    isHolidayToday,
    todayHoliday,
    mascotVideoUrl,
    holidayColors
  };
};