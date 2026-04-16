import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
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

  const generatePDF = async (): Promise<Blob> => {
    if (!formContentRef.current) {
      throw new Error('Unable to generate PDF. Please try again.');
    }

    console.log('Starting PDF generation...');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;

    // Capture the form content
    const formCanvas = await html2canvas(formContentRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: formContentRef.current.scrollWidth,
      height: formContentRef.current.scrollHeight
    });

    const formImgData = formCanvas.toDataURL('image/jpeg', 0.95);
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

          const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
          const pageImgHeight = (sourceHeight * imgWidth) / formCanvas.width;

          pdf.addImage(pageImgData, 'JPEG', margin, margin, imgWidth, pageImgHeight);
        }

        yPosition += pageContentHeight;
      }
    }

    // Add document images if they exist
    const documents = [
      { file: formData.studentPhoto, title: 'Student Photo' },
      { file: formData.previousMarksheet, title: 'Previous Marksheet' },
      { file: formData.aadhaarCard, title: 'Aadhaar Card' },
      { file: formData.incomeCertificate, title: 'Income Certificate' },
      { file: formData.casteCertificate, title: 'Caste Certificate' }
    ];

    for (const doc of documents) {
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

          // Add title
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          pdf.text(doc.title, pageWidth / 2, 20, { align: 'center' });

          // Calculate image dimensions to fit page
          const maxWidth = pageWidth - (margin * 2);
          const maxHeight = pageHeight - 40;
          const imgRatio = Math.min(maxWidth / img.width, maxHeight / img.height);
          const docImgWidth = img.width * imgRatio;
          const docImgHeight = img.height * imgRatio;
          const imgX = (pageWidth - docImgWidth) / 2;
          const imgY = 30;

          // Add image to PDF
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
    console.log(`PDF size: ${(pdfBlob.size / 1024).toFixed(2)} KB`);

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

      // Generate PDF
      const pdfBlob = await generatePDF();
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
      <div ref={formContentRef} className="max-w-4xl mx-auto bg-white text-black">
        <div className="border-2 border-gray-800 m-2 p-6 min-h-[1000px] relative">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-4">
            <div className="flex items-center gap-4">
              <img
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png"
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Visiona Education Academy</h1>
                <p className="text-sm text-gray-600 font-medium mt-1">Coaching Centre for 3rd-5th Standard Competitive Exams</p>
                <p className="text-xs text-gray-500 mt-1">Navodaya | Sainik | Morarji | Kittur | Alvas</p>
                <p className="text-xs text-gray-500 mt-1">21st Cross Vidyagiri Bagalkot | +91 73494 20496</p>
              </div>
            </div>
            {/* Photo Box */}
            <div className="w-24 h-32 border-2 border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
              {formData.studentPhoto && createSafeObjectURL(formData.studentPhoto) ? (
                <img
                  src={createSafeObjectURL(formData.studentPhoto)}
                  alt="Student"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-gray-400 text-center px-1">Passport Size Photo</span>
              )}
            </div>
          </div>

          {/* Application Title & Admission Info */}
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 uppercase underline decoration-2 underline-offset-4 mb-3">Admission Application Form</h2>
            <div className="flex justify-between items-center px-8 text-sm border-y border-gray-200 py-1.5 bg-gray-50">
              <div>
                <span className="font-semibold text-gray-600">Academic Year:</span>
                <span className="ml-2 font-bold text-gray-900">2025-2026</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Admission No:</span>
                <span className="ml-2 font-bold text-gray-900">{formData.admissionNumber || '_________'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Type:</span>
                <span className="ml-2 font-bold text-gray-900">{formData.admissionType || '_________'}</span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="space-y-4">
            {/* Section: Student Details */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase bg-gray-100 p-1.5 mb-2 border-l-4 border-blue-600">Student Details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Full Name</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.fullName || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Date of Birth</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB') : '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Gender</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.gender || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Class</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.class || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Aadhaar Number</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.aadhaarNumber || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">SATS Number</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.satsNumber || '-'}</span>
                </div>
                <div className="col-span-2 flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Current School</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.currentSchool || '-'}</span>
                </div>
              </div>
            </div>

            {/* Section: Parent Details */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase bg-gray-100 p-1.5 mb-2 border-l-4 border-blue-600">Parent / Guardian Details</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Father's Name</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.fatherName || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Father's Occupation</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.fatherOccupation || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Mother's Name</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.motherName || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Mother's Occupation</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.motherOccupation || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Contact Number</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.contactNumber || '-'}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Email Address</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.email || '-'}</span>
                </div>
              </div>
            </div>

            {/* Section: Address */}
            <div>
              <h3 className="text-xs font-bold text-gray-900 uppercase bg-gray-100 p-1.5 mb-2 border-l-4 border-blue-600">Address Details</h3>
              <div className="px-2">
                <div className="flex flex-col mb-3">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">Street Address</span>
                  <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.streetAddress || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Landmark</span>
                    <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.landmark || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">City</span>
                    <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.city || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">State</span>
                    <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.state || '-'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">PIN Code</span>
                    <span className="font-medium text-gray-900 border-b border-gray-200 pb-0.5 text-sm">{formData.pinCode || '-'}</span>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Footer */}
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="text-left">
              <p className="text-xs text-gray-600 mb-1">Place: <span className="font-medium text-gray-900">{formData.place || '_________________'}</span></p>
              <p className="text-xs text-gray-600">Date: <span className="font-medium text-gray-900">{formData.declarationDate ? new Date(formData.declarationDate).toLocaleDateString('en-GB') : '_________________'}</span></p>
            </div>
            <div className="text-center">
              <div className="h-10 w-40 border-b border-gray-400 mb-1"></div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Parent's Signature</p>
            </div>
            <div className="text-center">
              <div className="h-10 w-40 border-b border-gray-400 mb-1"></div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Authorized Signatory</p>
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

    const hasDocuments = documents.some(doc => doc.file);

    if (!hasDocuments) return null;

    return (
      <div ref={documentsContentRef} className="max-w-4xl mx-auto mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Attached Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc) => (
            doc.file && createSafeObjectURL(doc.file) && (
              <div key={doc.type} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                  <h3 className="font-medium text-gray-700 text-sm">{doc.title}</h3>
                </div>
                <div className="p-4 flex items-center justify-center bg-gray-50/50 min-h-[200px]">
                  <img
                    src={createSafeObjectURL(doc.file)}
                    alt={doc.title}
                    className="max-w-full max-h-[300px] object-contain shadow-sm"
                  />
                </div>
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
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-5xl max-h-[88svh] sm:max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6">
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
          <DialogDescription className="sr-only">
            Preview the application form and download it as a PDF.
          </DialogDescription>
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
