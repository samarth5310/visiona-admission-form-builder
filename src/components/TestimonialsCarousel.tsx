
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  nameKn: string;
  role: string;
  roleKn: string;
  image: string;
  testimonial: string;
  testimonialKn: string;
  rating: number;
}

interface TestimonialsCarouselProps {
  language: 'en' | 'kn';
}

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({ language }) => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Rajesh Kumar",
      nameKn: "ರಾಜೇಶ್ ಕುಮಾರ್",
      role: "Parent of Navodaya Student",
      roleKn: "ನವೋದಯ ವಿದ್ಯಾರ್ಥಿಯ ಪೋಷಕ",
      image: "/lovable-uploads/a5e775c0-2c26-43b1-8921-be177ed88016.png",
      testimonial: "Visiona Education Academy helped my child crack the Navodaya entrance exam. The faculty's dedication and teaching methodology are exceptional.",
      testimonialKn: "ವಿಶನ್ ಎಜುಕೇಶನ್ ಅಕಾಡೆಮಿ ನನ್ನ ಮಗುವಿಗೆ ನವೋದಯ ಪ್ರವೇಶ ಪರೀಕ್ಷೆಯಲ್ಲಿ ಯಶಸ್ಸು ಸಾಧಿಸಲು ಸಹಾಯ ಮಾಡಿತು. ಅಧ್ಯಾಪಕರ ಸಮರ್ಪಣೆ ಮತ್ತು ಬೋಧನಾ ವಿಧಾನ ಅಸಾಧಾರಣವಾಗಿದೆ.",
      rating: 5
    },
    {
      id: 2,
      name: "Priya Sharma",
      nameKn: "ಪ್ರಿಯಾ ಶರ್ಮಾ",
      role: "Mother of Sainik School Student",
      roleKn: "ಸೈನಿಕ್ ಶಾಲೆಯ ವಿದ್ಯಾರ್ಥಿಯ ತಾಯಿ",
      image: "/lovable-uploads/9335fc94-811f-47f9-8f36-45eceb0bc7e7.png",
      testimonial: "The personalized attention and small batch sizes make all the difference. My son got selected in Sainik School thanks to their excellent coaching.",
      testimonialKn: "ವೈಯಕ್ತಿಕ ಗಮನ ಮತ್ತು ಸಣ್ಣ ಬ್ಯಾಚ್ ಗಾತ್ರಗಳು ಎಲ್ಲಾ ವ್ಯತ್ಯಾಸವನ್ನು ಮಾಡುತ್ತವೆ. ಅವರ ಅತ್ಯುತ್ತಮ ತರಬೇತಿಗೆ ಧನ್ಯವಾದಗಳು, ನನ್ನ ಮಗ ಸೈನಿಕ್ ಶಾಲೆಯಲ್ಲಿ ಆಯ್ಕೆಯಾದ.",
      rating: 5
    },
    {
      id: 3,
      name: "Anita Patil",
      nameKn: "ಅನಿತಾ ಪಾಟೀಲ್",
      role: "Parent of RMS Student",
      roleKn: "RMS ವಿದ್ಯಾರ್ಥಿಯ ಪೋಷಕ",
      image: "/lovable-uploads/105cad00-0e0a-4155-b8b7-2bb9e04c81c7.png",
      testimonial: "The academy's comprehensive approach and experienced faculty helped my daughter succeed in RMS entrance. Highly recommended!",
      testimonialKn: "ಅಕಾಡೆಮಿಯ ಸಮಗ್ರ ವಿಧಾನ ಮತ್ತು ಅನುಭವಿ ಅಧ್ಯಾಪಕರು ನನ್ನ ಮಗಳಿಗೆ RMS ಪ್ರವೇಶದಲ್ಲಿ ಯಶಸ್ಸು ಸಾಧಿಸಲು ಸಹಾಯ ಮಾಡಿದರು. ಅತ್ಯಧಿಕವಾಗಿ ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ!",
      rating: 5
    },
    {
      id: 4,
      name: "Suresh Gowda",
      nameKn: "ಸುರೇಶ್ ಗೌಡ",
      role: "Father of Kittur Student",
      roleKn: "ಕಿತ್ತೂರು ವಿದ್ಯಾರ್ಥಿಯ ತಂದೆ",
      image: "/lovable-uploads/3003146b-96f4-4648-bab3-a8c0203219c6.png",
      testimonial: "Excellent coaching center with proven track record. The teachers are very supportive and the study material is comprehensive.",
      testimonialKn: "ಸಾಬೀತಾದ ದಾಖಲೆಯೊಂದಿಗೆ ಅತ್ಯುತ್ತಮ ತರಬೇತಿ ಕೇಂದ್ರ. ಶಿಕ್ಷಕರು ಬಹಳ ಸಹಾಯಕವಾಗಿದ್ದಾರೆ ಮತ್ತು ಅಧ್ಯಯನ ಸಾಮಗ್ರಿ ಸಮಗ್ರವಾಗಿದೆ.",
      rating: 5
    }
  ];

  const translations = {
    en: {
      title: "What Parents & Students Say",
      subtitle: "Real experiences from our successful students and their families"
    },
    kn: {
      title: "ಪೋಷಕರು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿಗಳು ಹೇಳುವುದು",
      subtitle: "ನಮ್ಮ ಯಶಸ್ವಿ ವಿದ್ಯಾರ್ಥಿಗಳು ಮತ್ತು ಅವರ ಕುಟುಂಬಗಳ ನಿಜವಾದ ಅನುಭವಗಳು"
    }
  };

  const t = translations[language];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 sm:p-8 mx-2 mb-8 sm:mb-12 lg:mb-16">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          {t.title}
        </h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t.subtitle}
        </p>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-5xl mx-auto"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={language === 'en' ? testimonial.name : testimonial.nameKn}
                      className="w-12 h-12 rounded-full object-cover mr-4 shadow-md"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {language === 'en' ? testimonial.name : testimonial.nameKn}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {language === 'en' ? testimonial.role : testimonial.roleKn}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex mb-3">
                    {renderStars(testimonial.rating)}
                  </div>
                  
                  <p className="text-gray-700 text-sm leading-relaxed">
                    "{language === 'en' ? testimonial.testimonial : testimonial.testimonialKn}"
                  </p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className="flex justify-center mt-6 space-x-4">
          <CarouselPrevious className="static translate-y-0" />
          <CarouselNext className="static translate-y-0" />
        </div>
      </Carousel>
    </div>
  );
};

export default TestimonialsCarousel;
