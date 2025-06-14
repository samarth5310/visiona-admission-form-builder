
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFPreviewProps {
  formData: any;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ formData }) => {
  const formContentRef = useRef<HTMLDivElement>(null);
  const documentsContentRef = useRef<HTMLDivElement>(null);

  const downloadPDF = async () => {
    if (!formContentRef.current) return;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // First, capture and add the form content
      const formCanvas = await html2canvas(formContentRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const formImgData = formCanvas.toDataURL('image/jpeg', 0.8);
      const formImgWidth = formCanvas.width;
      const formImgHeight = formCanvas.height;
      const formRatio = Math.min(pageWidth / formImgWidth, pageHeight / formImgHeight);
      const formImgX = (pageWidth - formImgWidth * formRatio) / 2;

      pdf.addImage(formImgData, 'JPEG', formImgX, 0, formImgWidth * formRatio, formImgHeight * formRatio);

      // Add document images on separate pages
      const documents = [
        { files: formData.studentPhoto, title: 'Student Photo' },
        { files: formData.previousMarksheet, title: 'Previous Marksheet' },
        { files: formData.aadhaarCard, title: 'Aadhaar Card' },
        { files: formData.incomeCertificate, title: 'Income Certificate' },
        { files: formData.casteCertificate, title: 'Caste Certificate' }
      ];

      for (const doc of documents) {
        if (doc.files && doc.files[0]) {
          try {
            const file = doc.files[0];
            const imageUrl = URL.createObjectURL(file);
            
            // Create an image element to get dimensions
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = imageUrl;
            });

            // Add new page for each document
            pdf.addPage();
            
            // Add title
            pdf.setFontSize(16);
            pdf.setFont('helvetica', 'bold');
            pdf.text(doc.title, pageWidth / 2, 20, { align: 'center' });

            // Calculate image dimensions to fit page
            const maxWidth = pageWidth - 20;
            const maxHeight = pageHeight - 40;
            const imgRatio = Math.min(maxWidth / img.width, maxHeight / img.height);
            const imgWidth = img.width * imgRatio;
            const imgHeight = img.height * imgRatio;
            const imgX = (pageWidth - imgWidth) / 2;
            const imgY = 30;

            // Add image to PDF
            pdf.addImage(imageUrl, 'JPEG', imgX, imgY, imgWidth, imgHeight);
            
            // Clean up
            URL.revokeObjectURL(imageUrl);
          } catch (error) {
            console.error(`Error adding ${doc.title} to PDF:`, error);
          }
        }
      }

      pdf.save(`${formData.fullName || 'Student'}_Application_Form.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Helper function to safely create object URL
  const createSafeObjectURL = (file: any) => {
    if (file && file instanceof File && file.size > 0) {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error('Error creating object URL:', error);
        return null;
      }
    }
    return null;
  };

  const generateFormContent = () => {
    return (
      <div ref={formContentRef} className="max-w-4xl mx-auto p-8 bg-white text-black">
        {/* Header */}
        <div className="text-center border-b-2 border-blue-600 pb-6 mb-8">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">VISIONA EDUCATION ACADEMY</h1>
          <p className="text-lg text-gray-700">Coaching Centre for 3rd-5th Standard Competitive Exams</p>
          <p className="text-sm text-gray-600">Navodaya | Sainik | Morarji | Kittur | Alvas</p>
        </div>

        {/* Student Photo */}
        {formData.studentPhoto && formData.studentPhoto[0] && createSafeObjectURL(formData.studentPhoto[0]) && (
          <div className="flex justify-end mb-6">
            <div className="border-2 border-gray-300 p-2">
              <img 
                src={createSafeObjectURL(formData.studentPhoto[0])} 
                alt="Student Photo"
                className="w-32 h-40 object-cover"
              />
              <p className="text-xs text-center mt-1">Student Photo</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="space-y-6">
          {/* General Information */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">General Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Admission Number:</strong> {formData.admissionNumber || 'N/A'}</div>
              <div><strong>Admission Type:</strong> {formData.admissionType || 'N/A'}</div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">Student Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Full Name:</strong> {formData.fullName || 'N/A'}</div>
              <div><strong>Date of Birth:</strong> {formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</div>
              <div><strong>Gender:</strong> {formData.gender || 'N/A'}</div>
              <div><strong>Class:</strong> {formData.class || 'N/A'}</div>
              <div><strong>Current School:</strong> {formData.currentSchool || 'N/A'}</div>
              <div><strong>Aadhaar Number:</strong> {formData.aadhaarNumber || 'N/A'}</div>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">Parent/Guardian Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Father's Name:</strong> {formData.fatherName || 'N/A'}</div>
              <div><strong>Mother's Name:</strong> {formData.motherName || 'N/A'}</div>
              <div><strong>Father's Occupation:</strong> {formData.fatherOccupation || 'N/A'}</div>
              <div><strong>Mother's Occupation:</strong> {formData.motherOccupation || 'N/A'}</div>
              <div><strong>Contact Number:</strong> {formData.contactNumber || 'N/A'}</div>
              <div><strong>Email:</strong> {formData.email || 'N/A'}</div>
              <div><strong>SATS Number:</strong> {formData.satsNumber || 'N/A'}</div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">Address</h2>
            <div className="grid grid-cols-1 gap-2">
              <div><strong>Street Address:</strong> {formData.streetAddress || 'N/A'}</div>
              <div className="grid grid-cols-3 gap-4">
                <div><strong>City:</strong> {formData.city || 'N/A'}</div>
                <div><strong>State:</strong> {formData.state || 'N/A'}</div>
                <div><strong>PIN Code:</strong> {formData.pinCode || 'N/A'}</div>
              </div>
              {formData.landmark && <div><strong>Landmark:</strong> {formData.landmark}</div>}
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">Academic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Last Year Percentage:</strong> {formData.lastYearPercentage || 'N/A'}%</div>
              <div><strong>Category:</strong> {formData.category || 'N/A'}</div>
              <div><strong>Subjects Weak In:</strong> {formData.subjectsWeakIn || 'N/A'}</div>
              <div><strong>Exams Preparing For:</strong> {formData.examsPreparingFor?.join(', ') || 'N/A'}</div>
            </div>
          </div>

          {/* Fee Payment Details */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">Fee Payment Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div><strong>Payment Mode:</strong> {formData.paymentMode || 'N/A'}</div>
              <div><strong>Transaction ID:</strong> {formData.transactionId || 'N/A'}</div>
              <div><strong>Amount Paid:</strong> ₹{formData.amountPaid || 'N/A'}</div>
            </div>
          </div>

          {/* Document Images */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">Uploaded Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              {formData.previousMarksheet && formData.previousMarksheet[0] && createSafeObjectURL(formData.previousMarksheet[0]) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.previousMarksheet[0])} 
                    alt="Previous Marksheet"
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">Previous Marksheet</p>
                </div>
              )}
              {formData.aadhaarCard && formData.aadhaarCard[0] && createSafeObjectURL(formData.aadhaarCard[0]) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.aadhaarCard[0])} 
                    alt="Aadhaar Card"
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">Aadhaar Card</p>
                </div>
              )}
              {formData.incomeCertificate && formData.incomeCertificate[0] && createSafeObjectURL(formData.incomeCertificate[0]) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.incomeCertificate[0])} 
                    alt="Income Certificate"
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">Income Certificate</p>
                </div>
              )}
              {formData.casteCertificate && formData.casteCertificate[0] && createSafeObjectURL(formData.casteCertificate[0]) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.casteCertificate[0])} 
                    alt="Caste Certificate"
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">Caste Certificate</p>
                </div>
              )}
            </div>
          </div>

          {/* Declarations */}
          <div>
            <h2 className="text-xl font-semibold text-blue-700 mb-4 border-b border-gray-300 pb-2">Declarations</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium">ಎಲ್ಲಾ ನಿಗದಿಪಡಿಸಿದ ಶುಲ್ಕಗಳನ್ನು ಮುಂಗಡವಾಗಿ ಪಾವತಿಸಬೇಕು</p>
                <p className="text-gray-600">All the prescribed fees should be paid in Advance</p>
              </div>
              <div>
                <p className="font-medium">ಒಮ್ಮೆ ಪಾವತಿಸಿದ ಶುಲ್ಕವನ್ನು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಹಿಂತಿರುಗಿಸಲು / ವರ್ಗಾಯಿಸಲು ಅವಕಾಶವಿಲ್ಲ</p>
                <p className="text-gray-600">Fees Once paid shall not be refunded or transferred under any circumstances.</p>
              </div>
              <div>
                <p className="font-medium">ನಾನು ನಿಮ್ಮ ಸಂಸ್ಥೆಯ ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಎಂದು ಇಲ್ಲಿ ಘೋಷಿಸುತ್ತೇನೆ</p>
                <p className="text-gray-600">I hereby declare that I have understood the rules and regulations of your Institution.</p>
              </div>
              <p className="font-medium">I hereby declare that all information provided is true to the best of my knowledge.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div><strong>Place:</strong> {formData.place || 'N/A'}</div>
              <div><strong>Date:</strong> {formData.declarationDate ? new Date(formData.declarationDate).toLocaleDateString('en-GB') : 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const generateDocumentsSection = () => {
    const documents = [
      { files: formData.previousMarksheet, title: 'Previous Marksheet', type: 'previous_marksheet' },
      { files: formData.aadhaarCard, title: 'Aadhaar Card', type: 'aadhaar_card' },
      { files: formData.incomeCertificate, title: 'Income Certificate', type: 'income_certificate' },
      { files: formData.casteCertificate, title: 'Caste Certificate', type: 'caste_certificate' }
    ];

    return (
      <div ref={documentsContentRef} className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Uploaded Documents</h2>
        <div className="grid grid-cols-1 gap-8">
          {documents.map((doc) => (
            doc.files && doc.files[0] && createSafeObjectURL(doc.files[0]) && (
              <div key={doc.type} className="text-center p-4 border border-gray-300 rounded">
                <h3 className="text-lg font-semibold mb-4">{doc.title}</h3>
                <img 
                  src={createSafeObjectURL(doc.files[0])} 
                  alt={doc.title}
                  className="max-w-full h-auto mx-auto border"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          type="button"
          variant="outline" 
          size="lg" 
          className="bg-white text-blue-600 border-blue-600 hover:bg-blue-50 px-12 py-3 text-lg font-semibold mr-4"
        >
          <Eye className="mr-2 h-5 w-5" />
          Preview PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Application Form Preview
            <Button 
              onClick={downloadPDF}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2"
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {generateFormContent()}
          {generateDocumentsSection()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreview;
