import React, { useState, useEffect } from 'react';

const SimpleCalendar = ({ onSlotSelect }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);

  // Generate time slots for demo
  useEffect(() => {
    const slots = [];
    for (let hour = 12; hour < 22; hour++) {
      slots.push({
        time: `${hour}:00`,
        status: Math.random() > 0.3 ? 'available' : 'booked',
        service: hour % 2 === 0 ? 'KAT VR Gaming Session' : 'PlayStation 5 VR Experience'
      });
      slots.push({
        time: `${hour}:30`,
        status: Math.random() > 0.4 ? 'available' : 'booked',
        service: 'KAT VR Gaming Session'
      });
    }
    setTimeSlots(slots);
  }, [selectedDate]);

  const getStatusColor = (status) => {
    return status === 'available' 
      ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 cursor-pointer'
      : 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed';
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'available' && onSlotSelect) {
      onSlotSelect(slot);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">📅 Календарь Бронирования</h2>
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">
          📆 {selectedDate.toLocaleDateString('ru-RU', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {timeSlots.map((slot, index) => (
          <div
            key={index}
            onClick={() => handleSlotClick(slot)}
            className={`p-3 rounded-lg border-2 transition-all ${getStatusColor(slot.status)}`}
          >
            <div className="font-bold text-lg">{slot.time}</div>
            <div className="text-xs">
              {slot.service.includes('PlayStation') ? '🎮 PlayStation' : '🚶‍♂️ KAT VR'}
            </div>
            <div className="text-xs mt-1">
              {slot.status === 'available' ? '✅ Свободно' : '❌ Занято'}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p>🟢 Зеленый = Свободно | 🔴 Красный = Занято</p>
        <p>Кликните на зеленый слот для бронирования</p>
      </div>
    </div>
  );
};

export default SimpleCalendar;