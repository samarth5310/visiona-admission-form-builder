import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, FileText } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PDFPreview from '@/components/PDFPreview';
import { useAuth } from '@/contexts/AuthContext';

const MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes

const formSchema = z.object({
  admissionNumber: z.string().optional(),
  admissionType: z.string().optional(),
  fullName: z.string().min(2, {
    message: "Full Name must be at least 2 characters.",
  }),
  dateOfBirth: z.string({
    required_error: "A date of birth is required.",
  }),
  gender: z.string().optional(),
  class: z.string().optional(),
  currentSchool: z.string().optional(),
  aadhaarNumber: z.string().min(12, {
    message: "Aadhaar number must be exactly 12 digits.",
  }).max(12, {
    message: "Aadhaar number must be exactly 12 digits.",
  }).regex(/^\d{12}$/, {
    message: "Aadhaar number must contain only 12 digits.",
  }),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherOccupation: z.string().optional(),
  contactNumber: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email.",
  }),
  satsNumber: z.string().optional(),
  streetAddress: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  landmark: z.string().optional(),
  lastYearPercentage: z.string().optional(),
  category: z.string().optional(),
  subjectsWeakIn: z.string().optional(),
  examsPreparingFor: z.array(z.string()).optional(),
  paymentMode: z.string().optional(),
  transactionId: z.string().optional(),
  amountPaid: z.string().optional(),
  place: z.string().optional(),
  declarationDate: z.string({
    required_error: "A declaration date is required.",
  }),
  studentPhoto: z.instanceof(File).optional().refine((file) => {
    if (!file) return true;
    return file.size <= MAX_FILE_SIZE;
  }, "Student photo must be less than 50KB"),
})

