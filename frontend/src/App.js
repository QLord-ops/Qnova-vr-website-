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
    home: "Home", about: "About", services: "Services", games: "Games", pricing: "Pricing", bookNow: "Book Now", contact: "Contact",
    heroTitle: "Experience the Future of Gaming", heroSubtitle: "Immerse yourself in cutting-edge virtual reality with KAT VR treadmill technology and PlayStation gaming at QNOVA VR Studio in Göttingen.",
    bookYourSession: "Book Your Session", whyChooseUs: "Why Choose QNOVA VR?",
    
    // KAT VR Platform content  
    katVRTitle: "KAT VR Treadmill Technology", katVRSubtitle: "Experience VR gaming like never before with full-body movement freedom",
    katVRDescription: "As one of the first VR studios in Germany to offer the revolutionary KAT Walk C+ platform - an omnidirectional treadmill that enables natural movement in the virtual world.",
    katVRVideoCaption: "Experience KAT VR Technology in Action",
    fullBodyMovement: "Full-Body Movement", fullBodyMovementDesc: "Walk, crouch, and jump in the virtual world naturally",
    immersiveExperience: "Maximum Immersion", immersiveExperienceDesc: "360° movement freedom for the ultimate VR experience",
    safetyFirst: "Safety First", safetyFirstDesc: "Safety harnesses and professional supervision for worry-free gaming",
    
    // Featured Games section
    featuredGames: "Featured VR Games", featuredGamesSubtitle: "Discover our top selection of VR and PlayStation games",
    exploreAllGames: "Explore All Games", playOnKatVR: "Playable on KAT VR", playOnPS5: "PlayStation 5",
    
    // Enhanced features
    latestTechnology: "Latest Technology", latestTechDesc: "KAT VR treadmill, Meta Quest 3, and PlayStation 5 for the ultimate gaming experience.",
    expertSupport: "Expert Support", expertSupportDesc: "Professional introduction and guidance throughout your entire VR session.",
    groupExperiences: "Group Experiences", groupExpDesc: "Up to 8 players simultaneously - perfect for parties, corporate events, and team building.",
    primeLocation: "Prime Location", primeLocationDesc: "Located in the heart of Göttingen with easy access and free parking.",
    
    // Technology specs
    techSpecs: "Our Technology",
    katWalkC: "KAT Walk C+ Platform", katWalkCDesc: "Omnidirectional treadmill with haptic feedback",
    metaQuest: "Meta Quest 3 VR Headsets", metaQuestDesc: "Enhanced 4K+ resolution with advanced mixed reality capabilities",
    playstation5: "PlayStation 5 Consoles", playstation5Desc: "Latest games in 4K with VR support",
    
    readyToStep: "Ready for the Ultimate VR Experience?", 
    readySubtitle: "Book your session with the KAT VR platform and experience gaming in a completely new dimension.",
    aboutTitle: "About QNOVA VR Studio",
    aboutDescription: "Located in the heart of Göttingen, QNOVA VR Studio is your gateway to immersive virtual reality experiences. We combine cutting-edge technology with exceptional service.",
    ourStory: "Our Story",
    ourStoryText: "QNOVA VR Studio was founded with the vision of bringing people the most exciting gaming technology available. Our state-of-the-art facility features the latest VR headsets and PlayStation 5 consoles.",
    ourStoryText2: "We pride ourselves on creating a unique experience suitable for both beginners and experienced gamers. Our team is ready to guide you through your VR adventure.",
    servicesTitle: "Our Services", servicesDescription: "Discover our diverse range of VR and PlayStation gaming experiences for every taste and occasion.",
    vrGaming: "VR Gaming", vrGamingDesc: "Individual or group VR experiences with the latest games and cutting-edge technology.",
    psVR: "PlayStation VR", psVRDesc: "PlayStation 5 gaming with premium titles and VR support for the ultimate gaming experience.",
    groupEvents: "Group Events", groupEventsDesc: "Perfect for birthdays, corporate events, and team building activities for up to 8 players.",
    gamesTitle: "Our Game Catalog", gamesDescription: "Explore our extensive collection of VR and PlayStation games.",
    loading: "Loading...", allGames: "All Games", vrGames: "VR Games", psGames: "PlayStation Games",
    bookingTitle: "Book Your Session", bookingDescription: "Book your session on our KAT VR platform (30 minutes) or PlayStation 5 console (1 hour). Choose your preferred date, time, and service.",
    contactTitle: "Contact Us", contactDescription: "Get in touch with us for inquiries, bookings, or more information about our VR studio.",
    getInTouch: "Get in Touch",
    aboutDesc2: "Our state-of-the-art facility features the latest VR headsets, PlayStation 5 consoles, and the innovative Kat Walk VR platform for full-body movement tracking.",
    gamesAvailable: "VR Games Available", established: "Established", servicesTitle: "Our Services", vrGamingSessions: "VR Gaming Sessions",
    vrGamingDesc: "Individual or group VR experiences with the latest games", playstationGaming: "PlayStation Gaming",
    playstationDesc: "PlayStation 5 gaming with premium titles", groupParties: "Group Parties", groupPartiesDesc: "Perfect for birthdays, celebrations, and team events",
    corporateEvents: "Corporate Events", corporateDesc: "Team building and corporate entertainment", fromPrice: "From €",
    contactForPricing: "Contact for pricing", gameCatalog: "Game Catalog", allGames: "All Games", vrGames: "VR Games",
    name: "Name", email: "Email", phone: "Phone", service: "Service", date: "Date", time: "Time", 
    participants: "Number of Participants", message: "Message", additionalMessage: "Additional Message",
    selectService: "Select a service", selectTime: "Select time", first: "first", messagePlaceholder: "Any special requests or questions?",
    vrGamingSession: "KAT VR Gaming Session (30 minutes)", psVRExperience: "PlayStation 5 VR Experience (1 hour)", groupVRParty: "Group KAT VR Party (30 minutes)",
    bookSession: "Book Session", submitting: "Booking...", bookNow: "Book Now",
    bookingConfirmed: "Booking Confirmed!", bookingConfirmationText: "We've received your booking and will send you a confirmation email.",
    bookAnother: "Book Another Session", confirmationEmail: "We'll send you a confirmation email shortly.",
    // New booking translations
    bookingSuccess: "Booking Successful!", bookingSuccessMessage: "We've received your booking and will send you a confirmation email.",
    payNowSecure: "💳 Pay Now & Secure Your Booking",
    bookingFor: "Booking for", fullName: "Full Name", enterName: "Enter your name", enterEmail: "Enter your email",
    selectDate: "Select Date", katVRService: "KAT VR Gaming Session", playstationService: "PlayStation 5 VR Experience", 
    groupService: "Group KAT VR Party", minutes: "minutes", hour: "hour", person: "person", people: "people",
    additionalMessage: "Additional Message", enterMessage: "Enter your message",
    redirecting: "Redirecting to homepage...", contactUs: "Contact Us", sendMessage: "Send us a Message",
    address: "Address", openingHours: "Opening Hours", mondayToSaturday: "Monday - Saturday: 12:00 PM - 10:00 PM",
    sundayTournaments: "Sunday: Tournament Days", instagram: "Instagram", subject: "Subject", 
    sendMessageBtn: "Send Message", sending: "Sending...", messageSent: "Message sent successfully! We'll get back to you soon.",
    messageConfirmation: "Thank you for your message! We'll get back to you as soon as possible.",
    pricingTitle: "Pricing & Packages", pricingDescription: "Choose the perfect VR gaming package for your needs. All sessions include equipment rental and expert guidance.",
    individualVR: "Individual VR Session", individualVRDesc: "Perfect for first-time VR users or solo gaming adventures.",
    individualVRPrice: "€25", individualVRDuration: "30 minutes", 
    groupVR: "Group VR Session", groupVRDesc: "Ideal for friends and family gaming together.",
    groupVRPrice: "€20", groupVRDuration: "30 minutes per person", 
    playstationSession: "PlayStation Gaming", playstationSessionDesc: "Experience the latest PlayStation 5 games in comfort.",
    playstationPrice: "€15", playstationDuration: "1 hour", 
    vrPartyPackage: "VR Party Package", vrPartyPackageDesc: "Perfect for birthdays, celebrations, and special events.",
    vrPartyPrice: "€180", vrPartyDuration: "2 hours", 
    corporatePackage: "Corporate Package", corporatePackageDesc: "Team building and corporate entertainment experiences.",
    corporatePrice: "Contact for pricing", corporateDuration: "Custom duration", 
    perPerson: "per person", bookThisPackage: "Book This Package", contactForDetails: "Contact for Details",
    // Pricing page
    pricingTitle: "Pricing & Packages", pricingDescription: "Choose the perfect VR gaming package for your needs. All sessions include equipment rental and expert guidance.",
    individualVR: "Individual KAT VR Session", individualVRDesc: "Perfect for first-time VR users or solo gaming adventures.",
    individualVRPrice: "€19.99", individualVRDuration: "30 minutes", individualVRFeatures: ["Latest VR headset", "Game selection", "Expert guidance"],
    groupVR: "Group KAT VR Session", groupVRDesc: "Ideal for friends and family gaming together.",
    groupVRPrice: "€19.99", groupVRDuration: "30 minutes per person", groupVRFeatures: ["Up to 4 players", "Multiplayer games", "Group discounts"],
    playstationSession: "PlayStation Gaming", playstationSessionDesc: "Experience the latest PlayStation 5 games in comfort.",
    playstationPrice: "€9.99", playstationDuration: "1 hour", playstationFeatures: ["PlayStation 5 console", "Latest games", "Comfortable seating"],
    vrPartyPackage: "VR Party Package", vrPartyPackageDesc: "Perfect for birthdays, celebrations, and special events.",
    vrPartyPrice: "Contact for pricing", vrPartyDuration: "Custom duration", vrPartyFeatures: ["Up to 8 players", "Custom session length", "Refreshments included"],
    corporatePackage: "Corporate Package", corporatePackageDesc: "Team building and corporate entertainment experiences.",
    corporatePrice: "Contact for pricing", corporateDuration: "Custom duration", corporateFeatures: ["Custom packages", "Professional setup", "Catering options"],
    perPerson: "per person", bookThisPackage: "Book This Package", contactForDetails: "Contact for Details",
    vrHeadsets: "Latest VR headsets", wideGameSelection: "Wide game selection", expertGuidance: "Expert guidance",
    ps5Console: "PlayStation 5 console", latestGames: "Latest games", comfortableSeating: "Comfortable seating",
    upToPlayers: "Up to 8 players", twoHourSessions: "2-hour sessions", refreshmentsIncluded: "Refreshments included",
    customPackages: "Custom packages", professionalSetup: "Professional setup", cateringOptions: "Catering options"
  },
  de: {
    home: "Startseite", about: "Über uns", services: "Services", games: "Spiele", pricing: "Preise", bookNow: "Jetzt buchen", contact: "Kontakt",
    heroTitle: "Erleben Sie die Zukunft des Gamings", heroSubtitle: "Tauchen Sie ein in modernste Virtual Reality mit KAT VR Laufband-Technologie und PlayStation Gaming im QNOVA VR Studio in Göttingen.",
    bookYourSession: "Session buchen", whyChooseUs: "Warum QNOVA VR wählen?", 
    
    // KAT VR Platform content
    katVRTitle: "KAT VR Laufband-Technologie", katVRSubtitle: "Erleben Sie VR Gaming wie nie zuvor mit Ganzkörper-Bewegungsfreiheit",
    katVRDescription: "Als eines der ersten VR-Studios in Deutschland bieten wir die revolutionäre KAT Walk C+ Plattform - ein omnidirektionales Laufband, das natürliche Bewegungen in der virtuellen Welt ermöglicht.",
    katVRVideoCaption: "Erleben Sie die KAT VR Technologie in Aktion",
    fullBodyMovement: "Ganzkörper-Bewegung", fullBodyMovementDesc: "Laufen, ducken und springen Sie in der virtuellen Welt",
    immersiveExperience: "Maximale Immersion", immersiveExperienceDesc: "360° Bewegungsfreiheit für das ultimative VR-Erlebnis",
    safetyFirst: "Absolute Sicherheit", safetyFirstDesc: "Sicherheitsgurte und professionelle Betreuung für sorgenfreies Gaming",
    
    // Featured Games section
    featuredGames: "Beliebte VR-Spiele", featuredGamesSubtitle: "Entdecken Sie unsere Top-Auswahl an VR- und PlayStation-Spielen",
    exploreAllGames: "Alle Spiele entdecken", playOnKatVR: "Spielbar auf KAT VR", playOnPS5: "PlayStation 5",
    
    // Enhanced features
    latestTechnology: "Neueste Technologie", latestTechDesc: "KAT VR Laufband, Meta Quest 3 und PlayStation 5 für das ultimative Gaming-Erlebnis.",
    expertSupport: "Expertenbetreuung", expertSupportDesc: "Professionelle Einführung und Betreuung während Ihrer gesamten VR-Session.",
    groupExperiences: "Gruppenerlebnisse", groupExpDesc: "Bis zu 8 Spieler gleichzeitig - perfekt für Partys, Firmenfeiern und Teambuilding.",
    primeLocation: "Beste Lage", primeLocationDesc: "Mitten in Göttingen gelegen mit einfachem Zugang und kostenfreien Parkplätzen.",
    
    // Technology specs
    techSpecs: "Unsere Technologie", 
    katWalkC: "KAT Walk C+ Plattform", katWalkCDesc: "Omnidirektionales Laufband mit Haptik-Feedback",
    metaQuest: "Meta Quest 3 VR-Headsets", metaQuestDesc: "Erweiterte 4K+ Auflösung mit fortschrittlichen Mixed-Reality-Funktionen",
    playstation5: "PlayStation 5 Konsolen", playstation5Desc: "Neueste Spiele in 4K mit VR-Unterstützung",
    
    readyToStep: "Bereit für das ultimative VR-Erlebnis?", 
    readySubtitle: "Buchen Sie Ihre Session mit der KAT VR Plattform und erleben Sie Gaming in einer völlig neuen Dimension.", 
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
    bookingTitle: "Session buchen", bookingDescription: "Buchen Sie Ihre Session auf unserer KAT VR Plattform (30 Minuten) oder PlayStation 5 Konsole (1 Stunde). Wählen Sie Datum, Uhrzeit und Service nach Ihren Wünschen.",
    contactTitle: "Kontakt", contactDescription: "Kontaktieren Sie uns für Fragen, Buchungen oder weitere Informationen über unser VR-Studio.",
    getInTouch: "Kontaktieren Sie uns",
    gamesAvailable: "VR-Spiele verfügbar", established: "Gegründet", vrGamingSessions: "VR Gaming Sessions",
    vrGamingDesc: "Einzel- oder Gruppen-VR-Erlebnisse mit den neuesten Spielen", playstationGaming: "PlayStation Gaming",
    playstationDesc: "PlayStation 5 Gaming mit Premium-Titeln", groupParties: "Gruppenpartys", groupPartiesDesc: "Perfekt für Geburtstage, Feiern und Team-Events",
    corporateEvents: "Firmenfeiern", corporateDesc: "Teambuilding und Firmenunterhaltung", fromPrice: "Ab €",
    contactForPricing: "Preis auf Anfrage", gameCatalog: "Spielekatalog", playstation: "PlayStation", 
    name: "Name", email: "E-Mail", phone: "Telefon", service: "Service", date: "Datum", time: "Uhrzeit", 
    participants: "Anzahl Teilnehmer", message: "Nachricht", additionalMessage: "Zusätzliche Nachricht",
    selectService: "Service auswählen", selectTime: "Uhrzeit auswählen", first: "zuerst", messagePlaceholder: "Besondere Wünsche oder Fragen?",
    vrGamingSession: "KAT VR Gaming Session (30 Minuten)", psVRExperience: "PlayStation 5 VR Erlebnis (1 Stunde)", groupVRParty: "Gruppen KAT VR Party (30 Minuten)",
    bookSession: "Session buchen", submitting: "Buche...", bookNow: "Jetzt buchen",
    bookingConfirmed: "Buchung bestätigt!", bookingConfirmationText: "Wir haben Ihre Buchung erhalten und senden Ihnen eine Bestätigung per E-Mail.",
    bookAnother: "Weitere Session buchen", confirmationEmail: "Wir senden Ihnen in Kürze eine Bestätigungs-E-Mail.",
    // New booking translations
    bookingSuccess: "Buchung erfolgreich!", bookingSuccessMessage: "Wir haben Ihre Buchung erhalten und senden Ihnen eine Bestätigung per E-Mail.",
    payNowSecure: "💳 Jetzt bezahlen & Buchung sichern",
    bookingFor: "Buchung für", fullName: "Vollständiger Name", enterName: "Namen eingeben", enterEmail: "E-Mail eingeben",
    selectDate: "Datum auswählen", katVRService: "KAT VR Gaming Session", playstationService: "PlayStation 5 VR Erlebnis", 
    groupService: "Gruppen KAT VR Party", minutes: "Minuten", hour: "Stunde", person: "Person", people: "Personen",
    additionalMessage: "Zusätzliche Nachricht", enterMessage: "Nachricht eingeben",
    redirecting: "Weiterleitung zur Startseite...", contactUs: "Kontakt", sendMessage: "Nachricht senden",
    address: "Adresse", openingHours: "Öffnungszeiten", mondayToSaturday: "Montag - Samstag: 12:00 - 22:00",
    sundayTournaments: "Sonntag: Turniertage", instagram: "Instagram", subject: "Betreff", 
    sendMessageBtn: "Nachricht senden", sending: "Sende...", messageSent: "Nachricht erfolgreich gesendet! Wir melden uns bald bei Ihnen.",
    messageConfirmation: "Vielen Dank für Ihre Nachricht! Wir werden uns so schnell wie möglich bei Ihnen melden.",
    pricingTitle: "Preise & Pakete", pricingDescription: "Wählen Sie das perfekte VR-Gaming-Paket für Ihre Bedürfnisse. Alle Sessions beinhalten Ausrüstungsverleih und Expertenbetreuung.",
    individualVR: "Einzelne KAT VR-Session", individualVRDesc: "Perfekt für VR-Erstnutzer oder Solo-Gaming-Abenteuer.",
    individualVRPrice: "€19,99", individualVRDuration: "30 Minuten", 
    groupVR: "Gruppen KAT VR-Session", groupVRDesc: "Ideal für Freunde und Familie, die zusammen spielen.",
    groupVRPrice: "€19,99", groupVRDuration: "30 Minuten pro Person", 
    playstationSession: "PlayStation Gaming", playstationSessionDesc: "Erleben Sie die neuesten PlayStation 5-Spiele in Komfort.",
    playstationPrice: "€9,99", playstationDuration: "1 Stunde", 
    vrPartyPackage: "VR-Party-Paket", vrPartyPackageDesc: "Perfekt für Geburtstage, Feiern und besondere Anlässe.",
    vrPartyPrice: "Preis auf Anfrage", vrPartyDuration: "Individuelle Dauer", 
    corporatePackage: "Firmenpaket", corporatePackageDesc: "Teambuilding und Firmenunterhaltung.",
    corporatePrice: "Preis auf Anfrage", corporateDuration: "Individuelle Dauer", 
    perPerson: "pro Person", bookThisPackage: "Dieses Paket buchen", contactForDetails: "Für Details kontaktieren",
    vrHeadsets: "Neueste VR-Headsets", wideGameSelection: "Große Spieleauswahl", expertGuidance: "Expertenbetreuung",
    ps5Console: "PlayStation 5-Konsole", latestGames: "Neueste Spiele", comfortableSeating: "Bequeme Sitzgelegenheiten",
    upToPlayers: "Bis zu 8 Spieler", twoHourSessions: "2-Stunden-Sessions", refreshmentsIncluded: "Erfrischungen inklusive",
    customPackages: "Individuelle Pakete", professionalSetup: "Professionelle Einrichtung", cateringOptions: "Catering-Optionen"
  },
  ru: {
    home: "Главная", about: "О нас", services: "Услуги", games: "Игры", pricing: "Цены", bookNow: "Забронировать", contact: "Контакты",
    heroTitle: "Почувствуйте будущее игр", heroSubtitle: "Погрузитесь в передовую виртуальную реальность с технологией беговой дорожки KAT VR и PlayStation-играми в QNOVA VR Studio в Гёттингене.",
    bookYourSession: "Забронировать сеанс", whyChooseUs: "Почему QNOVA VR?",
    
    // KAT VR Platform content
    katVRTitle: "Технология беговой дорожки KAT VR", katVRSubtitle: "Испытайте VR-игры как никогда раньше с полной свободой движений",
    katVRDescription: "Как одна из первых VR-студий в Германии, мы предлагаем революционную платформу KAT Walk C+ - всенаправленную беговую дорожку, которая позволяет естественные движения в виртуальном мире.",
    katVRVideoCaption: "Испытайте технологию KAT VR в действии",
    fullBodyMovement: "Движения всем телом", fullBodyMovementDesc: "Ходите, приседайте и прыгайте в виртуальном мире естественно",
    immersiveExperience: "Максимальное погружение", immersiveExperienceDesc: "360° свобода движений для максимального VR-опыта",
    safetyFirst: "Безопасность прежде всего", safetyFirstDesc: "Страховочные ремни и профессиональный контроль для беспечной игры",
    
    // Featured Games section
    featuredGames: "Популярные VR-игры", featuredGamesSubtitle: "Откройте для себя наш топ-выбор VR и PlayStation игр",
    exploreAllGames: "Посмотреть все игры", playOnKatVR: "Доступно на KAT VR", playOnPS5: "PlayStation 5",
    
    // Enhanced features
    latestTechnology: "Новейшие технологии", latestTechDesc: "Беговая дорожка KAT VR, Meta Quest 3 и PlayStation 5 для максимального игрового опыта.",
    expertSupport: "Экспертная поддержка", expertSupportDesc: "Профессиональное введение и поддержка на протяжении всей VR-сессии.",
    groupExperiences: "Групповые мероприятия", groupExpDesc: "До 8 игроков одновременно - идеально для вечеринок, корпоративных мероприятий и тимбилдинга.",
    primeLocation: "Отличное расположение", primeLocationDesc: "Расположена в самом центре Гёттингена с легким доступом и бесплатной парковкой.",
    
    // Technology specs
    techSpecs: "Наши технологии",
    katWalkC: "Платформа KAT Walk C+", katWalkCDesc: "Всенаправленная беговая дорожка с тактильной обратной связью",
    metaQuest: "VR-гарнитуры Meta Quest 3", metaQuestDesc: "Улучшенное разрешение 4K+ с продвинутыми возможностями смешанной реальности",
    playstation5: "Консоли PlayStation 5", playstation5Desc: "Новейшие игры в 4K с поддержкой VR",
    
    readyToStep: "Готовы к максимальному VR-опыту?", 
    readySubtitle: "Забронируйте сеанс с платформой KAT VR и испытайте игры в совершенно новом измерении.", 
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
    bookingTitle: "Забронировать сеанс", bookingDescription: "Забронируйте сеанс на нашей платформе KAT VR (30 минут) или консоли PlayStation 5 (1 час). Выберите дату, время и услугу по вашему желанию.",
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
    selectService: "Выберите услугу", selectTime: "Выберите время", first: "сначала", messagePlaceholder: "Особые пожелания или вопросы?",
    vrGamingSession: "KAT VR игровая сессия (30 минут)", psVRExperience: "PlayStation 5 VR опыт (1 час)", groupVRParty: "Групповая KAT VR вечеринка (30 минут)",
    bookSession: "Забронировать сеанс", submitting: "Бронирование...", bookNow: "Забронировать сейчас",
    bookingConfirmed: "Бронирование подтверждено!", bookingConfirmationText: "Мы получили ваше бронирование и отправим подтверждение по электронной почте.",
    bookAnother: "Забронировать еще", confirmationEmail: "Мы отправим вам подтверждение по электронной почте.",
    // New booking translations
    bookingSuccess: "Бронирование успешно!", bookingSuccessMessage: "Мы получили ваше бронирование и отправим подтверждение по электронной почте.",
    payNowSecure: "💳 Оплатить сейчас и гарантировать бронирование",
    bookingFor: "Бронирование для", fullName: "Полное имя", enterName: "Введите имя", enterEmail: "Введите email",
    selectDate: "Выберите дату", katVRService: "KAT VR игровая сессия", playstationService: "PlayStation 5 VR опыт", 
    groupService: "Групповая KAT VR вечеринка", minutes: "минут", hour: "час", person: "человек", people: "человек",
    additionalMessage: "Дополнительное сообщение", enterMessage: "Введите сообщение",
    redirecting: "Перенаправление на главную страницу...", contactUs: "Связаться с нами", sendMessage: "Отправить сообщение",
    address: "Адрес", openingHours: "Время работы", mondayToSaturday: "Понедельник - Суббота: 12:00 - 22:00",
    sundayTournaments: "Воскресенье: Турнирные дни", instagram: "Instagram", subject: "Тема", 
    sendMessageBtn: "Отправить сообщение", sending: "Отправка...", messageSent: "Сообщение успешно отправлено! Мы скоро свяжемся с вами.",
    messageConfirmation: "Спасибо за ваше сообщение! Мы свяжемся с вами как можно скорее.",
    pricingTitle: "Цены и пакеты", pricingDescription: "Выберите идеальный пакет VR-игр для ваших потребностей. Все сеансы включают аренду оборудования и экспертное руководство.",
    individualVR: "Индивидуальная KAT VR-сессия", individualVRDesc: "Идеально для новичков VR или соло-игровых приключений.",
    individualVRPrice: "€19,99", individualVRDuration: "30 минут", 
    groupVR: "Групповая KAT VR-сессия", groupVRDesc: "Идеально для друзей и семьи, играющих вместе.",
    groupVRPrice: "€19,99", groupVRDuration: "30 минут на человека", 
    playstationSession: "PlayStation Gaming", playstationSessionDesc: "Испытайте новейшие игры PlayStation 5 с комфортом.",
    playstationPrice: "€9,99", playstationDuration: "1 час", 
    vrPartyPackage: "VR-пакет для вечеринки", vrPartyPackageDesc: "Идеально для дней рождения, праздников и особых событий.",
    vrPartyPrice: "Цена по запросу", vrPartyDuration: "Индивидуальная продолжительность", 
    corporatePackage: "Корпоративный пакет", corporatePackageDesc: "Тимбилдинг и корпоративные развлечения.",
    corporatePrice: "Цена по запросу", corporateDuration: "Индивидуальная продолжительность", 
    perPerson: "за человека", bookThisPackage: "Забронировать этот пакет", contactForDetails: "Связаться для уточнения",
    vrHeadsets: "Новейшие VR-гарнитуры", wideGameSelection: "Широкий выбор игр", expertGuidance: "Экспертное руководство",
    ps5Console: "PlayStation 5 консоль", latestGames: "Новейшие игры", comfortableSeating: "Удобные сидения",
    upToPlayers: "До 8 игроков", twoHourSessions: "2-часовые сеансы", refreshmentsIncluded: "Прохладительные напитки включены",
    customPackages: "Индивидуальные пакеты", professionalSetup: "Профессиональная настройка", cateringOptions: "Варианты кейтеринга"
  }
};

