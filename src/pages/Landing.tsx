
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Trophy, MapPin, Phone, Mail } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  const handleMapClick = () => {
    window.open('https://maps.app.goo.gl/FGqFsReGQ2KLdiKPA', '_blank');
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative"
      style={{
        backgroundImage: `url('/lovable-uploads/dd8f8e21-e8fc-4ec3-b633-02e39d11f411.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay to make background subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/95 to-indigo-100/95"></div>
      
      <div className="relative z-10">
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
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">VISIONA EDUCATION ACADEMY</h1>
                  <p className="text-sm sm:text-base text-gray-600">Excellence in Competitive Exam Preparation</p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-4 py-2"
              >
                Admin Login
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Nurturing Future Leaders
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 px-2">
              Specialized coaching for 3rd-5th standard competitive exams including 
              Navodaya, Sainik, Morarji, Kittur, RMS, and Alvas entrance tests.
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-blue-700 px-2">
              <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full">Navodaya</span>
              <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full">Sainik</span>
              <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full">Morarji</span>
              <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full">Kittur</span>
              <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full">RMS</span>
              <span className="bg-blue-100 px-2 sm:px-4 py-1 sm:py-2 rounded-full">Alvas</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16 px-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg text-center">
              <div className="bg-blue-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Expert Coaching</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Comprehensive preparation with experienced faculty and proven teaching methodologies.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg text-center">
              <div className="bg-green-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Small Batch Size</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Personalized attention with limited students per batch ensuring quality education.
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 sm:p-6 lg:p-8 shadow-lg text-center">
              <div className="bg-yellow-100 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">Proven Results</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Track record of successful admissions in prestigious schools and institutions.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mx-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8">Visit Our Academy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Address</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">16th Cross Vidyagiri<br />Bagalkot, Karnataka</p>
                <Button 
                  onClick={handleMapClick}
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200 text-xs sm:text-sm"
                >
                  View on Google Maps
                </Button>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-green-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Contact</h4>
                <p className="text-xs sm:text-sm text-gray-600">+91 8722189292<br />+91 73494 20496</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-purple-100 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Email</h4>
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
