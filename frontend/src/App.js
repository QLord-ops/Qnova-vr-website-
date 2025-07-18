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

// Language Context
const LanguageContext = createContext();

// Translations
const translations = {
  en: {
    home: "Home", about: "About", services: "Services", games: "Games", bookNow: "Book Now", contact: "Contact",
    heroTitle: "Experience the Future of Gaming", heroSubtitle: "Immerse yourself in cutting-edge virtual reality and PlayStation gaming at QNOVA VR Studio in Göttingen.",
    bookYourSession: "Book Your Session", whyChooseUs: "Why Choose QNOVA VR?", latestTechnology: "Latest Technology",
    latestTechDesc: "State-of-the-art VR headsets and PlayStation 5 for the ultimate gaming experience.",
    groupExperiences: "Group Experiences", groupExpDesc: "Perfect for parties, corporate events, and team building activities.",
    primeLocation: "Prime Location", primeLocationDesc: "Conveniently located in the heart of Göttingen with easy access.",
    readyToStep: "Ready to Step Into Virtual Reality?", readySubtitle: "Book your session today and experience gaming like never before.",
    aboutTitle: "About QNOVA VR Studio", aboutDesc1: "Located in the heart of Göttingen, QNOVA VR Studio is your gateway to immersive virtual reality experiences. We combine cutting-edge technology with exceptional service to create unforgettable gaming adventures.",
    aboutDesc2: "Our state-of-the-art facility features the latest VR headsets, PlayStation 5 consoles, and the innovative Kat Walk VR platform for full-body movement tracking.",
    gamesAvailable: "VR Games Available", established: "Established", servicesTitle: "Our Services", vrGamingSessions: "VR Gaming Sessions",
    vrGamingDesc: "Individual or group VR experiences with the latest games", playstationGaming: "PlayStation Gaming",
    playstationDesc: "PlayStation 5 gaming with premium titles", groupParties: "Group Parties", groupPartiesDesc: "Perfect for birthdays, celebrations, and team events",
    corporateEvents: "Corporate Events", corporateDesc: "Team building and corporate entertainment", fromPrice: "From €",
    contactForPricing: "Contact for pricing", gameCatalog: "Game Catalog", allGames: "All Games", vrGames: "VR Games",
    playstation: "PlayStation", bookingTitle: "Book Your Session", name: "Name", email: "Email", phone: "Phone",
    service: "Service", date: "Date", time: "Time", participants: "Number of Participants", additionalMessage: "Additional Message",
    selectService: "Select a service", selectTime: "Select time", messagePlaceholder: "Any special requests or questions?",
    bookSession: "Book Session", booking: "Booking...", bookingConfirmed: "Booking Confirmed!", confirmationEmail: "We'll send you a confirmation email shortly.",
    redirecting: "Redirecting to homepage...", contactUs: "Contact Us", getInTouch: "Get in Touch", sendMessage: "Send us a Message",
    address: "Address", openingHours: "Opening Hours", mondayToSaturday: "Monday - Saturday: 12:00 PM - 10:00 PM",
    sundayTournaments: "Sunday: Tournament Days", instagram: "Instagram", subject: "Subject", message: "Message",
    sendMessageBtn: "Send Message", sending: "Sending...", messageSent: "Message sent successfully! We'll get back to you soon.",
    vrHeadsets: "Latest VR headsets", wideGameSelection: "Wide game selection", expertGuidance: "Expert guidance",
    ps5Console: "PlayStation 5 console", latestGames: "Latest games", comfortableSeating: "Comfortable seating",
    upToPlayers: "Up to 8 players", twoHourSessions: "2-hour sessions", refreshmentsIncluded: "Refreshments included",
    customPackages: "Custom packages", professionalSetup: "Professional setup", cateringOptions: "Catering options"
  },
  de: {
    home: "Startseite", about: "Über uns", services: "Services", games: "Spiele", bookNow: "Jetzt buchen", contact: "Kontakt",
    heroTitle: "Erleben Sie die Zukunft des Gamings", heroSubtitle: "Tauchen Sie ein in modernste Virtual Reality und PlayStation Gaming im QNOVA VR Studio in Göttingen.",
    bookYourSession: "Session buchen", whyChooseUs: "Warum QNOVA VR wählen?", latestTechnology: "Neueste Technologie",
    latestTechDesc: "Modernste VR-Headsets und PlayStation 5 für das ultimative Gaming-Erlebnis.", 
    expertSupport: "Expertenbetreuung", expertSupportDesc: "Professionelle Betreuung und Hilfe während Ihrer Gaming-Session.",
    groupExperiences: "Gruppenerlebnisse", groupExpDesc: "Perfekt für Partys, Firmenfeiern und Teambuilding-Aktivitäten.", 
    primeLocation: "Beste Lage", primeLocationDesc: "Günstig gelegen im Herzen von Göttingen mit einfachem Zugang.", 
    readyToStep: "Bereit für Virtual Reality?", readySubtitle: "Buchen Sie noch heute Ihre Session und erleben Sie Gaming wie nie zuvor.", 
    aboutTitle: "Über QNOVA VR Studio",
    aboutDescription: "Im Herzen von Göttingen gelegen, ist QNOVA VR Studio Ihr Tor zu immersiven Virtual Reality-Erlebnissen. Wir kombinieren modernste Technologie mit außergewöhnlichem Service.",
    ourStory: "Unsere Geschichte",
    ourStoryText: "QNOVA VR Studio wurde mit der Vision gegründet, Menschen die faszinierenste Gaming-Technologie zu bieten. Unsere hochmoderne Einrichtung verfügt über die neuesten VR-Headsets und PlayStation 5-Konsolen.",
    ourStoryText2: "Wir sind stolz darauf, ein einzigartiges Erlebnis zu schaffen, das sowohl für Anfänger als auch für erfahrene Gamer geeignet ist. Unser Team steht bereit, Sie durch Ihr VR-Abenteuer zu führen.",
    aboutDesc1: "Im Herzen von Göttingen gelegen, ist QNOVA VR Studio Ihr Tor zu immersiven Virtual Reality-Erlebnissen. Wir kombinieren modernste Technologie mit außergewöhnlichem Service, um unvergessliche Gaming-Abenteuer zu schaffen.",
    aboutDesc2: "Unsere hochmoderne Einrichtung verfügt über die neuesten VR-Headsets, PlayStation 5-Konsolen und die innovative Kat Walk VR-Plattform für Ganzkörper-Bewegungstracking.",
    servicesTitle: "Unsere Services", servicesDescription: "Entdecken Sie unsere Vielfalt an VR- und PlayStation-Gaming-Erlebnissen für jeden Geschmack und Anlass.",
    vrGaming: "VR Gaming", vrGamingDesc: "Einzel- oder Gruppen-VR-Erlebnisse mit den neuesten Spielen und modernster Technologie.",
    psVR: "PlayStation VR", psVRDesc: "PlayStation 5 Gaming mit Premium-Titeln und VR-Unterstützung für das ultimative Spielerlebnis.",
    groupEvents: "Gruppenevents", groupEventsDesc: "Perfekt für Geburtstage, Firmenfeiern und Team-Events mit bis zu 8 Spielern.",
    gamesTitle: "Unser Spielekatalog", gamesDescription: "Entdecken Sie unsere umfangreiche Sammlung von VR- und PlayStation-Spielen.",
    loading: "Lade...", allGames: "Alle Spiele", vrGames: "VR-Spiele", psGames: "PlayStation-Spiele",
    bookingTitle: "Session buchen", bookingDescription: "Buchen Sie Ihre VR- oder PlayStation-Gaming-Session. Wählen Sie Datum, Uhrzeit und Service nach Ihren Wünschen.",
    contactTitle: "Kontakt", contactDescription: "Kontaktieren Sie uns für Fragen, Buchungen oder weitere Informationen über unser VR-Studio.",
    getInTouch: "Kontaktieren Sie uns",
    gamesAvailable: "VR-Spiele verfügbar", established: "Gegründet", vrGamingSessions: "VR Gaming Sessions",
    vrGamingDesc: "Einzel- oder Gruppen-VR-Erlebnisse mit den neuesten Spielen", playstationGaming: "PlayStation Gaming",
    playstationDesc: "PlayStation 5 Gaming mit Premium-Titeln", groupParties: "Gruppenpartys", groupPartiesDesc: "Perfekt für Geburtstage, Feiern und Team-Events",
    corporateEvents: "Firmenfeiern", corporateDesc: "Teambuilding und Firmenunterhaltung", fromPrice: "Ab €",
    contactForPricing: "Preis auf Anfrage", gameCatalog: "Spielekatalog", playstation: "PlayStation", 
    name: "Name", email: "E-Mail", phone: "Telefon", service: "Service", date: "Datum", time: "Uhrzeit", 
    participants: "Anzahl Teilnehmer", message: "Nachricht", additionalMessage: "Zusätzliche Nachricht",
    selectService: "Service auswählen", selectTime: "Uhrzeit auswählen", messagePlaceholder: "Besondere Wünsche oder Fragen?",
    vrGamingSession: "VR Gaming Session", psVRExperience: "PlayStation VR Erlebnis", groupVRParty: "Gruppen VR Party",
    bookSession: "Session buchen", submitting: "Buche...", bookNow: "Jetzt buchen",
    bookingConfirmed: "Buchung bestätigt!", bookingConfirmationText: "Wir haben Ihre Buchung erhalten und senden Ihnen eine Bestätigung per E-Mail.",
    bookAnother: "Weitere Session buchen", confirmationEmail: "Wir senden Ihnen in Kürze eine Bestätigungs-E-Mail.",
    redirecting: "Weiterleitung zur Startseite...", contactUs: "Kontakt", sendMessage: "Nachricht senden",
    address: "Adresse", openingHours: "Öffnungszeiten", mondayToSaturday: "Montag - Samstag: 12:00 - 22:00",
    sundayTournaments: "Sonntag: Turniertage", instagram: "Instagram", subject: "Betreff", 
    sendMessageBtn: "Nachricht senden", sending: "Sende...", messageSent: "Nachricht erfolgreich gesendet! Wir melden uns bald bei Ihnen.",
    messageConfirmation: "Vielen Dank für Ihre Nachricht! Wir werden uns so schnell wie möglich bei Ihnen melden.",
    vrHeadsets: "Neueste VR-Headsets", wideGameSelection: "Große Spieleauswahl", expertGuidance: "Expertenbetreuung",
    ps5Console: "PlayStation 5-Konsole", latestGames: "Neueste Spiele", comfortableSeating: "Bequeme Sitzgelegenheiten",
    upToPlayers: "Bis zu 8 Spieler", twoHourSessions: "2-Stunden-Sessions", refreshmentsIncluded: "Erfrischungen inklusive",
    customPackages: "Individuelle Pakete", professionalSetup: "Professionelle Einrichtung", cateringOptions: "Catering-Optionen"
  },
  ru: {
    home: "Главная", about: "О нас", services: "Услуги", games: "Игры", bookNow: "Забронировать", contact: "Контакты",
    heroTitle: "Почувствуйте будущее игр", heroSubtitle: "Погрузитесь в передовую виртуальную реальность и PlayStation-игры в QNOVA VR Studio в Гёттингене.",
    bookYourSession: "Забронировать сеанс", whyChooseUs: "Почему QNOVA VR?", latestTechnology: "Новейшие технологии",
    latestTechDesc: "Современные VR-гарнитуры и PlayStation 5 для максимального игрового опыта.",
    expertSupport: "Экспертная поддержка", expertSupportDesc: "Профессиональная помощь и поддержка во время игровой сессии.",
    groupExperiences: "Групповые мероприятия", groupExpDesc: "Идеально для вечеринок, корпоративных мероприятий и тимбилдинга.", 
    primeLocation: "Отличное расположение", primeLocationDesc: "Удобно расположен в центре Гёттингена с легким доступом.", 
    readyToStep: "Готовы к виртуальной реальности?", readySubtitle: "Забронируйте сеанс сегодня и испытайте игры, как никогда раньше.", 
    aboutTitle: "О QNOVA VR Studio",
    aboutDescription: "Расположенная в сердце Гёттингена, QNOVA VR Studio - ваш путь к захватывающим VR-впечатлениям. Мы сочетаем передовые технологии с исключительным сервисом.",
    ourStory: "Наша история",
    ourStoryText: "QNOVA VR Studio была основана с видением предоставить людям доступ к самым захватывающим игровым технологиям. Наша современная студия оснащена новейшими VR-гарнитурами и PlayStation 5 консолями.",
    ourStoryText2: "Мы гордимся тем, что создаем уникальный опыт, подходящий как для новичков, так и для опытных игроков. Наша команда готова провести вас через ваше VR-приключение.",
    servicesTitle: "Наши услуги", servicesDescription: "Откройте для себя наш разнообразный спектр VR и PlayStation игровых впечатлений на любой вкус и повод.",
    vrGaming: "VR Gaming", vrGamingDesc: "Индивидуальные или групповые VR-впечатления с новейшими играми и передовыми технологиями.",
    psVR: "PlayStation VR", psVRDesc: "Игры на PlayStation 5 с премиальными титулами и VR-поддержкой для максимального игрового опыта.",
    groupEvents: "Групповые мероприятия", groupEventsDesc: "Идеально для дней рождения, корпоративных мероприятий и командных событий до 8 игроков.",
    gamesTitle: "Каталог наших игр", gamesDescription: "Откройте для себя нашу обширную коллекцию VR и PlayStation игр.",
    loading: "Загрузка...", allGames: "Все игры", vrGames: "VR-игры", psGames: "PlayStation игры",
    bookingTitle: "Забронировать сеанс", bookingDescription: "Забронируйте свой VR или PlayStation игровой сеанс. Выберите дату, время и услугу по вашему желанию.",
    contactTitle: "Контакты", contactDescription: "Свяжитесь с нами для вопросов, бронирования или дополнительной информации о нашей VR-студии.",
    getInTouch: "Свяжитесь с нами",
    aboutDesc1: "Расположенная в сердце Гёттингена, QNOVA VR Studio - ваш путь к захватывающим VR-впечатлениям. Мы сочетаем передовые технологии с исключительным сервисом для создания незабываемых игровых приключений.",
    aboutDesc2: "Наша современная студия оснащена новейшими VR-гарнитурами, PlayStation 5 консолями и инновационной платформой Kat Walk VR для полного отслеживания движений тела.",
    gamesAvailable: "VR-игры доступны", established: "Основана", servicesTitle: "Наши услуги", vrGamingSessions: "VR-игровые сеансы",
    vrGamingDesc: "Индивидуальные или групповые VR-впечатления с новейшими играми", playstationGaming: "PlayStation-игры",
    playstationDesc: "Игры на PlayStation 5 с премиальными титулами", groupParties: "Групповые вечеринки", groupPartiesDesc: "Идеально для дней рождения, праздников и командных мероприятий",
    corporateEvents: "Корпоративные мероприятия", corporateDesc: "Тимбилдинг и корпоративные развлечения", fromPrice: "От €",
    contactForPricing: "Цена по запросу", gameCatalog: "Каталог игр", allGames: "Все игры", vrGames: "VR-игры",
    name: "Имя", email: "Электронная почта", phone: "Телефон", service: "Услуга", date: "Дата", time: "Время", 
    participants: "Количество участников", message: "Сообщение", additionalMessage: "Дополнительное сообщение",
    selectService: "Выберите услугу", selectTime: "Выберите время", messagePlaceholder: "Особые пожелания или вопросы?",
    vrGamingSession: "VR игровая сессия", psVRExperience: "PlayStation VR опыт", groupVRParty: "Групповая VR вечеринка",
    bookSession: "Забронировать сеанс", submitting: "Бронирование...", bookNow: "Забронировать сейчас",
    bookingConfirmed: "Бронирование подтверждено!", bookingConfirmationText: "Мы получили ваше бронирование и отправим подтверждение по электронной почте.",
    bookAnother: "Забронировать еще", confirmationEmail: "Мы отправим вам подтверждение по электронной почте.",
    redirecting: "Перенаправление на главную страницу...", contactUs: "Связаться с нами", sendMessage: "Отправить сообщение",
    address: "Адрес", openingHours: "Время работы", mondayToSaturday: "Понедельник - Суббота: 12:00 - 22:00",
    sundayTournaments: "Воскресенье: Турнирные дни", instagram: "Instagram", subject: "Тема", 
    sendMessageBtn: "Отправить сообщение", sending: "Отправка...", messageSent: "Сообщение успешно отправлено! Мы скоро свяжемся с вами.",
    messageConfirmation: "Спасибо за ваше сообщение! Мы свяжемся с вами как можно скорее.",
    vrHeadsets: "Новейшие VR-гарнитуры", wideGameSelection: "Широкий выбор игр", expertGuidance: "Экспертное руководство",
    ps5Console: "PlayStation 5 консоль", latestGames: "Новейшие игры", comfortableSeating: "Удобные сидения",
    upToPlayers: "До 8 игроков", twoHourSessions: "2-часовые сеансы", refreshmentsIncluded: "Прохладительные напитки включены",
    customPackages: "Индивидуальные пакеты", professionalSetup: "Профессиональная настройка", cateringOptions: "Варианты кейтеринга"
  }
};

// Language Provider
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('de');
  
  const toggleLanguage = () => {
    setLanguage(prev => {
      if (prev === 'de') return 'en';
      if (prev === 'en') return 'ru';
      return 'de';
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

// Home Component with Animations
const Home = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 bg-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-6xl font-bold mb-6 hero-title">
                {t('heroTitle')}
              </h1>
              <p className="text-xl mb-8 text-gray-300 hero-subtitle">
                {t('heroSubtitle')}
              </p>
              <Link 
                to="/booking" 
                className="bg-white text-black px-8 py-4 text-lg font-semibold hover:bg-gray-100 transition-colors inline-block hero-button"
              >
                {t('bookYourSession')}
              </Link>
            </div>
            <div className="hero-image">
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
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-4xl font-bold text-center mb-16">{t('whyChooseUs')}</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection animation="slideInLeft" delay={200}>
              <div className="text-center">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('latestTechnology')}</h3>
                <p className="text-gray-600">{t('latestTechDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={400}>
              <div className="text-center">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4">{t('groupExperiences')}</h3>
                <p className="text-gray-600">{t('groupExpDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="slideInRight" delay={600}>
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
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <AnimatedSection animation="fadeInUp" className="py-20 bg-black text-white">
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
      </AnimatedSection>
    </div>
  );
};
const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};


// About Component
const About = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">{t('aboutTitle')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('aboutDescription')}
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection animation="slideInLeft">
              <img 
                src="https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="VR Studio"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </AnimatedSection>
            
            <AnimatedSection animation="slideInRight">
              <div>
                <h2 className="text-3xl font-bold mb-6">{t('ourStory')}</h2>
                <p className="text-gray-600 mb-4">
                  {t('ourStoryText')}
                </p>
                <p className="text-gray-600">
                  {t('ourStoryText2')}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

// Services Component
const Services = () => {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">{t('servicesTitle')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('servicesDescription')}
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-4">{t('vrGaming')}</h3>
                <p className="text-gray-600">
                  {t('vrGamingDesc')}
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={400}>
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-4">{t('psVR')}</h3>
                <p className="text-gray-600">
                  {t('psVRDesc')}
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={600}>
              <div className="bg-gray-50 p-8 rounded-lg text-center">
                <h3 className="text-2xl font-bold mb-4">{t('groupEvents')}</h3>
                <p className="text-gray-600">
                  {t('groupEventsDesc')}
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
};

// Games Component
const Games = () => {
  const { t } = useLanguage();
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${API}/games`);
      setGames(response.data);
      setFilteredGames(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching games:', error);
      setLoading(false);
    }
  };

  const filterGames = (platform) => {
    setSelectedPlatform(platform);
    if (platform === 'all') {
      setFilteredGames(games);
    } else {
      setFilteredGames(games.filter(game => game.platform === platform));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-2xl font-bold">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">{t('gamesTitle')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('gamesDescription')}
            </p>
          </AnimatedSection>
          
          <div className="text-center mb-12">
            <div className="inline-flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => filterGames('all')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedPlatform === 'all'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {t('allGames')}
              </button>
              <button
                onClick={() => filterGames('VR')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedPlatform === 'VR'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {t('vrGames')}
              </button>
              <button
                onClick={() => filterGames('PlayStation')}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  selectedPlatform === 'PlayStation'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {t('psGames')}
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGames.map((game) => (
              <AnimatedSection key={game.id} animation="fadeInUp">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
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
    participants: '1',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post(`${API}/bookings`, formData);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        participants: '1',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">{t('bookingConfirmed')}</h2>
          <p className="text-gray-600 mb-6">{t('bookingConfirmationText')}</p>
          <button
            onClick={() => setIsSuccess(false)}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {t('bookAnother')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">{t('bookingTitle')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('bookingDescription')}
            </p>
          </AnimatedSection>
          
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('email')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('service')} *
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">{t('selectService')}</option>
                    <option value="VR Gaming Session">{t('vrGamingSession')}</option>
                    <option value="PlayStation VR Experience">{t('psVRExperience')}</option>
                    <option value="Group VR Party">{t('groupVRParty')}</option>
                  </select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('date')} *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('time')} *
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('participants')} *
                  </label>
                  <select
                    name="participants"
                    value={formData.participants}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="1">1 Person</option>
                    <option value="2">2 Personen</option>
                    <option value="3">3 Personen</option>
                    <option value="4">4 Personen</option>
                    <option value="5">5+ Personen</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder={t('messagePlaceholder')}
                ></textarea>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-black text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? t('submitting') : t('bookNow')}
              </button>
            </form>
          </div>
        </div>
      </section>
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await axios.post(`${API}/contact`, formData);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting contact form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-20 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">{t('contactTitle')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('contactDescription')}
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-8">{t('getInTouch')}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white p-3 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('address')}</h3>
                    <p className="text-gray-600">Stumpfebiel 4<br />37073 Göttingen</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white p-3 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('phone')}</h3>
                    <p className="text-gray-600">+49 160 96286290</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white p-3 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('email')}</h3>
                    <p className="text-gray-600">qnovavr.de@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white p-3 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t('openingHours')}</h3>
                    <p className="text-gray-600">Mo - Sa: 12:00 - 22:00<br />Sonntag: Turniertage</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              {isSuccess ? (
                <div className="bg-green-50 p-8 rounded-lg text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{t('messageSent')}</h3>
                  <p className="text-gray-600">{t('messageConfirmation')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('name')} *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('subject')} *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('message')} *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? t('sending') : t('sendMessage')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
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