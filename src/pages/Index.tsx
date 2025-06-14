import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Download, Eye } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import PDFPreview from '@/components/PDFPreview';
import { submitApplicationForm, type FormSubmissionData } from '@/services/formSubmissionService';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const formSchema = z.object({
  admissionNumber: z.string().min(1, 'Admission number is required'),
  admissionType: z.string().min(1, 'Admission type is required'),
  studentPhoto: z.any().optional(),
  fullName: z.string().min(1, 'Full name is required'),
  dateOfBirth: z.date({ required_error: 'Date of birth is required' }),
  gender: z.string().min(1, 'Gender is required'),
  currentSchool: z.string().min(1, 'Current school is required'),
  class: z.string().min(1, 'Class is required'),
  aadhaarNumber: z.string()
    .min(12, 'Aadhaar number must be exactly 12 digits')
    .max(12, 'Aadhaar number must be exactly 12 digits')
    .regex(/^\d{12}$/, 'Aadhaar number must contain only digits'),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  fatherOccupation: z.string().min(1, "Father's occupation is required"),
  motherOccupation: z.string().min(1, "Mother's occupation is required"),
  contactNumber: z.string().regex(/^\d{10}$/, 'Contact number must be 10 digits'),
  email: z.string().email('Valid email is required'),
  satsNumber: z.string().min(1, 'SATS number is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  landmark: z.string().optional(),
  lastYearPercentage: z.number().min(0).max(100),
  subjectsWeakIn: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  examsPreparingFor: z.array(z.string()).min(1, 'Select at least one exam'),
  previousMarksheet: z.any().optional(),
  aadhaarCard: z.any().optional(),
  incomeCertificate: z.any().optional(),
  casteCertificate: z.any().optional(),
  paymentMode: z.string().min(1, 'Payment mode is required'),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  amountPaid: z.number().min(1, 'Amount paid is required'),
  place: z.string().min(1, 'Place is required'),
  declarationDate: z.date({ required_error: 'Declaration date is required' }),
});

type FormData = z.infer<typeof formSchema>;

const Index = () => {
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examsPreparingFor: [],
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting form data:', data);
      
      // Convert form data to FormSubmissionData format
      const submissionData: FormSubmissionData = {
        admissionNumber: data.admissionNumber,
        admissionType: data.admissionType,
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        currentSchool: data.currentSchool,
        class: data.class,
        aadhaarNumber: data.aadhaarNumber,
        fatherName: data.fatherName,
        motherName: data.motherName,
        fatherOccupation: data.fatherOccupation,
        motherOccupation: data.motherOccupation,
        contactNumber: data.contactNumber,
        email: data.email,
        satsNumber: data.satsNumber,
        streetAddress: data.streetAddress,
        city: data.city,
        state: data.state,
        pinCode: data.pinCode,
        landmark: data.landmark,
        lastYearPercentage: data.lastYearPercentage,
        subjectsWeakIn: data.subjectsWeakIn,
        category: data.category,
        examsPreparingFor: data.examsPreparingFor,
        paymentMode: data.paymentMode,
        transactionId: data.transactionId,
        amountPaid: data.amountPaid,
        place: data.place,
        declarationDate: data.declarationDate,
        studentPhoto: data.studentPhoto,
        previousMarksheet: data.previousMarksheet,
        aadhaarCard: data.aadhaarCard,
        incomeCertificate: data.incomeCertificate,
        casteCertificate: data.casteCertificate,
      };
      
      const result = await submitApplicationForm(submissionData);
      
      if (result.success) {
        toast({
          title: "Application Submitted Successfully!",
          description: `Your application has been saved with ID: ${result.applicationId}`,
        });
        form.reset();
        setSelectedExams([]);
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Failed to submit application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExamChange = (exam: string, checked: boolean) => {
    const updatedExams = checked 
      ? [...selectedExams, exam]
      : selectedExams.filter(e => e !== exam);
    setSelectedExams(updatedExams);
    form.setValue('examsPreparingFor', updatedExams);
  };

  const downloadPDF = async () => {
    const formData = form.getValues();
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Create a temporary div with the form content for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto; padding: 32px; background: white; color: black; font-family: Arial, sans-serif;">
          <div style="text-align: center; border-bottom: 2px solid #6b7280; padding-bottom: 24px; margin-bottom: 32px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 24px; margin-bottom: 16px;">
              <img src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" alt="Visiona Education Academy Logo" style="width: 64px; height: 64px; object-fit: contain;" />
              <div style="text-align: center;">
                <h1 style="font-size: 24px; font-weight: bold; color: #374151; margin-bottom: 8px;">VISIONA EDUCATION ACADEMY</h1>
                <p style="font-size: 16px; color: #4b5563;">Coaching Centre for 3rd-5th Standard Competitive Exams</p>
                <p style="font-size: 12px; color: #6b7280;">Navodaya | Sainik | Morarji | Kittur | Alvas</p>
                <p style="font-size: 12px; color: #6b7280; font-weight: 500; margin-top: 4px;">16th Cross Vidyagiri Bagalkot</p>
              </div>
            </div>
          </div>
          
          <div style="space-y: 24px;">
            <div>
              <h2 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">General Information</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div><strong>Admission Number:</strong> ${formData.admissionNumber || 'N/A'}</div>
                <div><strong>Admission Type:</strong> ${formData.admissionType || 'N/A'}</div>
              </div>
            </div>
            
            <div>
              <h2 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Student Information</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div><strong>Full Name:</strong> ${formData.fullName || 'N/A'}</div>
                <div><strong>Date of Birth:</strong> ${formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString('en-GB') : 'N/A'}</div>
                <div><strong>Gender:</strong> ${formData.gender || 'N/A'}</div>
                <div><strong>Class:</strong> ${formData.class || 'N/A'}</div>
                <div><strong>Current School:</strong> ${formData.currentSchool || 'N/A'}</div>
                <div><strong>Aadhaar Number:</strong> ${formData.aadhaarNumber || 'N/A'}</div>
              </div>
            </div>
            
            <div>
              <h2 style="font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 16px; border-bottom: 1px solid #d1d5db; padding-bottom: 8px;">Parent/Guardian Information</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div><strong>Father's Name:</strong> ${formData.fatherName || 'N/A'}</div>
                <div><strong>Mother's Name:</strong> ${formData.motherName || 'N/A'}</div>
                <div><strong>Father's Occupation:</strong> ${formData.fatherOccupation || 'N/A'}</div>
                <div><strong>Mother's Occupation:</strong> ${formData.motherOccupation || 'N/A'}</div>
                <div><strong>Contact Number:</strong> ${formData.contactNumber || 'N/A'}</div>
                <div><strong>Email:</strong> ${formData.email || 'N/A'}</div>
                <div><strong>SATS Number:</strong> ${formData.satsNumber || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(tempDiv);
      
      const canvas = await html2canvas(tempDiv, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const imgX = (pageWidth - imgWidth * ratio) / 2;

      pdf.addImage(imgData, 'JPEG', imgX, 0, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${formData.fullName || 'Student'}_Application_Form.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your application form has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Error generating PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto border-2 border-gray-300 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <Card className="mb-8 border-0 border-b-2 border-gray-300 rounded-none">
          <CardHeader className="text-center bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-t-lg">
            <div className="flex items-center justify-center gap-6 mb-4">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Visiona Education Academy Logo" 
                className="w-20 h-20 object-contain"
              />
              <div className="text-left">
                <CardTitle className="text-3xl font-bold">VISIONA EDUCATION ACADEMY</CardTitle>
                <p className="text-lg">Coaching Centre for 3rd-5th Standard Competitive Exams</p>
                <p className="text-sm">Navodaya | Sainik | Morarji | Kittur | Alvas</p>
                <p className="text-sm mt-2 font-medium">16th Cross Vidyagiri Bagalkot</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              {/* General Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">General Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="admissionNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter admission number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="admissionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select admission type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">New Admission</SelectItem>
                              <SelectItem value="continuing">Continuing Student</SelectItem>
                              <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="studentPhoto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Photograph</FormLabel>
                        <FormControl>
                          <Input type="file" accept="image/*" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Student Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">Student Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd-MM-yyyy")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="class"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="3rd">3rd Standard</SelectItem>
                              <SelectItem value="4th">4th Standard</SelectItem>
                              <SelectItem value="5th">5th Standard</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aadhaarNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhaar Number</FormLabel>
                          <FormControl>
                            <Input placeholder="12-digit Aadhaar number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="currentSchool"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current School</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter current school name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Parent/Guardian Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">Parent/Guardian Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fatherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter father's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motherName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother's Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mother's name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fatherOccupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Father's Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter father's occupation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="motherOccupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mother's Occupation</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter mother's occupation" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="contactNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="10-digit number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="satsNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student SATS Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter SATS number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter complete street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pinCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PIN Code</FormLabel>
                          <FormControl>
                            <Input placeholder="6-digit PIN code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="landmark"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Landmark (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter nearby landmark" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lastYearPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Year Percentage</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100" 
                              placeholder="Enter percentage" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="gm">GM</SelectItem>
                              <SelectItem value="sc">SC</SelectItem>
                              <SelectItem value="st">ST</SelectItem>
                              <SelectItem value="obc">OBC</SelectItem>
                              <SelectItem value="others">Others</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subjectsWeakIn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subjects Weak In</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subjects you need help with" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="examsPreparingFor"
                    render={() => (
                      <FormItem>
                        <FormLabel>Exams Preparing For</FormLabel>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {['Navodaya', 'Sainik', 'Morarji', 'Kittur', 'Alvas'].map((exam) => (
                            <div key={exam} className="flex items-center space-x-2">
                              <Checkbox
                                id={exam}
                                checked={selectedExams.includes(exam)}
                                onCheckedChange={(checked) => handleExamChange(exam, checked as boolean)}
                              />
                              <Label htmlFor={exam}>{exam}</Label>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Documents Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">Documents Upload</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="previousMarksheet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Marksheet</FormLabel>
                          <FormControl>
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="aadhaarCard"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Aadhaar Card</FormLabel>
                          <FormControl>
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="incomeCertificate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Income Certificate</FormLabel>
                          <FormControl>
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="casteCertificate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caste Certificate</FormLabel>
                          <FormControl>
                            <Input type="file" accept=".pdf,.jpg,.jpeg,.png" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Fee Payment Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">Fee Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="paymentMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Mode</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="upi">UPI</SelectItem>
                              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="transactionId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Transaction ID</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter transaction ID" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amountPaid"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount Paid</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Enter amount" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Declarations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-700">Declarations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        ಎಲ್ಲಾ ನಿಗದಿಪಡಿಸಿದ ಶುಲ್ಕಗಳನ್ನು ಮುಂಗಡವಾಗಿ ಪಾವತಿಸಬೇಕು
                      </p>
                      <p className="text-sm text-gray-600">
                        All the prescribed fees should be paid in Advance
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        ಒಮ್ಮೆ ಪಾವತಿಸಿದ ಶುಲ್ಕವನ್ನು ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಹಿಂತಿರುಗಿಸಲು / ವರ್ಗಾಯಿಸಲು ಅವಕಾಶವಿಲ್ಲ
                      </p>
                      <p className="text-sm text-gray-600">
                        Fees Once paid shall not be refunded or transferred under any circumstances.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-800">
                        ನಾನು ನಿಮ್ಮ ಸಂಸ್ಥೆಯ ನಿಯಮಗಳು ಮತ್ತು ನಿಬಂಧನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಎಂದು ಇಲ್ಲಿ ಘೋಷಿಸುತ್ತೇನೆ
                      </p>
                      <p className="text-sm text-gray-600">
                        I hereby declare that I have understood the rules and regulations of your Institution.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-800">
                      I hereby declare that all information provided is true to the best of my knowledge.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="place"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Place</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter place" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="declarationDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd-MM-yyyy")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-center gap-4 pb-8">
                <Button 
                  type="button"
                  onClick={downloadPDF}
                  variant="outline" 
                  size="lg" 
                  className="bg-white text-gray-600 border-gray-600 hover:bg-gray-50 px-12 py-3 text-lg font-semibold"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <Button 
                  type="submit" 
                  size="lg" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-12 py-3 text-lg font-semibold"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>

            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Index;
