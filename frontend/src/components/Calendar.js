import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Calendar = ({ selectedDate, onDateChange, onSlotSelect }) => {
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  // Generate next 7 days for quick selection
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const fetchCalendarData = async (date) => {
    setLoading(true);
    setError(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await axios.get(`${API}/api/calendar/${dateStr}`);
      setCalendarData(response.data);
    } catch (err) {
      setError('Ошибка загрузки календаря');
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchCalendarData(selectedDate);
    }
  }, [selectedDate]);

  const formatTime = (time) => {
    return time.substring(0, 5); // HH:MM format
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSlotStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 hover:bg-green-200 border-green-300 text-green-800';
      case 'booked':
        return 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
      case 'maintenance':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800 cursor-not-allowed';
      case 'blocked':
        return 'bg-gray-100 border-gray-300 text-gray-800 cursor-not-allowed';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSlotStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Свободно';
      case 'booked':
        return 'Занято';
      case 'maintenance':
        return 'Обслуживание';
      case 'blocked':
        return 'Заблокировано';
      default:
        return 'Недоступно';
    }
  };

  const getServiceIcon = (serviceType) => {
    if (serviceType.includes('PlayStation')) {
      return '🎮';
    } else if (serviceType.includes('KAT VR')) {
      return '🚶‍♂️';
    }
    return '🎯';
  };

  const getDuration = (serviceType) => {
    if (serviceType.includes('PlayStation')) {
      return '1 час';
    } else if (serviceType.includes('KAT VR')) {
      return '30 мин';
    }
    return '30 мин';
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'available' && onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">📅 Календарь Бронирования</h2>
        <p className="text-gray-600">Выберите дату и удобное время для VR-сессии</p>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Выберите дату:</h3>
        <div className="flex flex-wrap gap-2">
          {generateDateOptions().map((date, index) => {
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <button
                key={index}
                onClick={() => onDateChange(date)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isSelected
                    ? 'bg-black text-white border-black'
                    : isToday
                    ? 'bg-blue-50 text-blue-700 border-blue-300 hover:bg-blue-100'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">
                    {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="text-xs opacity-75">
                    {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Calendar Content */}
      {selectedDate && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">
            📆 {formatDate(selectedDate)}
          </h3>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка расписания...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchCalendarData(selectedDate)}
                className="mt-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Попробовать снова
              </button>
            </div>
          )}

          {calendarData && (
            <div>
              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{calendarData.available_slots}</div>
                  <div className="text-sm text-green-700">Свободно</div>
                </div>
                <div className="bg-red-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{calendarData.booked_slots}</div>
                  <div className="text-sm text-red-700">Занято</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-600">{calendarData.total_slots}</div>
                  <div className="text-sm text-gray-700">Всего слотов</div>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {calendarData.slots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(slot)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer
                      ${getSlotStatusColor(slot.status)}
                      ${slot.status === 'available' ? 'hover:shadow-md hover:scale-105' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getServiceIcon(slot.service_type)}</span>
                        <span className="font-bold text-lg">{formatTime(slot.time)}</span>
                      </div>
                      <span className={`
                        px-2 py-1 rounded text-xs font-semibold
                        ${slot.status === 'available' ? 'bg-green-200 text-green-800' : 
                          slot.status === 'booked' ? 'bg-red-200 text-red-800' : 
                          'bg-gray-200 text-gray-800'}
                      `}>
                        {getSlotStatusText(slot.status)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      {slot.service_type.includes('PlayStation') ? '🎮 PlayStation VR' : '🚶‍♂️ KAT VR'}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Длительность: {getDuration(slot.service_type)}
                    </div>

                    {slot.status === 'booked' && slot.customer_info && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <div className="text-xs text-red-600 font-medium">
                          👤 {slot.customer_info.name}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {calendarData.slots.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">На выбранную дату нет доступных слотов времени.</p>
                  <button
                    onClick={() => {
                      // Generate slots for this date
                      const dateStr = selectedDate.toISOString().split('T')[0];
                      axios.post(`${API}/api/calendar/generate-slots/${dateStr}`)
                        .then(() => fetchCalendarData(selectedDate))
                        .catch(err => console.error('Error generating slots:', err));
                    }}
                    className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800"
                  >
                    Создать расписание на этот день
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;