const Admission = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const adminName = user?.name || 'Admin';
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: new Date().toISOString().split('T')[0],
      gender: "",
      class: "",
      currentSchool: "",
      aadhaarNumber: "",
      fatherName: "",
      motherName: "",
      fatherOccupation: "",
      motherOccupation: "",
      contactNumber: "",
      email: "",
      satsNumber: "",
      streetAddress: "",
      city: "",
      state: "Karnataka",
      pinCode: "",
      landmark: "",
      lastYearPercentage: "",
      category: "",
      subjectsWeakIn: "",
      examsPreparingFor: [],
      paymentMode: "",
      transactionId: "",
      amountPaid: "",
      place: "",
      declarationDate: new Date().toISOString().split('T')[0],
    },
  })

  const validateFileSize = (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: `File size must be less than 50KB. Current file is ${Math.round(file.size / 1024)}KB.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('Starting form submission with values:', values);
      
      const applicationData = {
        admission_number: values.admissionNumber || '',
        admission_type: values.admissionType || '',
        full_name: values.fullName,
        date_of_birth: values.dateOfBirth,
        gender: values.gender || '',
        class: values.class || '',
        current_school: values.currentSchool || '',
        aadhaar_number: values.aadhaarNumber,
        father_name: values.fatherName || '',
        mother_name: values.motherName || '',
        father_occupation: values.fatherOccupation || '',
        mother_occupation: values.motherOccupation || '',
        contact_number: values.contactNumber || '',
        email: values.email,
        sats_number: values.satsNumber || '',
        street_address: values.streetAddress || '',
        city: values.city || '',
        state: values.state || '',
        pin_code: values.pinCode || '',
        landmark: values.landmark || null,
        last_year_percentage: parseFloat(values.lastYearPercentage || '0'),
        category: values.category || '',
        subjects_weak_in: values.subjectsWeakIn || null,
        exams_preparing_for: values.examsPreparingFor || [],
        payment_mode: values.paymentMode || '',
        transaction_id: values.transactionId || '',
        amount_paid: parseFloat(values.amountPaid || '0'),
        place: values.place || '',
        declaration_date: values.declarationDate,
      };

      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert([applicationData])
        .select()
        .single();

      if (applicationError) {
        throw new Error(`Failed to save application: ${applicationError.message}`);
      }

      if (values.studentPhoto && values.studentPhoto instanceof File) {
        const fileName = `${application.id}/student_photo_${Date.now()}_${values.studentPhoto.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('application-documents')
          .upload(fileName, values.studentPhoto);

        if (uploadError) {
          throw new Error(`Failed to upload student photo: ${uploadError.message}`);
        }

        const { error: docError } = await supabase
          .from('application_documents')
          .insert({
            application_id: application.id,
            document_type: 'student_photo',
            file_name: values.studentPhoto.name,
            file_path: uploadData.path
          });

        if (docError) {
          throw new Error(`Failed to save document record for student photo: ${docError.message}`);
        }
      }

      toast({
        title: "Success!",
        description: `Application submitted successfully!`,
      });

      form.reset();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  }

  const downloadPDF = async () => {
    try {
      const formData = form.getValues();
      
      if (!formData.fullName.trim()) {
        toast({
          title: "Missing Information",
          description: "Please fill in at least the student's full name before downloading PDF.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "PDF Download",
        description: "Use the Preview PDF button to view and download your application form.",
      });
      
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: "Error",
        description: "Failed to prepare PDF download. Please try again.",
        variant: "destructive",
      });
    }
  };

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

  const examOptions = [
    { id: "navodaya", label: "Navodaya" },
    { id: "sainik", label: "Sainik" },
    { id: "morarji", label: "Morarji" },
    { id: "kittur", label: "Kittur" },
    { id: "alvas", label: "Alvas" },
  ];

  const isSubmitting = form.formState.isSubmitting;

  return (
    <>
      <Navigation activeSection="admission" onSectionChange={() => {}} />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="w-full">
          {/* Welcome Section */}
          <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Welcome, {adminName}
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Admission Management System - Student Registration and Application Processing
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gradient-to-r from-gray-100 to-gray-200 rounded-t-2xl p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
                  <img 
                    src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                    alt="Visiona Education Academy Logo" 
                    className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
                  />
                  <div className="text-center">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">VISIONA EDUCATION ACADEMY</h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-700">Coaching Centre for 3rd-5th Standard Competitive Exams</p>
                    <p className="text-xs sm:text-sm text-gray-600">Navodaya | Sainik | Morarji | Kittur | Alvas</p>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">16th Cross Vidyagiri Bagalkot</p>
                  </div>
                </div>
              </div>

              <div className="px-2 sm:px-6 pb-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                    {/* General Information with Photo */}
                    <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">General Information</h3>
                      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <FormField
                            control={form.control}
                            name="admissionNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 text-sm sm:text-base">Admission Number</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Enter admission number" 
                                    {...field} 
                                    className="border-gray-300 text-sm sm:text-base"
                                  />
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
                                <FormLabel className="text-gray-700 text-sm sm:text-base">Admission Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-gray-300 text-sm sm:text-base bg-white">
                                      <SelectValue placeholder="Select admission type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                                    <SelectItem value="residential">Residential</SelectItem>
                                    <SelectItem value="local">Local</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="studentPhoto"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel className="text-gray-700 text-sm sm:text-base">Student Photo</FormLabel>
                                <FormControl>
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        if (validateFileSize(file)) {
                                          field.onChange(file);
                                        } else {
                                          e.target.value = '';
                                        }
                                      }
                                    }}
                                    className="border-gray-300 text-sm sm:text-base"
                                  />
                                </FormControl>
                                <FormDescription className="text-xs text-gray-500">
                                  Maximum file size: 50KB
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Student Photo Display Box */}
                        <div className="flex-shrink-0 self-center lg:self-start">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden mx-auto lg:mx-0">
                            {form.watch('studentPhoto') && createSafeObjectURL(form.watch('studentPhoto')) ? (
                              <img 
                                src={createSafeObjectURL(form.watch('studentPhoto'))} 
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
                    <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Student Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter full name" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dateOfBirth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Date of Birth</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="border-gray-300 text-sm sm:text-base"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Gender</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-gray-300 text-sm sm:text-base bg-white">
                                    <SelectValue placeholder="Select gender" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
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
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Class</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-gray-300 text-sm sm:text-base bg-white">
                                    <SelectValue placeholder="Select class" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
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
                          name="currentSchool"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Current School</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter current school" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="aadhaarNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Aadhaar Number *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter 12-digit Aadhaar number" 
                                  {...field} 
                                  className="border-gray-300 text-sm sm:text-base"
                                  maxLength={12}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Parent/Guardian Information */}
                    <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Parent/Guardian Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name="fatherName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Father's Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter father's name" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Mother's Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter mother's name" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="fatherOccupation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Father's Occupation</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter father's occupation" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Mother's Occupation</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter mother's occupation" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contactNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Contact Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter contact number" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter email" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="satsNumber"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="text-gray-700 text-sm sm:text-base">SATS Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter SATS number" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Address</h3>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name="streetAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter street address" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 text-sm sm:text-base">City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter city" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                                <FormLabel className="text-gray-700 text-sm sm:text-base">State</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="border-gray-300 text-sm sm:text-base bg-white">
                                      <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                                    <SelectItem value="Karnataka">Karnataka</SelectItem>
                                    <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                                    <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                    <SelectItem value="Kerala">Kerala</SelectItem>
                                    <SelectItem value="Telangana">Telangana</SelectItem>
                                    <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                    <SelectItem value="Goa">Goa</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="pinCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-700 text-sm sm:text-base">PIN Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter PIN code" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Landmark (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter landmark" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Academic Information</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name="lastYearPercentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Last Year Percentage</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter percentage" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="border-gray-300 text-sm sm:text-base bg-white">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white border border-gray-300 shadow-lg z-50">
                                  <SelectItem value="general">General</SelectItem>
                                  <SelectItem value="obc">OBC</SelectItem>
                                  <SelectItem value="sc">SC</SelectItem>
                                  <SelectItem value="st">ST</SelectItem>
                                  <SelectItem value="ews">EWS</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subjectsWeakIn"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Subjects Weak In</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter subjects" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="examsPreparingFor"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Exams Preparing For</FormLabel>
                              <FormDescription className="text-xs sm:text-sm">
                                Select all exams you are preparing for
                              </FormDescription>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                                {examOptions.map((exam) => (
                                  <div key={exam.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={exam.id}
                                      checked={field.value?.includes(exam.id)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        if (checked) {
                                          field.onChange([...currentValue, exam.id]);
                                        } else {
                                          field.onChange(currentValue.filter((value) => value !== exam.id));
                                        }
                                      }}
                                    />
                                    <label htmlFor={exam.id} className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                      {exam.label}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Fee Payment Details */}
                    <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Fee Payment Details</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name="paymentMode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Payment Mode</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter payment mode" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="transactionId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Transaction ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter transaction ID" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Amount Paid</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter amount paid" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Declarations */}
                    <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Declarations</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <FormField
                          control={form.control}
                          name="place"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Place</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter place" {...field} className="border-gray-300 text-sm sm:text-base" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="declarationDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-700 text-sm sm:text-base">Declaration Date</FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  {...field}
                                  className="border-gray-300 text-sm sm:text-base"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pb-6 sm:pb-8">
                      <PDFPreview formData={form.getValues()} />
                      <Button 
                        type="button"
                        onClick={downloadPDF}
                        variant="outline" 
                        size="lg" 
                        className="bg-white text-gray-600 border-gray-600 hover:bg-gray-50 px-8 sm:px-12 py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                      >
                        <Download className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Download PDF
                      </Button>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="bg-gray-600 hover:bg-gray-700 text-white px-8 sm:px-12 py-3 text-base sm:text-lg font-semibold w-full sm:w-auto"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Application"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admission;