// Language Provider with language selection on every visit
const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('de'); // Default to German
  const [showLanguageModal, setShowLanguageModal] = useState(false); // Don't auto-show modal

  const selectLanguage = (lang) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

  const toggleLanguage = () => {
    const newLang = language === 'de' ? 'en' : language === 'en' ? 'ru' : 'de';
    setLanguage(newLang);
  };

  const t = (key) => {
    if (!language) return key; // Return key if no language selected
    return translations[language][key] || translations.de[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, selectLanguage, showLanguageModal }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Language Selection Modal Component
const LanguageSelectionModal = () => {
  const { selectLanguage } = useLanguage();

  const languageOptions = [
    {
      code: 'de',
      name: 'Deutsch',
      flag: '🇩🇪',
      greeting: 'Willkommen bei QNOVA VR'
    },
    {
      code: 'en', 
      name: 'English',
      flag: '🇬🇧',
      greeting: 'Welcome to QNOVA VR'
    },
    {
      code: 'ru',
      name: 'Русский', 
      flag: '🇷🇺',
      greeting: 'Добро пожаловать в QNOVA VR'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl">
        <div className="mb-6">
          <div className="text-4xl font-bold mb-2">QNOVA</div>
          <div className="text-sm font-light tracking-widest text-gray-600">VIRTUAL REALITY</div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Language</h2>
        <p className="text-gray-600 mb-6">Wählen Sie Ihre Sprache • Выберите язык</p>
        
        <div className="space-y-3">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              onClick={() => selectLanguage(option.code)}
              className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-black hover:bg-gray-50 transition-all duration-300 flex items-center justify-between group"
            >
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{option.flag}</span>
                <div className="text-left">
                  <div className="font-semibold text-gray-800">{option.name}</div>
                  <div className="text-sm text-gray-600 group-hover:text-black">{option.greeting}</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 mt-6">
          You can change the language anytime in the navigation menu
        </p>
      </div>
    </div>
  );
};

// Navigation Component
const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, toggleLanguage, t, selectLanguage } = useLanguage();

  return (
    <nav className="bg-black text-white fixed w-full top-0 z-50 border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="flex flex-col items-start">
              <span className="text-3xl font-bold tracking-wider">QNOVA</span>
              <span className="text-sm font-light tracking-widest -mt-1">VIRTUAL REALITY</span>
            </div>
          </Link>
          
          <div className="hidden xl:flex space-x-8 items-center">
            <Link to="/" className="hover:text-gray-300 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('home')}</Link>
            <Link to="/about" className="hover:text-gray-300 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('about')}</Link>
            <Link to="/services" className="hover:text-gray-300 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('services')}</Link>
            <Link to="/games" className="hover:text-gray-300 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('games')}</Link>
            <Link to="/pricing" className="hover:text-gray-300 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('pricing')}</Link>
            <Link to="/booking" className="hover:text-gray-300 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('bookNow')}</Link>
            <Link to="/contact" className="hover:text-gray-300 transition-colors" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{t('contact')}</Link>
            
            {/* Flag Language Selector */}
            <div className="flex space-x-2 items-center">
              <button
                onClick={() => selectLanguage('de')}
                className={`w-8 h-6 rounded overflow-hidden hover:ring-2 hover:ring-white/50 transition-all duration-300 ${
                  language === 'de' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="Deutsch"
              >
                <span className="text-lg">🇩🇪</span>
              </button>
              <button
                onClick={() => selectLanguage('en')}
                className={`w-8 h-6 rounded overflow-hidden hover:ring-2 hover:ring-white/50 transition-all duration-300 ${
                  language === 'en' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="English"
              >
                <span className="text-lg">🇬🇧</span>
              </button>
              <button
                onClick={() => selectLanguage('ru')}
                className={`w-8 h-6 rounded overflow-hidden hover:ring-2 hover:ring-white/50 transition-all duration-300 ${
                  language === 'ru' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="Русский"
              >
                <span className="text-lg">🇷🇺</span>
              </button>
            </div>
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
            <Link to="/" className="block py-2 hover:text-gray-300" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('home')}</Link>
            <Link to="/about" className="block py-2 hover:text-gray-300" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('about')}</Link>
            <Link to="/services" className="block py-2 hover:text-gray-300" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('services')}</Link>
            <Link to="/games" className="block py-2 hover:text-gray-300" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('games')}</Link>
            <Link to="/pricing" className="block py-2 hover:text-gray-300" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('pricing')}</Link>
            <Link to="/booking" className="block py-2 hover:text-gray-300" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('bookNow')}</Link>
            <Link to="/contact" className="block py-2 hover:text-gray-300" onClick={() => { setIsOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>{t('contact')}</Link>
            {/* Mobile Flag Language Selector */}
            <div className="flex space-x-3 items-center py-2">
              <span className="text-sm text-gray-300">Language:</span>
              <button
                onClick={() => { selectLanguage('de'); setIsOpen(false); }}
                className={`w-8 h-6 rounded overflow-hidden hover:ring-2 hover:ring-white/50 transition-all duration-300 ${
                  language === 'de' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="Deutsch"
              >
                <span className="text-lg">🇩🇪</span>
              </button>
              <button
                onClick={() => { selectLanguage('en'); setIsOpen(false); }}
                className={`w-8 h-6 rounded overflow-hidden hover:ring-2 hover:ring-white/50 transition-all duration-300 ${
                  language === 'en' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="English"
              >
                <span className="text-lg">🇬🇧</span>
              </button>
              <button
                onClick={() => { selectLanguage('ru'); setIsOpen(false); }}
                className={`w-8 h-6 rounded overflow-hidden hover:ring-2 hover:ring-white/50 transition-all duration-300 ${
                  language === 'ru' ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                title="Русский"
              >
                <span className="text-lg">🇷🇺</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Home Component with Enhanced Mobile Responsiveness and KAT VR
const Home = () => {
  const { t } = useLanguage();
  
  // Featured games data with your REAL game covers
  const featuredGames = [
    {
      name: "Half-Life: Alyx",
      platform: "KAT VR",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxnYW1pbmd8ZW58MHx8fHwxNzUyOTQxNTA1fDA&ixlib=rb-4.1.0&q=85",
      description: "Premium VR experience with stunning graphics and immersive gameplay"
    },
    {
      name: "Beat Saber",
      platform: "KAT VR", 
      image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwzfHxnYW1pbmd8ZW58MHx8fHwxNzUyOTQxNTA1fDA&ixlib=rb-4.1.0&q=85",
      description: "Rhythm game perfect for all ages - slice beats with lightsabers"
    },
    {
      name: "FIFA 25",
      platform: "PlayStation 5",
      image: "https://i.imgur.com/9ZbaSE2.jpeg",  // Your CORRECT FIFA 25 cover
      description: "Latest football simulation with realistic gameplay and updated rosters"
    },
    {
      name: "Call of Duty: Modern Warfare III",
      platform: "PlayStation 5",
      image: "https://i.imgur.com/qkrEXep.png",  // Your CORRECT COD MW3 cover
      description: "Latest installment in the popular FPS franchise with campaign and multiplayer"
    }
  ];
  
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 bg-black text-white overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <AnimatedSection animation="slideInLeft">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 md:mb-6 hero-text">
                  {t('heroTitle')}
                </h1>
                <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-300 mobile-text">
                  {t('heroSubtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                  <Link 
                    to="/booking" 
                    className="bg-white text-black px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold hover:bg-gray-100 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl touch-target hover-lift text-center"
                  >
                    {t('bookYourSession')}
                  </Link>
                  <Link 
                    to="/games" 
                    className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 rounded-lg touch-target text-center"
                  >
                    {t('exploreAllGames')}
                  </Link>
                </div>
              </div>
            </AnimatedSection>
            <AnimatedSection animation="slideInRight">
              <div className="mt-8 md:mt-0">
                <img 
                  src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                  alt="KAT VR Gaming Experience"
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-2xl hover-lift"
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* KAT VR Platform Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 section-title text-white drop-shadow-lg" style={{color: 'white !important'}}>{t('katVRTitle')}</h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto mobile-text">
              {t('katVRDescription')}
            </p>
          </AnimatedSection>

          {/* Video Section */}
          <AnimatedSection animation="fadeInUp" className="mb-12 md:mb-16">
            <div className="max-w-4xl mx-auto">
              <div className="relative w-full h-0 pb-[56.25%] rounded-xl overflow-hidden shadow-2xl bg-black">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/8z6QjTrTkGY?si=szKA4CdIFE-U_usy&rel=0&showinfo=0&modestbranding=1"
                  title="KAT VR Experience at QNOVA VR Studio"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <p className="text-center text-gray-400 mt-4 text-sm md:text-base">
                {t('katVRVideoCaption')}
              </p>
            </div>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12">
            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="text-center p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('fullBodyMovement')}</h3>
                <p className="text-gray-300 text-sm md:text-base mobile-text">{t('fullBodyMovementDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={400}>
              <div className="text-center p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('immersiveExperience')}</h3>
                <p className="text-gray-300 text-sm md:text-base mobile-text">{t('immersiveExperienceDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={600}>
              <div className="text-center p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('safetyFirst')}</h3>
                <p className="text-gray-300 text-sm md:text-base mobile-text">{t('safetyFirstDesc')}</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 section-title">{t('featuredGames')}</h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mobile-text">
              {t('featuredGamesSubtitle')}
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredGames.map((game, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 150}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover-lift">
                  <div className="relative">
                    <img 
                      src={game.image} 
                      alt={game.name}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                      game.platform === 'KAT VR' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : game.platform === 'PlayStation 5'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                        : 'bg-gray-800 text-white'
                    }`}>
                      {game.platform === 'KAT VR' ? t('playOnKatVR') : 
                       game.platform === 'PlayStation 5' ? t('playOnPS5') : game.platform}
                    </div>
                  </div>
                  <div className="p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold mb-2 card-title">{game.name}</h3>
                    <p className="text-gray-600 text-sm md:text-base mobile-text">{game.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection animation="fadeInUp" className="text-center mt-8 md:mt-12">
            <Link 
              to="/games" 
              className="bg-black text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold hover:bg-gray-800 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl touch-target hover-lift inline-block"
            >
              {t('exploreAllGames')}
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Technology Specs Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold section-title">{t('techSpecs')}</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <AnimatedSection animation="slideInLeft" delay={200}>
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('katWalkC')}</h3>
                <p className="text-gray-600 text-sm md:text-base mobile-text">{t('katWalkCDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={400}>
              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('metaQuest')}</h3>
                <p className="text-gray-600 text-sm md:text-base mobile-text">{t('metaQuestDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="slideInRight" delay={600}>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('playstation5')}</h3>
                <p className="text-gray-600 text-sm md:text-base mobile-text">{t('playstation5Desc')}</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold section-title">{t('whyChooseUs')}</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <AnimatedSection animation="fadeInUp" delay={200}>
              <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('latestTechnology')}</h3>
                <p className="text-gray-600 text-sm md:text-base mobile-text">{t('latestTechDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={400}>
              <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('expertSupport')}</h3>
                <p className="text-gray-600 text-sm md:text-base mobile-text">{t('expertSupportDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={600}>
              <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('groupExperiences')}</h3>
                <p className="text-gray-600 text-sm md:text-base mobile-text">{t('groupExpDesc')}</p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="fadeInUp" delay={800}>
              <div className="text-center p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover-lift">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 card-title">{t('primeLocation')}</h3>
                <p className="text-gray-600 text-sm md:text-base mobile-text">{t('primeLocationDesc')}</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-black to-gray-900 text-white">
        <AnimatedSection animation="fadeInUp">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 section-title">{t('readyToStep')}</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-300 max-w-3xl mx-auto mobile-text">
              {t('readySubtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/booking" 
                className="bg-white text-black px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold hover:bg-gray-200 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl touch-target hover-lift"
              >
                {t('bookNow')}
              </Link>
              <Link 
                to="/pricing" 
                className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold hover:bg-white hover:text-black transition-all duration-300 rounded-lg touch-target"
              >
                {t('pricing')}
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>
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
      <section className="pt-32 py-16">
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
      <section className="pt-32 py-16">
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

// Games Component with Functional Booking
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
      <section className="pt-32 py-16">
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
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                      <span>{game.duration} min</span>
                      <span>Max {game.max_players} player{game.max_players > 1 ? 's' : ''}</span>
                    </div>
                    <Link 
                      to={`/booking?game=${encodeURIComponent(game.name)}`} 
                      className="block w-full bg-black text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm text-center"
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                      Book {game.name}
                    </Link>
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

import Calendar from './components/Calendar';
import AdminPanel from './components/AdminPanel';
import SimpleCalendar from './components/SimpleCalendar';
import TestAdmin from './components/TestAdmin';

// Booking Component (Enhanced with Calendar) with Game Selection
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
    message: '',
  });
  
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [selectedGame, setSelectedGame] = useState('');
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Fetch real availability data from API
  const fetchAvailabilityForDate = async (date, service = null) => {
    try {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const serviceParam = service ? `?service=${encodeURIComponent(service)}` : '';
      
      const response = await axios.get(`${API}/api/availability/${dateStr}${serviceParam}`);
      
      // Convert API response to slots format
      const slots = response.data.slots.map(slot => ({
        time: slot.time,
        status: slot.status,
        available: slot.available,
        service: service || 'General'
      }));
      
      return slots;
    } catch (error) {
      console.error('Error fetching availability:', error);
      // Fallback to demo slots if API fails
      return generateDemoTimeSlots();
    }
  };

  // Generate demo time slots (fallback only)
  const generateDemoTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour < 22; hour++) {
      slots.push({
        time: `${hour}:00`,
        status: Math.random() > 0.3 ? 'available' : 'booked',
        available: Math.random() > 0.3,
        service: hour % 2 === 0 ? 'KAT VR Gaming Session' : 'PlayStation 5 VR Experience'
      });
      if (hour < 21) {
        slots.push({
          time: `${hour}:30`,
          status: Math.random() > 0.4 ? 'available' : 'booked',
          available: Math.random() > 0.4,
          service: 'KAT VR Gaming Session'
        });
      }
    }
    return slots;
  };

  const [demoSlots] = useState(generateDemoTimeSlots());

  // Use the same API constant defined at the top of file

  // Get selected game or service from URL parameters and set defaults
  useEffect(() => {
    const initializeService = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get('game');
      const serviceParam = urlParams.get('service');
      
      if (gameParam) {
        const gameName = decodeURIComponent(gameParam);
        setSelectedGame(gameName);
        
        // Auto-select appropriate service based on game
        let defaultService = '';
        if (gameName.includes('FIFA') || 
            gameName.includes('Call of Duty') || 
            gameName.includes('UFC') || 
            gameName.includes('Gran Turismo') || 
            gameName.includes('Grand Theft Auto') ||
            gameName.includes('Modern Warfare')) {
          defaultService = 'PlayStation 5 VR Experience';
        } else {
          defaultService = 'KAT VR Gaming Session';
        }
        
        // Generate time slots for the selected service
        await loadTimeSlots(defaultService);
        
        setFormData(prev => ({
          ...prev,
          service: defaultService
        }));
      } else if (serviceParam) {
        // Direct service selection from pricing page
        const serviceName = decodeURIComponent(serviceParam);
        
        // Generate time slots for the selected service
        await loadTimeSlots(serviceName);
        
        setFormData(prev => ({
          ...prev,
          service: serviceName
        }));
      }
    };

    initializeService();
  }, []);

  // Load real time slots when service or date changes
  const loadTimeSlots = async (serviceType, selectedDate = formData.date) => {
    if (!serviceType) return;
    
    try {
      const dateToUse = selectedDate || new Date().toISOString().split('T')[0];
      const slots = await fetchAvailabilityForDate(dateToUse, serviceType);
      setAvailableTimeSlots(slots);
    } catch (error) {
      console.error('Error loading time slots:', error);
      // Fallback to static generation
      const fallbackSlots = generateStaticTimeSlots(serviceType);
      setAvailableTimeSlots(fallbackSlots);
    }
  };

  // Static time slots generation (fallback)
  const generateStaticTimeSlots = (serviceType) => {
    const slots = [];
    const startHour = 12;
    const endHour = 22;
    
    if (serviceType.includes('PlayStation') || serviceType.includes('PS')) {
      // PlayStation: 1-hour intervals
      for (let hour = startHour; hour <= endHour; hour++) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          status: 'available',
          available: true,
          service: serviceType
        });
      }
    } else {
      // KAT VR or Group: 30-minute intervals  
      for (let hour = startHour; hour < endHour; hour++) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          status: 'available',
          available: true,
          service: serviceType
        });
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:30`,
          status: 'available',
          available: true,
          service: serviceType
        });
      }
    }
    
    return slots;
  };

  const handleChange = async (e) => {
    const { name, value } = e;
    
    if (name === 'service') {
      // Load real time slots based on selected service
      await loadTimeSlots(value, formData.date);
      
      // Reset selected time when service changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        time: ''
      }));
    } else if (name === 'date') {
      // Load time slots for new date
      if (formData.service) {
        await loadTimeSlots(formData.service, value);
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        time: '' // Reset time when date changes
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCalendarSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setFormData(prev => ({
      ...prev,
      service: slot.service_type,
      date: slot.date,
      time: slot.time
    }));
    setShowCalendar(false);
  };

  // Handle time slot click with instant booking capability
  const handleTimeSlotClick = async (time) => {
    const canQuickBook = formData.name && formData.email && formData.phone && formData.service && formData.date;
    
    // If all data is filled, instantly book the slot
    if (canQuickBook) {
      try {
        setIsSubmitting(true);
        
        const bookingData = {
          ...formData,
          time: time,
          selectedGame: selectedGame || ''
        };

        const response = await axios.post(`${API}/bookings`, bookingData);
        
        setIsSuccess(true);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          date: '',
          time: '',
          participants: '1',
          message: '',
        });
        
        // Reload time slots to show updated availability
        if (formData.service && formData.date) {
          await loadTimeSlots(formData.service, formData.date);
        }
        
      } catch (error) {
        console.error('Quick booking error:', error);
        alert('Ошибка при бронировании. Попробуйте ещё раз.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Just select the time if form is not complete
      setFormData(prev => ({
        ...prev,
        time: time
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let bookingData = {
        ...formData,
        selectedGame: selectedGame || '' // Add selected game to booking data
      };

      // If booking through calendar slot
      if (selectedSlot) {
        const response = await axios.post(`${API}/api/calendar/book-slot/${selectedSlot.id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          participants: parseInt(formData.participants),
          message: formData.message,
          selectedGame: selectedGame || ''
        });
        console.log('Slot booking response:', response.data);
      } else {
        // Traditional booking
        await axios.post(`${API}/api/bookings`, bookingData);
      }
      
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
      setSelectedSlot(null);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">{t('bookingSuccess')}</h2>
            <p className="text-gray-600 mb-6">{t('bookingSuccessMessage')}</p>
            
            <div className="space-y-3">
              <Link 
                to="/payment"
                className="block w-full bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
              >
                {t('payNowSecure')}
              </Link>
              
              <button 
                onClick={() => {setIsSuccess(false); setShowCalendar(true);}} 
                className="block w-full bg-gray-200 text-black px-6 py-2 rounded hover:bg-gray-300 transition-colors"
              >
                {t('bookAnother')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-32 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Simple Calendar Demo */}
        <SimpleCalendar 
          onSlotSelect={(slot) => {
            setFormData(prev => ({
              ...prev,
              service: slot.service,
              time: slot.time,
              date: selectedDate.toISOString().split('T')[0]
            }));
          }}
        />

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('bookingTitle')}</h1>
          {selectedGame && (
            <div className="inline-flex items-center bg-black text-white px-4 py-2 rounded-full mb-4">
              <span className="mr-2">🎮</span>
              <span className="font-medium">{t('bookingFor')}: {selectedGame}</span>
            </div>
          )}
          <p className="text-gray-600 max-w-2xl mx-auto">{t('bookingDescription')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Calendar Section */}
          {showCalendar && (
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-lg shadow-lg p-6">
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {demoSlots.map((slot, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        if (slot.status === 'available') {
                          setSelectedSlot(slot);
                          setFormData(prev => ({
                            ...prev,
                            service: slot.service,
                            time: slot.time,
                            date: selectedDate.toISOString().split('T')[0]
                          }));
                          setShowCalendar(false);
                        }
                      }}
                      className={`
                        p-3 rounded-lg border-2 transition-all cursor-pointer
                        ${slot.status === 'available' 
                          ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200 hover:scale-105' 
                          : 'bg-red-100 border-red-300 text-red-800 cursor-not-allowed'
                        }
                      `}
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
            </div>
          )}

          {/* Booking Form */}
          <div className={`order-1 lg:order-2 ${!showCalendar ? 'lg:col-span-2' : ''}`}>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedSlot ? '📅 Подтверждение бронирования' : '📝 Форма бронирования'}
                </h2>
                {selectedSlot && (
                  <button
                    onClick={() => {setShowCalendar(true); setSelectedSlot(null);}}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Изменить слот
                  </button>
                )}
              </div>

              {/* Selected Slot Display */}
              {selectedSlot && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">✅ Выбранное время:</h3>
                  <div className="text-sm text-green-700">
                    <p><strong>📅 Дата:</strong> {new Date(selectedSlot.date).toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><strong>⏰ Время:</strong> {selectedSlot.time}</p>
                    <p><strong>🎮 Услуга:</strong> {selectedSlot.service_type}</p>
                    <p><strong>⏱️ Длительность:</strong> {selectedSlot.service_type.includes('PlayStation') ? '1 час' : '30 минут'}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('fullName')}</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => handleChange(e.target)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder={t('enterName')}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('email')}</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleChange(e.target)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder={t('enterEmail')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('phone')}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange(e.target)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="+49 123 456789"
                  />
                </div>

                {/* Show service selection only if not using calendar */}
                {!selectedSlot && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectService')}</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={(e) => handleChange(e.target)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">{t('selectService')}</option>
                      <option value="KAT VR Gaming Session">{t('katVRService')} (30 {t('minutes')})</option>
                      <option value="PlayStation 5 VR Experience">{t('playstationService')} (1 {t('hour')})</option>
                      <option value="Group KAT VR Party">{t('groupService')} (30 {t('minutes')})</option>
                    </select>
                  </div>
                )}

                {/* Traditional date/time selection (only if not using calendar) */}
                {!selectedSlot && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('selectDate')}</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) => handleChange(e.target)}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">{t('selectTime')}</label>
                      
                      {/* Instructions */}
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {formData.name && formData.email && formData.phone && formData.service && formData.date
                            ? '🚀 Все данные заполнены! Нажмите на время для мгновенного бронирования.'
                            : '💡 Заполните все данные выше, затем нажмите на время для быстрого бронирования.'
                          }
                        </p>
                      </div>
                      {/* Time Slots Grid */}
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {availableTimeSlots.map(slot => {
                          const canQuickBook = formData.name && formData.email && formData.phone && formData.service && formData.date;
                          
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => handleTimeSlotClick(slot.time)}
                              className={`
                                px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105
                                ${slot.available 
                                  ? formData.time === slot.time
                                    ? 'bg-black text-white ring-2 ring-black' 
                                    : canQuickBook 
                                      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-2 border-blue-400 shadow-lg' 
                                      : 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                                  : 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300 opacity-50'
                                }
                              `}
                            >
                              <div className="text-center">
                                <div className="font-semibold">{slot.time}</div>
                                <div className="text-xs mt-1">
                                  {!slot.available 
                                    ? '❌ Занято' 
                                    : canQuickBook 
                                      ? '🚀 Забронировать!' 
                                      : '✅ Доступно'
                                  }
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('participants')}</label>
                  <select
                    name="participants"
                    value={formData.participants}
                    onChange={(e) => handleChange(e.target)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="1">1 {t('person')}</option>
                    <option value="2">2 {t('people')}</option>
                    <option value="3">3 {t('people')}</option>
                    <option value="4">4 {t('people')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('additionalMessage')}</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={(e) => handleChange(e.target)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder={t('enterMessage')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-3 px-6 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? t('submitting') : (selectedSlot ? '✅ Подтвердить бронирование' : t('bookSession'))}
                </button>
              </form>

              {/* Toggle Calendar View */}
              {!selectedSlot && (
                <div className="mt-6 text-center border-t pt-6">
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showCalendar ? '📝 Скрыть календарь' : '📅 Показать календарь'}
                  </button>
                </div>
              )}
            </div>
          </div>
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
      <section className="pt-32 py-16">
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
                    <a 
                      href="https://maps.google.com/?q=Stumpfebiel+4,+37073+Göttingen,+Germany" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-black transition-colors cursor-pointer"
                    >
                      <p className="hover:underline">Stumpfebiel 4<br />37073 Göttingen</p>
                    </a>
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

// Pricing Component
const Pricing = () => {
  const { t } = useLanguage();
  
  const pricingPackages = [
    {
      name: t('individualVR'),
      description: t('individualVRDesc'),
      price: t('individualVRPrice'),
      duration: t('individualVRDuration'),
      features: [
        t('vrHeadsets'),
        t('wideGameSelection'), 
        t('expertGuidance')
      ],
      popular: false,
      bookingUrl: '/booking?service=KAT+VR+Gaming+Session'
    },
    {
      name: t('groupVR'),
      description: t('groupVRDesc'),
      price: t('groupVRPrice'),
      duration: t('groupVRDuration'),
      subtext: t('perPerson'),
      features: [
        t('upToPlayers').replace('8', '4'),
        'Multiplayer games',
        'Group discounts'
      ],
      popular: true,
      bookingUrl: '/booking?service=Group+KAT+VR+Party'
    },
    {
      name: t('playstationSession'),
      description: t('playstationSessionDesc'),
      price: t('playstationPrice'),
      duration: t('playstationDuration'),
      features: [
        t('ps5Console'),
        t('latestGames'),
        t('comfortableSeating')
      ],
      popular: false,
      bookingUrl: '/booking?service=PlayStation+5+VR+Experience'
    },
    {
      name: t('vrPartyPackage'),
      description: t('vrPartyPackageDesc'),
      price: t('vrPartyPrice'),
      duration: t('vrPartyDuration'),
      features: [
        t('upToPlayers'),
        t('twoHourSessions'),
        t('refreshmentsIncluded')
      ],
      popular: false,
      bookingUrl: '/booking?service=Group+KAT+VR+Party'
    },
    {
      name: t('corporatePackage'),
      description: t('corporatePackageDesc'),
      price: t('corporatePrice'),
      duration: t('corporateDuration'),
      features: [
        t('customPackages'),
        t('professionalSetup'),
        t('cateringOptions')
      ],
      popular: false,
      bookingUrl: '/contact'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 hero-text">{t('pricingTitle')}</h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              {t('pricingDescription')}
            </p>
          </AnimatedSection>
          
          {/* Mobile: Single column, Desktop: Grid */}
          <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {pricingPackages.map((pkg, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 100}>
                <div className={`pricing-card hover-lift bg-white rounded-xl shadow-lg border-2 p-4 md:p-8 relative mobile-spacing ${
                  pkg.popular ? 'border-black ring-2 ring-black ring-opacity-20' : 'border-gray-200'
                }`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-black text-white px-3 md:px-4 py-1 md:py-2 rounded-full text-xs md:text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold mb-2 card-title">{pkg.name}</h3>
                    <p className="text-gray-600 mb-3 md:mb-4 text-sm md:text-base mobile-text">{pkg.description}</p>
                    <div className="mb-2">
                      <span className="text-3xl md:text-4xl font-bold">{pkg.price}</span>
                      {pkg.subtext && <span className="text-gray-500 ml-2 text-sm md:text-base">{pkg.subtext}</span>}
                    </div>
                    <p className="text-gray-500 text-sm md:text-base">{pkg.duration}</p>
                  </div>
                  
                  <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                    {pkg.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm md:text-base">
                        <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 mr-2 md:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="mobile-text">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-3">
                    <Link
                      to={pkg.bookingUrl}
                      className={`touch-target block w-full text-center py-3 md:py-4 px-4 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base ${
                        pkg.popular
                          ? 'bg-black text-white hover:bg-gray-800 shadow-lg hover:shadow-xl'
                          : 'bg-gray-100 text-black hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      {pkg.bookingUrl === '/contact' ? t('contactForDetails') : t('bookThisPackage')}
                    </Link>
                    
                    {pkg.bookingUrl !== '/contact' && (
                      <Link
                        to="/payment"
                        className="block w-full text-center py-2 md:py-3 px-4 rounded-lg font-semibold transition-all duration-300 text-sm md:text-base border-2 border-black text-black hover:bg-black hover:text-white"
                      >
                        💳 Pay Online Now
                      </Link>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection animation="fadeInUp" className="text-center mt-8 md:mt-16">
            <div className="bg-gray-50 rounded-xl p-4 md:p-8 mobile-spacing">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 section-title">Special Offers</h3>
              <div className="grid md:grid-cols-2 gap-4 md:gap-6 mobile-gap">
                <div className="text-center p-3 md:p-0">
                  <h4 className="font-semibold mb-2 text-sm md:text-base">Weekend Special</h4>
                  <p className="text-gray-600 text-xs md:text-base mobile-text">Book 2 sessions, get 20% off the second one!</p>
                </div>
                <div className="text-center p-3 md:p-0">
                  <h4 className="font-semibold mb-2 text-sm md:text-base">Student Discount</h4>
                  <p className="text-gray-600 text-xs md:text-base mobile-text">Show your student ID and get 15% off any session.</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

// Payment Component
const Payment = () => {
  const { t } = useLanguage();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchPackages();
  }, []);
  
  const fetchPackages = async () => {
    try {
      const response = await axios.get(`${API}/packages`);
      setPackages(response.data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load payment packages');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePayment = async (packageId) => {
    try {
      setLoading(true);
      setError("");
      
      const originUrl = window.location.origin;
      
      const response = await axios.post(`${API}/payments/create-session`, {
        package_id: packageId,
        origin_url: originUrl,
        booking_data: {
          // You can add booking-related data here if needed
        }
      });
      
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
      
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initialize payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-xl">{t('loading')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 py-16">
        <div className="container mx-auto px-4">
          <AnimatedSection animation="fadeInUp" className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 hero-text">Payment & Booking</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your VR experience package and complete your booking with secure online payment.
            </p>
          </AnimatedSection>
          
          {error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {packages.map((pkg, index) => (
              <AnimatedSection key={pkg.id} animation="fadeInUp" delay={index * 100}>
                <div className="pricing-card hover-lift bg-white rounded-xl shadow-lg border-2 border-gray-200 p-8 relative">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2 card-title">{pkg.name}</h3>
                    <p className="text-gray-600 mb-4">{pkg.description}</p>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">€{pkg.price}</span>
                    </div>
                    <p className="text-gray-500">{pkg.duration_minutes} minutes</p>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Professional VR Equipment</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Expert Guidance & Support</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Latest VR Games & Experiences</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Secure Online Payment</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handlePayment(pkg.id)}
                    disabled={loading}
                    className="block w-full text-center py-4 px-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : `Pay €${pkg.price} - Book Now`}
                  </button>
                </div>
              </AnimatedSection>
            ))}
          </div>
          
          <AnimatedSection animation="fadeInUp" className="text-center mt-16">
            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Secure Payment</h3>
              <p className="text-gray-600 mb-6">
                Your payment is processed securely through Stripe. We accept all major credit cards and payment methods.
              </p>
              <div className="flex justify-center items-center space-x-6">
                <svg className="h-8 w-12" viewBox="0 0 24 24" fill="#1a1a1a">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-.635 4.005c-.026.163-.144.295-.32.295z"/>
                  <path d="M23.048 7.272c-.028.4-.057.8-.091 1.179-.968 4.78-4.05 6.403-7.885 6.403h-1.97c-.615 0-1.108.429-1.204 1.029L10.78 20.36c-.059.370-.03.724.21.977.24.253.616.388 1.066.388h4.45c.524 0 .968-.382 1.05-.9l.635-4.005c.026-.163.144-.295.32-.295z" fill="#164c7a"/>
                </svg>
                <span className="text-xl font-bold">Stripe</span>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

// Payment Success Component  
const PaymentSuccess = () => {
  const { t } = useLanguage();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      pollPaymentStatus(sessionId);
    } else {
      setLoading(false);
    }
  }, []);
  
  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds
    
    if (attempts >= maxAttempts) {
      setPaymentStatus({
        status: 'timeout',
        message: 'Payment verification timed out. Please check your email for confirmation or contact us.'
      });
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.get(`${API}/payments/status/${sessionId}`);
      const data = response.data;
      
      if (data.payment_status === 'paid') {
        setPaymentStatus({
          status: 'success',
          message: 'Payment successful! Your VR session has been booked.',
          amount: data.amount_total,
          currency: data.currency,
          sessionId: sessionId
        });
        setLoading(false);
        return;
      } else if (data.status === 'expired') {
        setPaymentStatus({
          status: 'expired',
          message: 'Payment session expired. Please try booking again.'
        });
        setLoading(false);
        return;
      }
      
      // Continue polling if payment is still pending
      setPollCount(attempts + 1);
      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), pollInterval);
      
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus({
        status: 'error',
        message: 'Error verifying payment. Please contact us if you were charged.'
      });
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-xl">Verifying your payment...</p>
          <p className="text-gray-600">Please wait, this may take a moment.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-32 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {paymentStatus?.status === 'success' && (
              <AnimatedSection animation="fadeInUp">
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 mb-8">
                  <svg className="mx-auto h-16 w-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h1 className="text-3xl font-bold text-green-800 mb-4">Payment Successful!</h1>
                  <p className="text-green-700 mb-4">{paymentStatus.message}</p>
                  <div className="bg-white rounded-lg p-4 inline-block">
                    <p className="text-sm text-gray-600">Amount Paid:</p>
                    <p className="text-2xl font-bold text-green-800">
                      €{paymentStatus.amount} {paymentStatus.currency}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/booking')}
                    className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors mr-4"
                  >
                    Book Another Session
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="bg-gray-200 text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </AnimatedSection>
            )}
            
            {paymentStatus?.status === 'expired' && (
              <AnimatedSection animation="fadeInUp">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 mb-8">
                  <svg className="mx-auto h-16 w-16 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h1 className="text-3xl font-bold text-yellow-800 mb-4">Payment Expired</h1>
                  <p className="text-yellow-700 mb-4">{paymentStatus.message}</p>
                </div>
                
                <button
                  onClick={() => navigate('/payment')}
                  className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </AnimatedSection>
            )}
            
            {(paymentStatus?.status === 'error' || paymentStatus?.status === 'timeout') && (
              <AnimatedSection animation="fadeInUp">
                <div className="bg-red-50 border border-red-200 rounded-xl p-8 mb-8">
                  <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h1 className="text-3xl font-bold text-red-800 mb-4">Payment Verification Issue</h1>
                  <p className="text-red-700 mb-4">{paymentStatus.message}</p>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/contact')}
                    className="bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors mr-4"
                  >
                    Contact Support
                  </button>
                  <button
                    onClick={() => navigate('/payment')}
                    className="bg-gray-200 text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </AnimatedSection>
            )}
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
                  <a 
                    href="https://maps.google.com/?q=Stumpfebiel+4,+37073+Göttingen,+Germany" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <p className="hover:underline">Stumpfebiel 4</p>
                    <p className="hover:underline">37073 Göttingen</p>
                  </a>
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
                <Link 
                  to="/booking" 
                  className="block text-gray-300 hover:text-white transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {t('bookNow')}
                </Link>
                <Link 
                  to="/games" 
                  className="block text-gray-300 hover:text-white transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  {t('games')}
                </Link>
                <Link 
                  to="/services" 
                  className="block text-gray-300 hover:text-white transition-colors"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
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
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/booking" element={<Booking />} />
            {/* Payment routes temporarily disabled for Railway deployment */}
            {/* <Route path="/payment" element={<Payment />} /> */}
            {/* <Route path="/payment-success" element={<PaymentSuccess />} /> */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/test-admin" element={<TestAdmin />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </LanguageProvider>
    </div>
  );
}

// Language Selector Component that shows modal when needed
const LanguageSelector = () => {
  const { showLanguageModal } = useLanguage();
  
  if (!showLanguageModal) return null;
  
  return <LanguageSelectionModal />;
};

export default App;