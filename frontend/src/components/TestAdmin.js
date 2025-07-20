import React, { useState } from 'react';

const TestAdmin = () => {
  const [bookings] = useState([
    {
      id: 1,
      name: 'Тест Клиент 1',
      email: 'test1@example.com',
      service: 'KAT VR Gaming Session',
      date: '2025-07-20',
      time: '14:00',
      status: 'confirmed'
    },
    {
      id: 2,
      name: 'Тест Клиент 2', 
      email: 'test2@example.com',
      service: 'PlayStation 5 VR Experience',
      date: '2025-07-20',
      time: '16:00',
      status: 'confirmed'
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">🛠️ Админ Панель QNOVA VR</h1>
          <p className="text-gray-600">Демо версия - управление бронированиями</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">📅 Сегодняшние Бронирования</h2>
          
          <div className="space-y-4">
            {bookings.map(booking => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{booking.name}</h3>
                    <p className="text-sm text-gray-600">{booking.email}</p>
                    <p className="text-sm mt-1">
                      📅 {booking.date} в {booking.time}
                    </p>
                    <p className="text-sm">
                      🎮 {booking.service.includes('PlayStation') ? 'PlayStation VR' : 'KAT VR'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                      ✅ Подтвердить
                    </button>
                    <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">
                      ❌ Отменить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">📋 Демо режим</h3>
            <p className="text-sm text-blue-800">
              Это демо версия админ панели. В полной версии будут реальные данные из базы.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAdmin;