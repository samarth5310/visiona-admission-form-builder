
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Trophy, MapPin, Phone, Mail, AlertCircle, Globe } from 'lucide-react';
import TestimonialsCarousel from '@/components/TestimonialsCarousel';

const Landing = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

  const translations = {
    en: {
      alert: "ALERT:",
      alertText: "नवोदय परीक्षा-2026 | Navodaya Exam 2026 Registration | Online Application Last Date: 29 July 2025 | Exam Date: 13 December 2025 | Contact: 7349420496 | Register at VISIONA EDUCATION ACADEMY",
      title: "VISIONA EDUCATION ACADEMY",
      subtitle: "Excellence in Competitive Exam Preparation",
      heroTitle: "Nurturing Future Leaders",
      heroSubtitle: "Specialized coaching for 3rd-5th standard competitive exams including Navodaya, Sainik, Morarji, Kittur, RMS, and Alvas entrance tests.",
      expertCoaching: "Expert Coaching",
      expertCoachingDesc: "Comprehensive preparation with experienced faculty and proven teaching methodologies.",
      smallBatch: "Small Batch Size",
      smallBatchDesc: "Personalized attention with limited students per batch ensuring quality education.",
      provenResults: "Proven Results",
      provenResultsDesc: "Track record of successful admissions in prestigious schools and institutions.",
      stateWideReach: "State-wide Reach",
      stateWideReachDesc: "Students from 25+ towns across Karnataka trust us for their success.",
      visitAcademy: "Visit Our Academy",
      address: "Address",
      contact: "Contact",
      email: "Email",
      viewOnMap: "View on Google Maps",
      adminLogin: "Admin Login"
    },
    kn: {
      alert: "ಎಚ್ಚರಿಕೆ:",
      alertText: "ನವೋದಯ ಪರೀಕ್ಷೆ-2026 | Navodaya Exam 2026 ನೋಂದಣಿ | ಆನ್‌ಲೈನ್ ಅರ್ಜಿ ಕೊನೆಯ ದಿನಾಂಕ: 29 ಜುಲೈ 2025 | ಪರೀಕ್ಷಾ ದಿನಾಂಕ: 13 ಡಿಸೆಂಬರ್ 2025 | ಸಂಪರ್ಕ: 7349420496 | ವಿಶನ್ ಎಜುಕೇಶನ್ ಅಕಾಡೆಮಿಯಲ್ಲಿ ನೋಂದಾಯಿಸಿ",
      title: "ವಿಶನ್ ಎಜುಕೇಶನ್ ಅಕಾಡೆಮಿ",
      subtitle: "ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷಾ ತಯಾರಿಯಲ್ಲಿ ಶ್ರೇಷ್ಠತೆ",
      heroTitle: "ಭವಿಷ್ಯದ ನಾಯಕರನ್ನು ಬೆಳೆಸುವುದು",
      heroSubtitle: "ನವೋದಯ, ಸೈನಿಕ್, ಮೊರಾರ್ಜಿ, ಕಿತ್ತೂರು, RMS, ಮತ್ತು ಅಲ್ವಾಸ್ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಗಳು ಸೇರಿದಂತೆ 3-5 ನೇ ತರಗತಿ ಸ್ಪರ್ಧಾತ್ಮಕ ಪರೀಕ್ಷೆಗಳಿಗೆ ವಿಶೇಷ ತರಬೇತಿ.",
      expertCoaching: "ಪರಿಣಿತ ತರಬೇತಿ",
      expertCoachingDesc: "ಅನುಭವಿ ಅಧ್ಯಾಪಕರು ಮತ್ತು ಸಾಬೀತಾದ ಬೋಧನಾ ವಿಧಾನಗಳೊಂದಿಗೆ ಸಮಗ್ರ ತಯಾರಿ.",
      smallBatch: "ಸಣ್ಣ ಬ್ಯಾಚ್ ಗಾತ್ರ",
      smallBatchDesc: "ಗುಣಮಟ್ಟದ ಶಿಕ್ಷಣವನ್ನು ಖಚಿತಪಡಿಸುವ ಬ್ಯಾಚ್‌ಗೆ ಸೀಮಿತ ವಿದ್ಯಾರ್ಥಿಗಳೊಂದಿಗೆ ವೈಯಕ್ತಿಕ ಗಮನ.",
      provenResults: "ಸಾಬೀತಾದ ಫಲಿತಾಂಶಗಳು",
      provenResultsDesc: "ಪ್ರತಿಷ್ಠಿತ ಶಾಲೆಗಳು ಮತ್ತು ಸಂಸ್ಥೆಗಳಲ್ಲಿ ಯಶಸ್ವಿ ಪ್ರವೇಶಗಳ ದಾಖಲೆ.",
      stateWideReach: "ರಾಜ್ಯವ್ಯಾಪಿ ಪಹುಂಚ",
      stateWideReachDesc: "ಕರ್ನಾಟಕದಾದ್ಯಂತ 25+ ಪಟ್ಟಣಗಳ ವಿದ್ಯಾರ್ಥಿಗಳು ತಮ್ಮ ಯಶಸ್ಸಿಗಾಗಿ ನಮ್ಮನ್ನು ನಂಬಿದ್ದಾರೆ.",
      visitAcademy: "ನಮ್ಮ ಅಕಾಡೆಮಿಗೆ ಭೇಟಿ ನೀಡಿ",
      address: "ವಿಳಾಸ",
      contact: "ಸಂಪರ್ಕ",
      email: "ಇಮೇಲ್",
      viewOnMap: "ಗೂಗಲ್ ಮ್ಯಾಪ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ",
      adminLogin: "ನಿರ್ವಾಹಕ ಲಾಗಿನ್"
    }
  };

  const t = translations[language];

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/FGqFsReGQ2KLdiKPA', '_blank');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'kn' : 'en');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative">
      {/* Hero Background with Subtle Pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="relative z-10">
        {/* Moving Alert Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 overflow-hidden">
          <div className="animate-marquee-slow whitespace-nowrap flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-bold text-lg mr-4">{t.alert}</span>
            <span className="text-sm sm:text-base">
              {t.alertText}
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
                <img 
                  src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                  alt="Visiona Education Academy Logo" 
                  className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                />
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{t.title}</h1>
                  <p className="text-sm sm:text-base text-gray-600">{t.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={toggleLanguage}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Globe className="h-4 w-4" />
                  <span>{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
                </Button>
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-4 py-2"
                >
                  {t.adminLogin}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Enhanced Visuals */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16">
          {/* Hero Content with Illustrated Background */}
          <div className="relative mb-8 sm:mb-12 lg:mb-16">
            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-green-200 rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
            
            {/* Study Icons Scattered */}
            <div className="absolute top-16 left-1/4 text-blue-300 opacity-40">
              <BookOpen className="h-8 w-8" />
            </div>
            <div className="absolute top-32 right-1/3 text-purple-300 opacity-40">
              <Users className="h-10 w-10" />
            </div>
            <div className="absolute bottom-20 right-1/4 text-green-300 opacity-40">
              <Trophy className="h-8 w-8" />
            </div>

            <div className="text-center relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                {t.heroTitle}
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
                {t.heroSubtitle}
              </p>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-blue-700 px-2">
                <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">Navodaya</span>
                <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">Sainik</span>
                <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">Morarji</span>
                <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">Kittur</span>
                <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">RMS</span>
                <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-sm">Alvas</span>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 px-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">{t.expertCoaching}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.expertCoachingDesc}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">{t.smallBatch}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.smallBatchDesc}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="bg-yellow-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">{t.provenResults}</h3>
              <p className="text-sm sm:text-base text-gray-600">
                {t.provenResultsDesc}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg text-center hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <img 
                  src="https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?w=400&h=300&fit=crop&crop=faces"
                  alt="Karnataka landscape"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="relative z-10">
                <div className="bg-purple-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">{t.stateWideReach}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {t.stateWideReachDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials Carousel */}
          <TestimonialsCarousel language={language} />

          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mx-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">{t.visitAcademy}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{t.address}</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">16th Cross Vidyagiri<br />Bagalkot, Karnataka</p>
                <Button 
                  onClick={handleMapClick}
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-xs sm:text-sm"
                >
                  {t.viewOnMap}
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-green-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{t.contact}</h4>
                <p className="text-xs sm:text-sm text-gray-600">+91 8722189292<br />+91 73494 20496</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-purple-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{t.email}</h4>
                <p className="text-xs sm:text-sm text-gray-600">info@visionaeducation.com<br />admissions@visionaeducation.com</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900/90 backdrop-blur-sm text-white py-4 sm:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
            <p className="text-xs sm:text-sm text-gray-400">
              © 2024 Visiona Education Academy. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Landing;
