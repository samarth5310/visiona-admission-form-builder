
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, Award, MapPin, BookOpen, Target, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <GraduationCap className="h-12 w-12" />
            <h1 className="text-5xl font-bold">Visiona Education Academy</h1>
          </div>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Empowering minds, shaping futures - Your gateway to academic excellence and competitive exam success
          </p>
          <Button 
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-3 font-semibold"
          >
            Get Started (Admin)
          </Button>
        </div>
      </header>

      {/* Institution Details Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">About Visiona Education Academy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leading the way in quality education and competitive exam preparation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                At Visiona Education Academy, we are committed to providing exceptional educational experiences 
                that nurture intellectual growth, foster critical thinking, and prepare students for success in 
                their academic and professional journeys.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                We believe in personalized learning approaches that cater to each student's unique strengths 
                and learning style, ensuring they reach their full potential.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6">Why Choose Visiona?</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Award className="h-6 w-6 text-blue-600" />
                  <span className="text-gray-700">Expert Faculty with Proven Track Record</span>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-blue-600" />
                  <span className="text-gray-700">Personalized Learning Approach</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                  <span className="text-gray-700">Comprehensive Study Materials</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 text-blue-600" />
                  <span className="text-gray-700">Outstanding Results & Success Stories</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coaching Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Small Batch Teaching</h3>
                <p className="text-gray-600">
                  Personalized attention with limited students per batch ensuring quality education
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Comprehensive Curriculum</h3>
                <p className="text-gray-600">
                  Well-structured courses covering all aspects of competitive exam preparation
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 text-center">
                <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Results</h3>
                <p className="text-gray-600">
                  Track record of successful students in various competitive examinations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Photo Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Academy</h2>
            <p className="text-xl text-gray-600">Take a glimpse into our learning environment</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <GraduationCap className="h-16 w-16 text-blue-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Modern Classrooms</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="h-16 w-16 text-green-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Well-Equipped Library</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <Users className="h-16 w-16 text-purple-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Interactive Learning</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <Target className="h-16 w-16 text-orange-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Focused Preparation</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <Award className="h-16 w-16 text-red-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Achievement Center</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl h-64 flex items-center justify-center">
              <div className="text-center">
                <Star className="h-16 w-16 text-indigo-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">Success Stories</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Address Section */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <MapPin className="h-8 w-8 text-blue-400" />
              <h2 className="text-3xl font-bold">Visit Us</h2>
            </div>
            <div className="bg-white/10 rounded-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-blue-400 mb-4">Visiona Education Academy</h3>
              <p className="text-xl leading-relaxed">
                16th Cross, Vidyagiri,<br />
                Bagalkot, Karnataka, India
              </p>
              <div className="mt-6">
                <Button 
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                >
                  Admin Access
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
