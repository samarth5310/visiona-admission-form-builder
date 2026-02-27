import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Trophy, MapPin, Phone, Mail, AlertCircle, Globe, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const Landing = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'kn'>('kn');
  const [themeColor, setThemeColor] = useState<'blue' | 'green'>('blue');

  useEffect(() => {
    // Randomly select theme color on mount
    const randomTheme = Math.random() > 0.5 ? 'blue' : 'green';
    setThemeColor(randomTheme);
  }, []);

  const translations = {
    en: {
      alert: "🚨",
      alertText: "Vacation Admissions Open for 2026! 🚨 ✨ Vision Coaching Center Talent Exam – 2026 Register Now! ✨",
      title: "VISIONA EDUCATION ACADEMY",
      subtitle: "Excellence in Competitive Exam Preparation",
      heroTitle: "Nurturing Future Leaders",
      heroSubtitle: "Specialized coaching for 3rd-5th standard competitive exams including Navodaya, Sainik, Morarji, Kittur, RMS, and Alvas entrance tests.",
      registerNow: "Register Now",
      vacationAdmissionTitle: "Admissions for Vacation 2026 Open",
      vacationRegisterNow: "Register Now!",
      expertCoaching: "Expert Coaching",
      expertCoachingDesc: "Comprehensive preparation with experienced faculty and proven teaching methodologies.",
      smallBatch: "Small Batch Size",
      smallBatchDesc: "Personalized attention with limited students per batch ensuring quality education.",
      provenResults: "Proven Results",
      provenResultsDesc: "Track record of successful admissions in prestigious schools and institutions.",
      visitAcademy: "Visit Our Academy",
      address: "Address",
      contact: "Contact",
      email: "Email",
      viewOnMap: "View on Google Maps",
      adminLogin: "Admin Login",
      studentLogin: "Student Login"
    },
    kn: {
      alert: "🚨",
      alertText: "2026ನೇ ಸಾಲಿನ ರಜೆ ತರಗತಿಗಳಿಗೆ ಪ್ರವೇಶಾತಿ ಪ್ರಾರಂಭವಾಗಿದೆ! 🚨 ✨ ವಿಜನ್ ಕೋಚಿಂಗ್ ಸೆಂಟರ್ ಟ್ಯಾಲೆಂಟ್ ಪರೀಕ್ಷೆ – 2026 ಈಗಲೇ ನೋಂದಾಯಿಸಿ! ✨",
      title: "ವಿಶನ್ ಎಜುಕೇಶನ್ ಅಕಾಡೆಮಿ",
      subtitle: "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷಾ ತಯಾರಿಯಲ್ಲಿ ಶ್ರೇಷ್ಠತೆ",
      heroTitle: "ಭವಿಷ್ಯದ ನಾಯಕರನ್ನು ಬೆಳೆಸುವುದು",
      heroSubtitle: "ನವೋದಯ, ಸೈನಿಕ್, ಮೊರಾರ್ಜಿ, ಕಿತ್ತೂರು, RMS, ಮತ್ತು ಅಲ್ವಾಸ್ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಗಳು ಸೇರಿದಂತೆ 3-5 ನೇ ತರಗತಿ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಿಗೆ ವಿಶೇಷ ತರಬೇತಿ.",
      registerNow: "ಈಗ ನೋಂದಾಯಿಸಿ",
      vacationAdmissionTitle: "ಬೇಸಿಗೆ ರಜೆ ತರಬೇತಿ -2026\nಪ್ರವೇಶಗಳು ಪ್ರಾರಂಭ",
      vacationRegisterNow: "ಈಗಲೇ ನೋಂದಾಯಿಸಿ!",
      expertCoaching: "ಪರಿಣಿತ ತರಬೇತಿ",
      expertCoachingDesc: "ಅನುಭವಿ ಅಧ್ಯಾಪಕರು ಮತ್ತು ಸಾಬೀತಾದ ಬೋಧನಾ ವಿಧಾನಗಳೊಂದಿಗೆ ಸಮಗ್ರ ತಯಾರಿ.",
      smallBatch: "ಸಣ್ಣ ಬ್ಯಾಚ್ ಗಾತ್ರ",
      smallBatchDesc: "ಗುಣಮಟ್ಟದ ಶಿಕ್ಷಣವನ್ನು ಖಚಿತಪಡಿಸುವ ಬ್ಯಾಚ್‌ಗೆ ಸೀಮಿತ ವಿದ್ಯಾರ್ಥಿಗಳೊಂದಿಗೆ ವೈಯಕ್ತಿಕ ಗಮನ.",
      provenResults: "ಸಾಬೀತಾದ ಫಲಿತಾಂಶಗಳು",
      provenResultsDesc: "ಪ್ರತಿಷ್ಠಿತ ಶಾಲೆಗಳು ಮತ್ತು ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಯಶಸ್ವಿ ಪ್ರವೇಶಗಳ ದಾಖಲೆ.",
      visitAcademy: "ನಮ್ಮ ಅಕಾಡೆಮಿಗೆ ಭೇಟಿ ನೀಡಿ",
      address: "ವಿಳಾಸ",
      contact: "ಸಂಪರ್ಕ",
      email: "ಇಮೇಲ್",
      viewOnMap: "ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ",
      adminLogin: "ನಿರ್ವಾಹಕ ಲಾಗಿನ್",
      studentLogin: "ವಿದ್ಯಾರ್ಥಿ ಲಾಗಿನ್"
    }
  };

  const t = translations[language];

  // Dynamic classes based on theme
  const themeClasses = {
    text: themeColor === 'blue' ? 'text-blue-500' : 'text-green-500',
    textHover: themeColor === 'blue' ? 'hover:text-blue-400' : 'hover:text-green-400',
    bg: themeColor === 'blue' ? 'bg-blue-600' : 'bg-green-600',
    bgHover: themeColor === 'blue' ? 'hover:bg-blue-500' : 'hover:bg-green-500',
    border: themeColor === 'blue' ? 'border-blue-500' : 'border-green-500',
    gradientFrom: themeColor === 'blue' ? 'from-blue-600' : 'from-green-600',
    gradientTo: themeColor === 'blue' ? 'to-cyan-600' : 'to-emerald-600',
    gradientTextFrom: themeColor === 'blue' ? 'from-blue-400' : 'from-green-400',
    gradientTextTo: themeColor === 'blue' ? 'to-cyan-400' : 'to-emerald-400',
    shadow: themeColor === 'blue' ? 'shadow-[0_0_15px_-3px_rgba(37,99,235,0.4)]' : 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]',
    alertBg: themeColor === 'blue' ? 'bg-blue-900/30' : 'bg-green-900/30',
    alertBorder: themeColor === 'blue' ? 'border-blue-800/50' : 'border-green-800/50',
    alertText: themeColor === 'blue' ? 'text-blue-200' : 'text-green-200',
    alertIcon: themeColor === 'blue' ? 'text-blue-400' : 'text-green-400',
    glow1: themeColor === 'blue' ? 'bg-blue-600/20' : 'bg-green-600/20',
    glow2: themeColor === 'blue' ? 'bg-cyan-500/10' : 'bg-emerald-500/10',
    selection: themeColor === 'blue' ? 'selection:bg-blue-500/30' : 'selection:bg-green-500/30',
  };

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/FGqFsReGQ2KLdiKPA', '_blank');
  };

  const handleRegistrationClick = () => {
    window.open('https://docs.google.com/forms/d/e/1FAIpQLSefz-O35rbTmnlsXO_NIR-DAmcUBNybSwwqZYx2zND36Uq6Vw/viewform', '_blank');
  };

  const handleWhatsAppClick = (phoneNumber: string) => {
    window.open(`https://wa.me/91${phoneNumber}`, '_blank');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'kn' : 'en');
  };

  const slideshowImages = [
    "/lovable-uploads/a5e775c0-2c26-43b1-8921-be177ed88016.png",
    "/lovable-uploads/9335fc94-811f-47f9-8f36-45eceb0bc7e7.png",
    "/lovable-uploads/105cad00-0e0a-4155-b8b7-2bb9e04c81c7.png",
    "/lovable-uploads/3003146b-96f4-4648-bab3-a8c0203219c6.png"
  ];

  const examBadges = [
    { name: 'Navodaya', color: 'blue' },
    { name: 'Sainik', color: 'indigo' },
    { name: 'Morarji', color: 'purple' },
    { name: 'Kittur', color: 'pink' },
    { name: 'RMS', color: 'rose' },
    { name: 'Alvas', color: 'cyan' }
  ];

  return (
    <div className={`min-h-screen bg-[#020617] text-white overflow-x-hidden font-sans ${themeClasses.selection}`}>
      {/* Alert Banner */}
      <div className={`${themeClasses.alertBg} border-b ${themeClasses.alertBorder} backdrop-blur-sm overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 py-2 relative">
          <div className={`flex items-center whitespace-nowrap animate-marquee hover:pause text-sm ${themeClasses.alertText}`}>
            <span className="inline-flex items-center mr-8">
              <AlertCircle className={`w-4 h-4 mr-2 ${themeClasses.alertIcon}`} />
              <span className="font-medium mr-2">{t.alert}</span>
              <span>{t.alertText}</span>
            </span>
            {/* Duplicate for seamless feel */}
            <span className="inline-flex items-center mr-8">
              <AlertCircle className={`w-4 h-4 mr-2 ${themeClasses.alertIcon}`} />
              <span className="font-medium mr-2">{t.alert}</span>
              <span>{t.alertText}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r ${themeClasses.gradientFrom} ${themeClasses.gradientTo} rounded-full blur opacity-25 group-hover:opacity-75 transition duration-200`}></div>
                <img
                  src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png"
                  alt="Logo"
                  className="relative w-10 h-10 object-contain"
                />
              </div>
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">
                Visiona <span className={themeClasses.text}>Education Academy</span>
              </span>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="text-gray-400 hover:text-white hover:bg-white/5"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className={`absolute top-[-20%] left-[20%] w-[500px] h-[500px] ${themeClasses.glow1} rounded-full blur-[100px] mix-blend-screen`}></div>
          <div className={`absolute top-[10%] right-[20%] w-[400px] h-[400px] ${themeClasses.glow2} rounded-full blur-[100px] mix-blend-screen`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${themeClasses.alertBg} border ${themeClasses.alertBorder} ${themeClasses.alertText} text-sm font-medium mb-8`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${themeClasses.bg} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${themeClasses.bg}`}></span>
            </span>
            Admissions Open for Vacation 2026
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-tight uppercase whitespace-pre-line">
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${themeClasses.gradientTextFrom} ${themeClasses.gradientTextTo} drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]`}>
              {t.vacationAdmissionTitle}
            </span>
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl mt-2 inline-block">
              {t.vacationRegisterNow}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-6 mb-16">
            {/* Terminal-style Info Box */}
            <div className="max-w-3xl w-full mt-8">
              <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border-2 border-gray-700 shadow-2xl font-mono">
                {/* Terminal Header */}
                <div className="bg-[#323233] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-gray-400 text-sm ml-2">talent-exam-2026.sh</span>
                </div>
                {/* Terminal Content */}
                <div className="p-6 text-left space-y-4 text-gray-300 text-sm md:text-base leading-relaxed">
                  <div className="text-green-400 font-bold text-lg mb-4">$ ವಿಜನ್ ಕೋಚಿಂಗ್ ಸೆಂಟರ್ ಟ್ಯಾಲೆಂಟ್ ಪರೀಕ್ಷೆ – 2026</div>
                  
                  <p className="text-gray-200">
                    <span className="text-yellow-400">👆🏻</span> <span className="font-semibold text-white">ಆತ್ಮೀಯ ಪಾಲಕರೇ,</span>
                  </p>
                  
                  <p>
                    ನಿಮ್ಮ ಮಗುವಿನ ಪ್ರತಿಭೆ ಗುರುತಿಸಿ, ಸರಿಯಾದ ಮಾರ್ಗದರ್ಶನದ ಮೂಲಕ ಉಜ್ವಲ ಭವಿಷ್ಯ ನಿರ್ಮಿಸುವುದು ನಮ್ಮ ಹೊಣೆ.
                    ಈ ಉದ್ದೇಶದಿಂದ ವಿಷನ್ ಕೋಚಿಂಗ್ ಸೆಂಟರ್ ವಿದ್ಯಾಗಿರಿ ಬಾಗಲಕೋಟ ಅವರಿಂದ ಈ ವರ್ಷ <span className="text-cyan-400 font-semibold">3ನೇ, 4ನೇ ಮತ್ತು 5ನೇ ತರಗತಿ</span> ಓದುತ್ತಿರುವ ಮಕ್ಕಳಿಗೆ ವಿಶೇಷ ರಿಯಾಯಿತಿಯೊಂದಿಗೆ ತರಗತಿಗಳ ದಾಖಲಾತಿಗಳು ಪ್ರಾರಂಭವಾಗಿವೆ.
                  </p>
                  
                  <p className="text-orange-300 font-semibold">
                    ಮಾರ್ಚ್ 10 ರಿಂದ 22 ರ ವರೆಗೆ ಪ್ರತಿದಿನ ದಿನ ಟ್ಯಾಲೆಂಟ್ ಪರೀಕ್ಷೆ ಮತ್ತು ನಿಮ್ಮ ಮಗುವಿನ ಸಾಮರ್ಥ್ಯವನ್ನು ಗುರುತಿಸುವ ಮಹತ್ವದ ಅವಕಾಶ.
                  </p>
                  
                  <p>
                    ಈ ಅವಕಾಶವನ್ನು ತಪ್ಪಿಸಿಕೊಳ್ಳದೆ, ದಯವಿಟ್ಟು ಮೇಲಿನ ಲಿಂಕ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಈಗಲೇ ಆನ್‌ಲೈನ್ ಮೂಲಕ ನೋಂದಣಿ ಮಾಡಿಕೊಳ್ಳಿ.
                  </p>
                  
                  <div className="bg-[#2d2d2d] p-4 rounded border border-gray-600 mt-4">
                    <p className="text-green-400 font-bold text-lg">💰 ಪರೀಕ್ಷಾ ಶುಲ್ಕ: <span className="text-yellow-300">₹ 99</span></p>
                  </div>
                  
                  <p className="text-cyan-300">
                    <span className="font-bold">👉</span> ಪರೀಕ್ಷಾ ಶುಲ್ಕವನ್ನು QR Scanner / Pay ಮೂಲಕ ಸುಲಭವಾಗಿ ಪಾವತಿಸಬಹುದು. ಪಾವತಿಸಿದ ಪಾಲಕರು ಕೆಳಗಡೆ ಹೆಸರು ತರಗತಿ ಕಳುಹಿಸಬೇಕು
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-gray-600">
                    <p className="text-blue-400 font-semibold mb-2">📞 ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ಸಂಪರ್ಕಿಸಿ:</p>
                    <div className="flex flex-col gap-2 text-green-300 font-mono">
                      <button 
                        onClick={() => handleWhatsAppClick('7349420496')}
                        className="text-left hover:text-green-200 transition-colors"
                      >
                        → 7349420496
                      </button>
                      <button 
                        onClick={() => handleWhatsAppClick('8147836151')}
                        className="text-left hover:text-green-200 transition-colors"
                      >
                        → 8147836151
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleRegistrationClick}
              className={`h-16 px-12 rounded-full ${themeClasses.bg} ${themeClasses.bgHover} text-white text-xl font-bold shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] border-2 ${themeClasses.border} transition-all hover:scale-110 animate-pulse`}
            >
              {t.registerNow}
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>

          </div>

          {/* Hero Visual / Dashboard Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className={`absolute -inset-1 bg-gradient-to-r ${themeClasses.gradientFrom} ${themeClasses.gradientTo} rounded-2xl blur opacity-20`}></div>
            <div className="relative bg-[#0B1121] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="mx-auto text-xs text-gray-500 font-mono">visiona-academy.com</div>
              </div>
              <div className="p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Start Your Journey Today</h3>
                    <p className="text-gray-400">Scan QR codes to register instantly or find our location.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examBadges.map((badge, i) => (
                      <span key={i} className={`px-3 py-1 rounded-full ${themeClasses.alertBg} border ${themeClasses.alertBorder} ${themeClasses.alertText} text-xs font-medium`}>
                        {badge.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-6">
                  {/* Registration QR Code */}
                  <div className="text-center">
                    <button
                      onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSefz-O35rbTmnlsXO_NIR-DAmcUBNybSwwqZYx2zND36Uq6Vw/viewform', '_blank')}
                      className="p-4 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                    >
                      <img
                        src="/lovable-uploads/qr-registration.png.png"
                        alt="Registration QR Code"
                        className="w-40 h-40 object-contain group-hover:opacity-80 transition-opacity"
                      />
                    </button>
                    <p className="text-white text-sm font-semibold mt-3">Register Now</p>
                  </div>
                  
                  {/* Location QR Code */}
                  <div className="text-center">
                    <button
                      onClick={() => window.open('https://maps.app.goo.gl/HcEsFXUeAfQ1y8Sd6', '_blank')}
                      className="p-4 bg-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
                    >
                      <img
                        src="/lovable-uploads/qr-location.png.png"
                        alt="Location QR Code"
                        className="w-40 h-40 object-contain group-hover:opacity-80 transition-opacity"
                      />
                    </button>
                    <p className="text-white text-sm font-semibold mt-3">Find Our Location</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By / Badges Strip */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500 mb-6 uppercase tracking-wider font-medium">Specialized Coaching For</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {examBadges.map((exam, index) => (
              <div key={index} className="flex items-center gap-2 group cursor-default">
                <CheckCircle2 className={`w-5 h-5 ${themeClasses.text} ${themeClasses.textHover} transition-colors`} />
                <span className="text-lg font-semibold text-gray-300 group-hover:text-white transition-colors">{exam.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why Choose Visiona?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">We provide the best environment for your child's growth and success in competitive exams.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: t.expertCoaching, desc: t.expertCoachingDesc },
              { icon: Users, title: t.smallBatch, desc: t.smallBatchDesc },
              { icon: Trophy, title: t.provenResults, desc: t.provenResultsDesc }
            ].map((feature, i) => (
              <div key={i} className={`group p-6 rounded-2xl bg-white/5 border border-white/10 hover:${themeClasses.border}/50 hover:${themeClasses.alertBg} transition-all duration-300`}>
                <div className={`w-12 h-12 rounded-lg ${themeClasses.alertBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${themeClasses.alertIcon}`} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories / Slideshow */}
      <section className={`py-24 bg-gradient-to-b from-[#020617] ${themeColor === 'blue' ? 'to-blue-950/20' : 'to-green-950/20'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Success Stories</h2>
              <p className="text-gray-400">Celebrating the achievements of our brilliant students.</p>
            </div>
            <Button variant="outline" className={`border-${themeColor}-500/30 ${themeClasses.text} ${themeClasses.textHover} hover:${themeClasses.alertBg}`}>
              View All Results
            </Button>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="flex gap-6 animate-scroll hover:pause">
              {[...slideshowImages, ...slideshowImages].map((img, i) => (
                <div key={i} className="flex-shrink-0 w-64 aspect-[4/3] rounded-xl overflow-hidden border border-white/10 group relative">
                  <img
                    src={img}
                    alt="Student Success"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white font-medium text-sm">Visiona Achiever</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Footer */}
      <footer className="border-t border-white/10 bg-[#020617] pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png"
                  alt="Logo"
                  className="w-12 h-12 object-contain"
                />
                <span className="font-bold text-2xl text-white">
                  Visiona <span className={themeClasses.text}>Education</span>
                </span>
              </div>
              <p className="text-gray-400 max-w-md mb-8">
                Empowering students to achieve their dreams through quality education and dedicated mentorship. Join us to build a strong foundation for the future.
              </p>
              <div className="flex gap-4">
                <Button size="icon" variant="ghost" className={`rounded-full hover:${themeClasses.alertBg} ${themeClasses.textHover}`}>
                  <Globe className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="ghost" className={`rounded-full hover:${themeClasses.alertBg} ${themeClasses.textHover}`}>
                  <Mail className="w-5 h-5" />
                </Button>
                <Button size="icon" variant="ghost" className={`rounded-full hover:${themeClasses.alertBg} ${themeClasses.textHover}`}>
                  <Phone className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Contact Us</h4>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin className={`w-5 h-5 ${themeClasses.text} shrink-0 mt-0.5`} />
                  <span>16th Cross Vidyagiri<br />Bagalkot, Karnataka</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className={`w-5 h-5 ${themeClasses.text} shrink-0`} />
                  <span>+91 73494 20496</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className={`w-5 h-5 ${themeClasses.text} shrink-0`} />
                  <span>visionaedu16@gmail.com</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => navigate('/student-login')} className={`${themeClasses.textHover} transition-colors`}>Student Login</button></li>
                <li><button onClick={() => navigate('/login')} className={`${themeClasses.textHover} transition-colors`}>Admin Login</button></li>
                <li><button onClick={handleRegistrationClick} className={`${themeClasses.textHover} transition-colors`}>Register Now</button></li>
                <li><button onClick={handleMapClick} className={`${themeClasses.textHover} transition-colors`}>Find on Map</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © 2025 Visiona Education Academy. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="hover:text-white transition-colors">Privacy Policy</button>
                </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-2xl bg-[#0B1121] text-white border-gray-800">
                  <DialogHeader>
                    <DialogTitle className={`text-xl font-bold ${themeClasses.text}`}>Privacy Policy</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Last updated: March 2026
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] mt-4 pr-4">
                    <div className="space-y-4 text-sm text-gray-300">
                      <section>
                        <h3 className="text-white font-semibold mb-2">1. Information We Collect</h3>
                        <p>We collect information that you provide directly to us, including:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Name and contact information (phone number, email address)</li>
                          <li>Student details (name, grade, school)</li>
                          <li>Payment information for fee processing</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">2. How We Use Your Information</h3>
                        <p>We use the information we collect to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>Process admissions and enrollments</li>
                          <li>Communicate with you about classes, exams, and events</li>
                          <li>Provide educational services and track student progress</li>
                          <li>Improve our services and educational offerings</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">3. Data Protection</h3>
                        <p>We implement appropriate technical and organizational measures to maintain the safety of your personal information. Your data is stored securely and is only accessible to authorized personnel.</p>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">4. Information Sharing</h3>
                        <p>We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website or conducting our business, so long as those parties agree to keep this information confidential.</p>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">5. Contact Us</h3>
                        <p>If you have any questions about this Privacy Policy, please contact us at visionaedu16@gmail.com.</p>
                      </section>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <button className="hover:text-white transition-colors">Terms of Service</button>
                </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-2xl bg-[#0B1121] text-white border-gray-800">
                  <DialogHeader>
                    <DialogTitle className={`text-xl font-bold ${themeClasses.text}`}>Terms of Service</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Please read these terms carefully before using our services.
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-[60vh] mt-4 pr-4">
                    <div className="space-y-4 text-sm text-gray-300">
                      <section>
                        <h3 className="text-white font-semibold mb-2">1. Acceptance of Terms</h3>
                        <p>By accessing or using the services provided by Visiona Education Academy, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our services.</p>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">2. Admission and Enrollment</h3>
                        <p>Admission is subject to availability and meeting the eligibility criteria. The academy reserves the right to refuse admission to any student at its discretion.</p>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">3. Fees and Payments</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li>All fees must be paid by the specified due dates.</li>
                          <li>Fees once paid are generally non-refundable, subject to our specific refund policy.</li>
                          <li>Late payment may attract additional charges or suspension of services.</li>
                        </ul>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">4. Student Conduct</h3>
                        <p>Students are expected to maintain discipline and respect towards faculty and fellow students. Any form of misconduct may lead to disciplinary action, including expulsion.</p>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">5. Intellectual Property</h3>
                        <p>All study materials, content, and resources provided by the academy are the intellectual property of Visiona Education Academy and are for personal use only. Redistribution is strictly prohibited.</p>
                      </section>

                      <section>
                        <h3 className="text-white font-semibold mb-2">6. Limitation of Liability</h3>
                        <p>While we strive for excellence, Visiona Education Academy cannot guarantee specific exam results, as student performance depends on various factors including individual effort.</p>
                      </section>
                    </div>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
