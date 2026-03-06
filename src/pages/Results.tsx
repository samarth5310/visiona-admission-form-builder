import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy } from 'lucide-react';

const Results = () => {
  const navigate = useNavigate();
  const imageModules = import.meta.glob('/src/assets/results-nav/*.{png,jpg,jpeg,PNG,JPG,JPEG}', {
    eager: true,
    import: 'default',
  }) as Record<string, string>;

  const studentImages = Object.entries(imageModules)
    .sort(([leftPath], [rightPath]) =>
      leftPath.localeCompare(rightPath, undefined, { numeric: true, sensitivity: 'base' })
    )
    .map(([, imageUrl]) => imageUrl);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-3">
              <img
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png"
                alt="Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="font-bold text-xl tracking-tight text-white hidden sm:block">
                Visiona <span className="text-blue-500">Results</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 border border-blue-800/50 text-blue-200 text-sm font-medium mb-8">
            <Trophy className="w-4 h-4" />
            ಯಶಸ್ಸಿನ ಕಥೆಗಳು
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            ನಮ್ಮ ಸಂಸ್ಥೆಯಿಂದ ಸೈನಿಕ, ಆದರ್ಶ, ಮೋರಾರ್ಜಿ ಹಾಗೂ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              ಇನ್ನಿತರ ವಸತಿ ಶಾಲೆಗಳಿಗೆ ಆಯ್ಕೆಯಾದ ನಮ್ಮ ಹೆಮ್ಮೆಯ ವಿದ್ಯಾರ್ಥಿಗಳು
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-12">
            Our students have achieved remarkable success in prestigious competitive exams.
            Here's a glimpse of their journey to excellence.
          </p>
        </div>
      </section>

      {/* Individual Student Gallery */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">ಯಶಸ್ವಿ ವಿದ್ಯಾರ್ಥಿಗಳು</h2>
            <p className="text-gray-400">ನಮ್ಮ ಯಶಸ್ವಿ ವಿದ್ಯಾರ್ಥಿಗಳ ಚಿತ್ರಗಳು</p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
            {studentImages.map((imageUrl, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden border-2 border-blue-400/40 hover:border-blue-300 transition-all duration-300 bg-white"
              >
                <img
                  src={imageUrl}
                  alt={`Student photo ${index + 1}`}
                  className="w-full h-24 sm:h-32 md:h-40 lg:h-48 object-contain"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Results;
