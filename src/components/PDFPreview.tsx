import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Download, MessageCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PDFPreviewProps {
  formData: any;
}

const PDFPreview: React.FC<PDFPreviewProps> = ({ formData }) => {
  const formContentRef = useRef<HTMLDivElement>(null);
  const documentsContentRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const optimizePDFSize = (pdf: jsPDF): jsPDF => {
    // Reduce quality and compression to minimize file size
    const optimizedPdf = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    // Copy pages with reduced quality
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      if (i > 1) optimizedPdf.addPage();
      
      // Get the page content and add it with compression
      const pageInfo = pdf.getPageInfo(i);
      if (pageInfo) {
        optimizedPdf.setPage(i);
      }
    }

    return optimizedPdf;
  };

  const generateOptimizedPDF = async (): Promise<Blob> => {
    if (!formContentRef.current) {
      throw new Error('Unable to generate PDF. Please try again.');
    }

    console.log('Starting optimized PDF generation...');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Capture the form content with lower quality for smaller file size
    const formCanvas = await html2canvas(formContentRef.current, {
      scale: 1, // Reduced from 2 to 1 for smaller file size
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: formContentRef.current.scrollWidth,
      height: formContentRef.current.scrollHeight
    });

    const formImgData = formCanvas.toDataURL('image/jpeg', 0.7); // Reduced quality from 0.95 to 0.7
    const imgWidth = pageWidth - (margin * 2);
    const imgHeight = (formCanvas.height * imgWidth) / formCanvas.width;

    // Check if content fits on one page
    if (imgHeight <= pageHeight - (margin * 2)) {
      // Single page
      pdf.addImage(formImgData, 'JPEG', margin, margin, imgWidth, imgHeight);
    } else {
      // Multiple pages
      let yPosition = 0;
      const pageContentHeight = pageHeight - (margin * 2);
      
      while (yPosition < imgHeight) {
        const sourceY = (yPosition / imgHeight) * formCanvas.height;
        const sourceHeight = Math.min(
          (pageContentHeight / imgHeight) * formCanvas.height,
          formCanvas.height - sourceY
        );
        
        if (yPosition > 0) {
          pdf.addPage();
        }
        
        // Create a canvas for this page section
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = formCanvas.width;
        pageCanvas.height = sourceHeight;
        const pageCtx = pageCanvas.getContext('2d');
        
        if (pageCtx) {
          pageCtx.drawImage(
            formCanvas,
            0, sourceY, formCanvas.width, sourceHeight,
            0, 0, formCanvas.width, sourceHeight
          );
          
          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.7); // Reduced quality
          const pageImgHeight = (sourceHeight * imgWidth) / formCanvas.width;
          
          pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
        }
        
        yPosition += pageContentHeight;
      }
    }

    // Only add document images if they exist and are small
    const documents = [
      { file: formData.studentPhoto, title: 'Student Photo' },
      { file: formData.previousMarksheet, title: 'Previous Marksheet' },
      { file: formData.aadhaarCard, title: 'Aadhaar Card' },
      { file: formData.incomeCertificate, title: 'Income Certificate' },
      { file: formData.casteCertificate, title: 'Caste Certificate' }
    ];

    // Limit to first 2 documents to keep file size small
    const limitedDocs = documents.filter(doc => doc.file && doc.file instanceof File).slice(0, 2);

    for (const doc of limitedDocs) {
      if (doc.file && doc.file instanceof File) {
        try {
          const imageUrl = URL.createObjectURL(doc.file);
          
          // Create an image element to get dimensions
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = imageUrl;
          });

          // Add new page for each document
          pdf.addPage();
          
          // Add title with smaller font
          pdf.setFontSize(14); // Reduced from 16
          pdf.setFont('helvetica', 'bold');
          pdf.text(doc.title, pageWidth / 2, 20, { align: 'center' });

          // Calculate smaller image dimensions to fit page
          const maxWidth = pageWidth - (margin * 2);
          const maxHeight = pageHeight - 40;
          const imgRatio = Math.min(maxWidth / img.width, maxHeight / img.height) * 0.8; // Reduced size by 20%
          const docImgWidth = img.width * imgRatio;
          const docImgHeight = img.height * imgRatio;
          const imgX = (pageWidth - docImgWidth) / 2;
          const imgY = 30;

          // Add image to PDF with lower quality
          pdf.addImage(imageUrl, 'JPEG', imgX, imgY, docImgWidth, docImgHeight);
          
          // Clean up
          URL.revokeObjectURL(imageUrl);
        } catch (error) {
          console.error(`Error adding ${doc.title} to PDF:`, error);
        }
      }
    }

    // Convert to blob
    const pdfBlob = pdf.output('blob');
    
    // Check file size and further optimize if needed
    const fileSizeKB = pdfBlob.size / 1024;
    console.log(`PDF size: ${fileSizeKB.toFixed(2)} KB`);
    
    if (fileSizeKB > 50) {
      console.log('PDF too large, creating text-only version...');
      // Create a simpler, text-only version if still too large
      const simplePdf = new jsPDF('p', 'mm', 'a4');
      
      // Add just the form data as text
      simplePdf.setFontSize(16);
      simplePdf.text('VISIONA EDUCATION ACADEMY', 105, 20, { align: 'center' });
      simplePdf.setFontSize(12);
      simplePdf.text('Student Application Form', 105, 30, { align: 'center' });
      
      let yPos = 50;
      const lineHeight = 8;
      
      const formFields = [
        `Full Name: ${formData.fullName || 'N/A'}`,
        `Date of Birth: ${formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}`,
        `Gender: ${formData.gender || 'N/A'}`,
        `Class: ${formData.class || 'N/A'}`,
        `Aadhaar Number: ${formData.aadhaarNumber || 'N/A'}`,
        `Father's Name: ${formData.fatherName || 'N/A'}`,
        `Mother's Name: ${formData.motherName || 'N/A'}`,
        `Contact: ${formData.contactNumber || 'N/A'}`,
        `Email: ${formData.email || 'N/A'}`,
        `Address: ${formData.streetAddress || 'N/A'}, ${formData.city || 'N/A'}`
      ];
      
      formFields.forEach(field => {
        if (yPos > 270) {
          simplePdf.addPage();
          yPos = 20;
        }
        simplePdf.text(field, 20, yPos);
        yPos += lineHeight;
      });
      
      return simplePdf.output('blob');
    }
    
    return pdfBlob;
  };

  const savePDFToStorage = async (pdfBlob: Blob): Promise<string> => {
    const fileName = `${formData.fullName || 'Student'}_Application_${Date.now()}.pdf`;
    const filePath = `applications/${fileName}`;

    console.log('Uploading PDF to Supabase Storage...');
    
    const { data, error } = await supabase.storage
      .from('application-documents')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to save PDF: ${error.message}`);
    }

    console.log('PDF uploaded successfully:', data);

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('application-documents')
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to get public URL for PDF');
    }

    console.log('Public URL generated:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  };

  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Check if required fields are filled
      if (!formData.fullName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in at least the student's full name before downloading PDF.",
          variant: "destructive",
        });
        return;
      }

      console.log('PDF download requested for:', formData.fullName);
      
      // Generate optimized PDF
      const pdfBlob = await generateOptimizedPDF();
      const fileSizeKB = pdfBlob.size / 1024;
      
      // Save to Supabase Storage
      const publicUrl = await savePDFToStorage(pdfBlob);
      setPdfUrl(publicUrl);
      
      // Also trigger download
      const fileName = `${formData.fullName || 'Student'}_Application_Form.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success!",
        description: `PDF generated (${fileSizeKB.toFixed(1)}KB) and saved to cloud storage. Ready for WhatsApp sharing!`,
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const sendViaWhatsApp = () => {
    if (!pdfUrl) {
      toast({
        title: "No PDF Available",
        description: "Please generate the PDF first before sharing via WhatsApp.",
        variant: "destructive",
      });
      return;
    }

    if (!whatsappNumber.trim()) {
      toast({
        title: "Missing WhatsApp Number",
        description: "Please enter a WhatsApp number to share the PDF.",
        variant: "destructive",
      });
      return;
    }

    // Clean the phone number (remove non-digits)
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    
    if (cleanNumber.length < 10) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid WhatsApp number.",
        variant: "destructive",
      });
      return;
    }

    const message = `Hi! Here's the application form for ${formData.fullName || 'the student'}: ${pdfUrl}`;
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Opened",
      description: "WhatsApp has been opened with the PDF link ready to send.",
    });
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
        <div className="text-center border-b-2 border-gray-600 pb-6 mb-8">
          <div className="flex items-center justify-center gap-6 mb-4">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Visiona Education Academy Logo" 
              className="w-16 h-16 object-contain"
            />
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-700 mb-2">VISIONA EDUCATION ACADEMY</h1>
              <p className="text-lg text-gray-700">Coaching Centre for 3rd-5th Standard Competitive Exams</p>
              <p className="text-sm text-gray-600">Navodaya | Sainik | Morarji | Kittur | Alvas</p>
              <p className="text-sm text-gray-600 font-medium mt-1">16th Cross Vidyagiri Bagalkot</p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {/* General Information with Photo Display */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">General Information</h2>
            <div className="flex gap-6">
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div><strong>Admission Number:</strong> {formData.admissionNumber || 'N/A'}</div>
                <div><strong>Admission Type:</strong> {formData.admissionType || 'N/A'}</div>
              </div>
              
              {/* Student Photo Display Box */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 border-2 border-gray-300 flex items-center justify-center bg-gray-100 overflow-hidden">
                  {formData.studentPhoto && createSafeObjectURL(formData.studentPhoto) ? (
                    <img 
                      src={createSafeObjectURL(formData.studentPhoto)} 
                      alt="Student"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs text-center p-1">
                      Student Photo
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Student Information</h2>
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Parent/Guardian Information</h2>
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Address</h2>
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Academic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Last Year Percentage:</strong> {formData.lastYearPercentage || 'N/A'}%</div>
              <div><strong>Category:</strong> {formData.category || 'N/A'}</div>
              <div><strong>Subjects Weak In:</strong> {formData.subjectsWeakIn || 'N/A'}</div>
              <div><strong>Exams Preparing For:</strong> {formData.examsPreparingFor?.join(', ') || 'N/A'}</div>
            </div>
          </div>

          {/* Fee Payment Details */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Fee Payment Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div><strong>Payment Mode:</strong> {formData.paymentMode || 'N/A'}</div>
              <div><strong>Transaction ID:</strong> {formData.transactionId || 'N/A'}</div>
              <div><strong>Amount Paid:</strong> ₹{formData.amountPaid || 'N/A'}</div>
            </div>
          </div>

          {/* Document Images */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Uploaded Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              {formData.previousMarksheet && createSafeObjectURL(formData.previousMarksheet) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.previousMarksheet)} 
                    alt="Previous Marksheet"
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">Previous Marksheet</p>
                </div>
              )}
              {formData.aadhaarCard && createSafeObjectURL(formData.aadhaarCard) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.aadhaarCard)} 
                    alt="Aadhaar Card"
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">Aadhaar Card</p>
                </div>
              )}
              {formData.incomeCertificate && createSafeObjectURL(formData.incomeCertificate) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.incomeCertificate)} 
                    alt="Income Certificate"
                    className="w-full h-32 object-cover border"
                  />
                  <p className="text-xs mt-1">Income Certificate</p>
                </div>
              )}
              {formData.casteCertificate && createSafeObjectURL(formData.casteCertificate) && (
                <div className="text-center">
                  <img 
                    src={createSafeObjectURL(formData.casteCertificate)} 
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
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Declarations</h2>
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
      { file: formData.previousMarksheet, title: 'Previous Marksheet', type: 'previous_marksheet' },
      { file: formData.aadhaarCard, title: 'Aadhaar Card', type: 'aadhaar_card' },
      { file: formData.incomeCertificate, title: 'Income Certificate', type: 'income_certificate' },
      { file: formData.casteCertificate, title: 'Caste Certificate', type: 'caste_certificate' }
    ];

    return (
      <div ref={documentsContentRef} className="space-y-8 mt-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">Uploaded Documents</h2>
        <div className="grid grid-cols-1 gap-8">
          {documents.map((doc) => (
            doc.file && createSafeObjectURL(doc.file) && (
              <div key={doc.type} className="text-center p-4 border border-gray-300 rounded">
                <h3 className="text-lg font-semibold mb-4">{doc.title}</h3>
                <img 
                  src={createSafeObjectURL(doc.file)} 
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
          className="bg-white text-gray-600 border-gray-600 hover:bg-gray-50 px-8 sm:px-12 py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
        >
          <Eye className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Preview PDF
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Application Form Preview
            <div className="flex gap-2">
              <Button 
                onClick={downloadPDF} 
                disabled={isGeneratingPDF}
                className="ml-4"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGeneratingPDF ? "Generating..." : "Download & Save PDF"}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {generateFormContent()}
          {generateDocumentsSection()}
        </div>

        {/* WhatsApp Sharing Section */}
        {pdfUrl && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Share via WhatsApp
            </h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label htmlFor="whatsapp-number" className="text-sm font-medium">
                  WhatsApp Number (with country code)
                </Label>
                <Input
                  id="whatsapp-number"
                  type="tel"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="e.g., 919876543210"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={sendViaWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Send PDF Link
              </Button>
            </div>
            <p className="text-xs text-green-600 mt-2">
              PDF Link: <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline">{pdfUrl}</a>
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreview;
