import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [bookings, setBookings] = useState([]);
  const [testMode, setTestMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const fetchTodayBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/admin/bookings/today`);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTestBookings = async () => {
    try {
      const response = await axios.post(`${API}/api/admin/test-mode/create-bookings`);
      setMessage(`✅ ${response.data.message}. Создано ${response.data.bookings} тестовых бронирований.`);
      await fetchTodayBookings();
    } catch (error) {
      setMessage(`❌ Ошибка создания тестовых данных: ${error.message}`);
    }
  };

  const clearTestData = async () => {
    try {
      const response = await axios.delete(`${API}/api/admin/test-mode/clear-test-data`);
      setMessage(`🗑️ ${response.data.message}. Удалено слотов: ${response.data.deleted_slots}, бронирований: ${response.data.deleted_bookings}`);
      await fetchTodayBookings();
    } catch (error) {
      setMessage(`❌ Ошибка очистки данных: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchTodayBookings();
  }, []);

  const formatDateTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('ru-RU', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    })} в ${timeStr}`;
  };

  const getServiceIcon = (service) => {
    if (service.includes('PlayStation')) return '🎮';
    if (service.includes('KAT VR')) return '🚶‍♂️';
    return '🎯';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🛠️ Админ Панель QNOVA VR</h1>
          <p className="text-gray-600">Управление бронированиями и календарем</p>
        </div>

        {/* Test Mode Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🧪 Режим Тестирования</h2>
          
          {message && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              onClick={createTestBookings}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              ➕ Создать Тестовые Брони
            </button>
            
            <button
              onClick={clearTestData}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              🗑️ Очистить Тестовые Данные
            </button>
            
            <button
              onClick={fetchTodayBookings}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔄 Обновить Данные
            </button>
          </div>
        </div>

        {/* Today's Bookings */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">📅 Сегодняшние Бронирования</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {bookings.length} {bookings.length === 1 ? 'бронирование' : 'бронирований'}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Загрузка бронирований...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет бронирований на сегодня</h3>
              <p className="text-gray-500">Создайте тестовые данные для демонстрации</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Customer Info */}
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">
                            {booking.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.name}</h3>
                          <p className="text-sm text-gray-500">{booking.email} • {booking.phone}</p>
                        </div>
                      </div>

                      {/* Booking Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Время</p>
                          <p className="font-medium">{formatDateTime(booking.date, booking.time)}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Услуга</p>
                          <p className="font-medium flex items-center">
                            <span className="mr-1">{getServiceIcon(booking.service)}</span>
                            {booking.service.includes('PlayStation') ? 'PlayStation VR' : 'KAT VR'}
                          </p>
                        </div>

                        {booking.selectedGame && (
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Игра</p>
                            <p className="font-medium">🎮 {booking.selectedGame}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">Участники</p>
                          <p className="font-medium">{booking.participants} чел.</p>
                        </div>
                      </div>

                      {/* Additional Message */}
                      {booking.message && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Сообщение</p>
                          <p className="text-sm text-gray-700">{booking.message}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-4 flex flex-col gap-2">
                      <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                        ✅ Подтвердить
                      </button>
                      <button className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">
                        ❌ Отменить
                      </button>
                      <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                        📞 Связаться
                      </button>
                    </div>
                  </div>

                  {/* Booking Status */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>ID: {booking.id.substring(0, 8)}...</span>
                        <span>Создано: {new Date(booking.created_at).toLocaleDateString('ru-RU')}</span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          {booking.status || 'confirmed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Инструкции по использованию:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Создать Тестовые Брони:</strong> Создает 5 примеров бронирований для тестирования системы</p>
            <p><strong>Очистить Тестовые Данные:</strong> Удаляет все тестовые бронирования и освобождает слоты</p>
            <p><strong>Обновить Данные:</strong> Получает актуальную информацию о бронированиях</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;