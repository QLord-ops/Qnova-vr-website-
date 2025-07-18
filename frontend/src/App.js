import React, { useState, useEffect, createContext, useContext, useRef } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Animation Hook
const useInView = (options = {}) => {
  const ref = useRef();
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

// Animated Section Component
const AnimatedSection = ({ children, animation = "fadeInUp", delay = 0, className = "" }) => {
  const [ref, isInView] = useInView();
  
  return (
    <div
      ref={ref}
      className={`${className} ${isInView ? `animate-${animation}` : 'opacity-0'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Language Context

// Language Hook
const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language Provider
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('de'); // Default to German
  
  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'de') return 'en';
      if (prev === 'en') return 'ru';
      return 'de'; // ru -> de
    });
  };
  
  const t = (key) => translations[language][key] || key;
  
  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Navigation Component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <nav className="bg-black text-white fixed w-full top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            QNOVA VR
          </Link>
          
          <div className="hidden xl:flex space-x-8 items-center">
            <Link to="/" className="hover:text-gray-300 transition-colors">{t('home')}</Link>
            <Link to="/about" className="hover:text-gray-300 transition-colors">{t('about')}</Link>
            <Link to="/services" className="hover:text-gray-300 transition-colors">{t('services')}</Link>
            <Link to="/games" className="hover:text-gray-300 transition-colors">{t('games')}</Link>
            <Link to="/booking" className="hover:text-gray-300 transition-colors">{t('bookNow')}</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors">{t('contact')}</Link>
            
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
            >
              {language === 'de' ? '🇬🇧 EN' : language === 'en' ? '🇷🇺 RU' : '🇩🇪 DE'}
            </button>
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="xl:hidden flex items-center justify-center"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="xl:hidden mt-4 space-y-2">
            <Link to="/" className="block py-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>{t('home')}</Link>
            <Link to="/about" className="block py-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>{t('about')}</Link>
            <Link to="/services" className="block py-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>{t('services')}</Link>
            <Link to="/games" className="block py-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>{t('games')}</Link>
            <Link to="/booking" className="block py-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>{t('bookNow')}</Link>
            <Link to="/contact" className="block py-2 hover:text-gray-300" onClick={() => setIsOpen(false)}>{t('contact')}</Link>
            <button
              onClick={() => {
                toggleLanguage();
                setIsOpen(false);
              }}
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-sm transition-colors"
            >
              {language === 'de' ? '🇬🇧 EN' : language === 'en' ? '🇷🇺 RU' : '🇩🇪 DE'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Home Component
const Home = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 bg-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-6xl font-bold mb-6">
                {t('heroTitle')}
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                {t('heroSubtitle')}
              </p>
              <Link 
                to="/booking" 
                className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                {t('bookYourSession')}
              </Link>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1493497029755-f49c8e9a8bbe?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHx2aXJ0dWFsJTIwcmVhbGl0eXxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTI3NDkyNTd8MA&ixlib=rb-4.1.0&q=85"
                alt="VR Experience"
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">{t('whyChooseUs')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('latestTechnology')}</h3>
              <p className="text-gray-600">{t('latestTechDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('groupExperiences')}</h3>
              <p className="text-gray-600">{t('groupExpDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('primeLocation')}</h3>
              <p className="text-gray-600">{t('primeLocationDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">{t('readyToStep')}</h2>
          <p className="text-xl mb-8 text-gray-300">
            {t('readySubtitle')}
          </p>
          <Link 
            to="/booking" 
            className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            {t('bookNow')}
          </Link>
        </div>
      </section>
    </div>
  );
};

// About Component
const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6">{t('aboutTitle')}</h1>
            <p className="text-lg mb-6 text-gray-600">
              {t('aboutDesc1')}
            </p>
            <p className="text-lg mb-6 text-gray-600">
              {t('aboutDesc2')}
            </p>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-2xl font-bold mb-2">50+</h3>
                <p className="text-gray-600">{t('gamesAvailable')}</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">2023</h3>
                <p className="text-gray-600">{t('established')}</p>
              </div>
            </div>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1493496553793-56c1aa2cfcea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwzfHx2aXJ0dWFsJTIwcmVhbGl0eXxlbnwwfHx8YmxhY2tfYW5kX3doaXRlfDE3NTI3NDkyNTd8MA&ixlib=rb-4.1.0&q=85"
              alt="VR Studio"
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Services Component
const Services = () => {
  const { t } = useLanguage();
  
  const services = [
    {
      title: t('vrGamingSessions'),
      description: t('vrGamingDesc'),
      price: t('fromPrice') + "25/hour",
      features: [t('vrHeadsets'), t('wideGameSelection'), t('expertGuidance')]
    },
    {
      title: t('playstationGaming'),
      description: t('playstationDesc'),
      price: t('fromPrice') + "20/hour",
      features: [t('ps5Console'), t('latestGames'), t('comfortableSeating')]
    },
    {
      title: t('groupParties'),
      description: t('groupPartiesDesc'),
      price: t('fromPrice') + "150/group",
      features: [t('upToPlayers'), t('twoHourSessions'), t('refreshmentsIncluded')]
    },
    {
      title: t('corporateEvents'),
      description: t('corporateDesc'),
      price: t('contactForPricing'),
      features: [t('customPackages'), t('professionalSetup'), t('cateringOptions')]
    }
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-center mb-16">{t('servicesTitle')}</h1>
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.description}</p>
              <div className="text-2xl font-bold mb-4">{service.price}</div>
              <ul className="space-y-2">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Games Component
const Games = () => {
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, [filter]);

  const fetchGames = async () => {
    try {
      const params = filter !== 'all' ? { platform: filter } : {};
      const response = await axios.get(`${API}/games`, { params });
      setGames(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-2xl">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-center mb-16">{t('gameCatalog')}</h1>
        
        {/* Filter Buttons */}
        <div className="flex justify-center space-x-4 mb-12">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              filter === 'all' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('allGames')}
          </button>
          <button
            onClick={() => setFilter('VR')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              filter === 'VR' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('vrGames')}
          </button>
          <button
            onClick={() => setFilter('PlayStation')}
            className={`px-6 py-3 rounded-full font-semibold transition-colors ${
              filter === 'PlayStation' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {t('playstation')}
          </button>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <div key={game.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <img 
                src={game.image_url} 
                alt={game.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">{game.name}</h3>
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm">{game.platform}</span>
                </div>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{game.duration} min</span>
                  <span>Max {game.max_players} player{game.max_players > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Booking Component
const Booking = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    participants: 1,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/bookings`, formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">{t('bookingConfirmed')}</h2>
          <p className="text-gray-600 mb-6">{t('confirmationEmail')}</p>
          <p className="text-sm text-gray-500">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-16">{t('bookingTitle')}</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('name')} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('email')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('phone')} *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('service')} *</label>
              <select
                name="service"
                value={formData.service}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">{t('selectService')}</option>
                <option value="VR Gaming Session">VR Gaming Session</option>
                <option value="PlayStation Gaming">PlayStation Gaming</option>
                <option value="Group Party">Group Party</option>
                <option value="Corporate Event">Corporate Event</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('date')} *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('time')} *</label>
                <select
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">{t('selectTime')}</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="20:00">8:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('participants')} *</label>
              <input
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                min="1"
                max="8"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('additionalMessage')}</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder={t('messagePlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? t('booking') : t('bookSession')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Contact Component
const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API}/contact`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Contact form failed:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container mx-auto px-4 py-20">
        <h1 className="text-5xl font-bold text-center mb-16">{t('contactUs')}</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl font-bold mb-8">{t('getInTouch')}</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <svg className="w-6 h-6 text-gray-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold">{t('address')}</h3>
                  <p className="text-gray-600">Stumpfebiel 4<br />37073 Göttingen, Germany</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <svg className="w-6 h-6 text-gray-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-gray-600">+49 160 96286290</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <svg className="w-6 h-6 text-gray-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-gray-600">qnovavr.de@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <svg className="w-6 h-6 text-gray-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold">{t('openingHours')}</h3>
                  <p className="text-gray-600">
                    {t('mondayToSaturday')}<br />
                    {t('sundayTournaments')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <svg className="w-6 h-6 text-gray-600 mt-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <div>
                  <h3 className="font-semibold">{t('instagram')}</h3>
                  <p className="text-gray-600">@qnova_vr</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-8">{t('sendMessage')}</h2>
            
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
                {t('messageSent')}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('name')} *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('email')} *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('subject')} *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('message')} *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? t('sending') : t('sendMessageBtn')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  const { language, t } = useLanguage();
  
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">QNOVA VR</h3>
            <p className="text-gray-300 mb-4">
              {language === 'de' 
                ? 'Ihr VR-Studio im Herzen von Göttingen. Erleben Sie die Zukunft des Gamings mit modernster Technologie.'
                : language === 'en'
                ? 'Your VR studio in the heart of Göttingen. Experience the future of gaming with cutting-edge technology.'
                : 'Ваша VR-студия в сердце Гёттингена. Испытайте будущее игр с передовыми технологиями.'
              }
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('contact')}</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-gray-300">Stumpfebiel 4</p>
                  <p className="text-gray-300">37073 Göttingen</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+4916096286290" className="text-gray-300 hover:text-white transition-colors">
                  +49 160 96286290
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:qnovavr.de@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  qnovavr.de@gmail.com
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <a href="https://www.instagram.com/qnova_vr?igsh=eTB4eWRzOWh3ZDVj" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                  @qnova_vr
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('openingHours')}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">
                  {language === 'de' ? 'Mo - Sa:' : language === 'en' ? 'Mon - Sat:' : 'Пн - Сб:'}
                </span>
                <span className="text-white">12:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">
                  {language === 'de' ? 'Sonntag:' : language === 'en' ? 'Sunday:' : 'Воскресенье:'}
                </span>
                <span className="text-white">
                  {language === 'de' ? 'Turniertage' : language === 'en' ? 'Tournaments' : 'Турниры'}
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold mb-4">
                {language === 'de' ? 'Schnellzugriff' : language === 'en' ? 'Quick Links' : 'Быстрые ссылки'}
              </h4>
              <div className="space-y-2">
                <Link to="/booking" className="block text-gray-300 hover:text-white transition-colors">
                  {t('bookNow')}
                </Link>
                <Link to="/games" className="block text-gray-300 hover:text-white transition-colors">
                  {t('games')}
                </Link>
                <Link to="/services" className="block text-gray-300 hover:text-white transition-colors">
                  {t('services')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 QNOVA VR Studio. {language === 'de' ? 'Alle Rechte vorbehalten.' : language === 'en' ? 'All rights reserved.' : 'Все права защищены.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

// Main App Component
function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/games" element={<Games />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </LanguageProvider>
    </div>
  );
}

export default App;