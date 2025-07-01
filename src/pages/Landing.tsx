import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { AnimatedButton } from "@/components/ui/animated-button";

const Landing = () => {
  const navigate = useNavigate();
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-white font-montserrat">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Visiona Education Academy" 
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                About Us
              </button>
              <button 
                onClick={() => contactRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Contact
              </button>
              <button 
                onClick={() => navigate('/admission')}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                Admissions
              </button>
            </nav>

            {/* Mobile Menu (Example - you might need a more complex solution) */}
            <div className="md:hidden">
              <button className="text-gray-500 hover:text-gray-900 focus:outline-none">
                {/* Replace with an actual menu icon */}
                Menu
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Excellence in Education at{' '}
                <span className="text-blue-600">Visiona Academy</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Nurturing young minds with innovative teaching methods, personalized attention, 
                and a commitment to academic excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <AnimatedButton 
                  variant="default"
                  onClick={() => navigate('/admission')}
                  className="w-full sm:w-auto"
                >
                  Apply for Admission
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="light"
                  onClick={() => navigate('/student-login')}
                  className="w-full sm:w-auto"
                >
                  Student Portal
                </AnimatedButton>
              </div>
            </div>
            
            <div className="flex justify-center lg:justify-end">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Visiona Education Academy" 
                className="w-full max-w-md lg:max-w-lg xl:max-w-xl object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Visiona Academy?
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover the unique features that make Visiona Academy the perfect place for your child's education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Personalized Learning
              </h3>
              <p className="text-gray-600">
                Tailored education plans to meet each student's unique needs and learning style.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Experienced Faculty
              </h3>
              <p className="text-gray-600">
                Dedicated teachers committed to fostering a supportive and engaging learning environment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                State-of-the-Art Facilities
              </h3>
              <p className="text-gray-600">
                Modern classrooms, advanced labs, and extensive resources to enhance the educational experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section ref={aboutRef} className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1522205436927-9aa95efb07eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1171&q=80" 
                alt="About Visiona Academy" 
                className="w-full rounded-lg shadow-lg object-cover"
              />
            </div>
            
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                About Visiona Education Academy
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Visiona Academy is committed to providing a nurturing and stimulating environment where students can thrive academically, socially, and personally.
              </p>
              <p className="text-lg text-gray-600">
                Our mission is to empower students to become lifelong learners and responsible global citizens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What Our Students and Parents Say
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Read inspiring stories and testimonials from our students and their families.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700 italic mb-4">
                "Visiona Academy has been instrumental in my child's academic growth. The teachers are caring and the curriculum is challenging."
              </p>
              <p className="text-gray-900 font-semibold">- John Doe, Parent</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700 italic mb-4">
                "I love studying at Visiona Academy! The teachers make learning fun and I've made so many friends."
              </p>
              <p className="text-gray-900 font-semibold">- Jane Smith, Student</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-gray-700 italic mb-4">
                "The supportive environment at Visiona Academy has helped my child develop confidence and a love for learning."
              </p>
              <p className="text-gray-900 font-semibold">- David Lee, Parent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} className="bg-gray-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ready to join our community? Contact us today to learn more about admissions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p className="text-gray-600">123 Education Street, Knowledge City, State 12345</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Numbers</p>
                    <div className="space-y-1">
                      <a 
                        href="https://wa.me/919876543210" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 block"
                      >
                        +91 98765 43210
                      </a>
                      <a 
                        href="https://wa.me/919123456789" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 transition-colors duration-200 block"
                      >
                        +91 91234 56789
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-gray-600">info@visionaacademy.edu</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Office Hours</p>
                    <p className="text-gray-600">Monday - Saturday: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
              
              <div className="space-y-4">
                <AnimatedButton 
                  variant="default"
                  onClick={() => navigate('/admission')}
                  className="w-full"
                >
                  Start Admission Process
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="light"
                  onClick={() => navigate('/login')}
                  className="w-full"
                >
                  Admin Login
                </AnimatedButton>
                
                <AnimatedButton 
                  variant="default"
                  onClick={() => navigate('/student-login')}
                  className="w-full"
                >
                  Student Portal
                </AnimatedButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm">
                &copy; {new Date().getFullYear()} Visiona Education Academy. All rights reserved.
              </p>
            </div>
            <div className="text-center md:text-right">
              <a href="#" className="text-sm hover:underline">Privacy Policy</a>
              <span className="mx-2">|</span>
              <a href="#" className="text-sm hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
