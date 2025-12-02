import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();

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
    <div className={`min-h-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              New Admission
            </h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Enter student details for new admission
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

              {/* Admission Details & Photo */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                  Admission Details
                </h3>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="admissionNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Admission Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter admission number" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                          <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Admission Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}>
                                <SelectValue placeholder="Select admission type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}>
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
                          <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Student Photo</FormLabel>
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
                              className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}
                            />
                          </FormControl>
                          <FormDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                            Maximum file size: 50KB
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Student Photo Display Box */}
                  <div className="flex-shrink-0 self-center lg:self-start">
                    <div className={`w-24 h-24 border-2 rounded-lg flex items-center justify-center overflow-hidden mx-auto lg:mx-0 ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'}`}>
                      {form.watch('studentPhoto') && createSafeObjectURL(form.watch('studentPhoto')) ? (
                        <img
                          src={createSafeObjectURL(form.watch('studentPhoto'))}
                          alt="Student"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`text-xs text-center p-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Student Photo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Student Information */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                  Student Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}>
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Class</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}>
                              <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}>
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Current School</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter current school" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Aadhaar Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 12-digit Aadhaar number" {...field} maxLength={12} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                  Parent/Guardian Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Father's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter father's name" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Mother's Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mother's name" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Father's Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter father's occupation" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Mother's Occupation</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter mother's occupation" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact number" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>SATS Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter SATS number" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Address */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                  Address
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="streetAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter street address" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                          <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>State</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}>
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
                          <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>PIN Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter PIN code" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Landmark (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter landmark" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Academic Information */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="lastYearPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Last Year Percentage</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter percentage" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'}>
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Subjects Weak In</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter subjects" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Exams Preparing For</FormLabel>
                        <FormDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          Select all exams you are preparing for
                        </FormDescription>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
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
                                className={isDarkMode ? 'border-gray-500' : 'border-gray-300'}
                              />
                              <label htmlFor={exam.id} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                  Fee Payment Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentMode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Payment Mode</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter payment mode" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Transaction ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter transaction ID" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Amount Paid</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter amount paid" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Declarations */}
              <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h3 className={`text-xl font-semibold mb-4 border-b pb-2 ${isDarkMode ? 'text-white border-gray-700' : 'text-gray-700 border-gray-200'}`}>
                  Declarations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="place"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Place</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter place" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
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
                        <FormLabel className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Declaration Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} className={isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-center gap-4 pb-8">
                <PDFPreview formData={form.getValues()} />
                <Button
                  type="button"
                  onClick={downloadPDF}
                  variant="outline"
                  size="lg"
                  className={`px-8 py-3 text-base font-semibold w-full sm:w-auto ${isDarkMode ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : 'bg-white text-gray-600 border-gray-600 hover:bg-gray-50'}`}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download PDF
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className={`px-8 py-3 text-base font-semibold w-full sm:w-auto ${isDarkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
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
  );
};

export default Admission;
