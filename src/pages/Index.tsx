
import React from 'react';
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Download } from 'lucide-react';
import PDFPreview from '@/components/PDFPreview';

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
  aadhaarNumber: z.string().optional(),
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
  studentPhoto: z.instanceof(File).optional(),
  previousMarksheet: z.instanceof(File).optional(),
  aadhaarCard: z.instanceof(File).optional(),
  incomeCertificate: z.instanceof(File).optional(),
  casteCertificate: z.instanceof(File).optional(),
})

const Index = () => {
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
      state: "",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  const isSubmitting = form.formState.isSubmitting;

  const downloadPDF = () => {
    const studentName = form.getValues('fullName') || 'student';
    const fileName = `${studentName.replace(/\s+/g, '_')}_application.pdf`;
    console.log(`Downloading PDF as: ${fileName}`);
    alert(`PDF would be downloaded as: ${fileName}`);
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

  const examOptions = [
    { id: "navodaya", label: "Navodaya" },
    { id: "sainik", label: "Sainik" },
    { id: "morarji", label: "Morarji" },
    { id: "kittur", label: "Kittur" },
    { id: "alvas", label: "Alvas" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
      <div className="max-w-4xl mx-auto py-4 sm:py-6 bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-lg p-3 sm:p-6 mx-2 sm:mx-0">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Visiona Education Academy Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
            />
            <div className="text-center">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">VISIONA EDUCATION ACADEMY</h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-700">Coaching Centre for 3rd-5th Standard Competitive Exams</p>
              <p className="text-xs sm:text-sm text-gray-600">Navodaya | Sainik | Morarji | Kittur | Alvas</p>
              <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">16th Cross Vidyagiri Bagalkot</p>
            </div>
          </div>
        </div>

        <div className="px-2 sm:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              {/* General Information with Photo Display */}
              <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">General Information</h2>
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {/* Admission Number */}
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

                    {/* Admission Type */}
                    <FormField
                      control={form.control}
                      name="admissionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 text-sm sm:text-base">Admission Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 text-sm sm:text-base">
                                <SelectValue placeholder="Select admission type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">New Admission</SelectItem>
                              <SelectItem value="renewal">Renewal</SelectItem>
                              <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Student Photo Upload Field */}
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
                                  field.onChange(e.target.files[0]);
                                }
                              }}
                              className="border-gray-300 text-sm sm:text-base"
                            />
                          </FormControl>
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
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Student Information</h2>
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
                            <SelectTrigger className="border-gray-300 text-sm sm:text-base">
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
                        <FormLabel className="text-gray-700 text-sm sm:text-base">Class</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter class" {...field} className="border-gray-300 text-sm sm:text-base" />
                        </FormControl>
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
                        <FormLabel className="text-gray-700 text-sm sm:text-base">Aadhaar Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter Aadhaar number" {...field} className="border-gray-300 text-sm sm:text-base" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Parent/Guardian Information</h2>
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
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Address</h2>
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
                          <FormControl>
                            <Input placeholder="Enter state" {...field} className="border-gray-300 text-sm sm:text-base" />
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
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Academic Information</h2>
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
                        <FormControl>
                          <Input placeholder="Enter category" {...field} className="border-gray-300 text-sm sm:text-base" />
                        </FormControl>
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
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Fee Payment Details</h2>
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

              {/* Upload Documents */}
              <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Upload Documents</h2>
                <div className="grid grid-cols-1 gap-3 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="previousMarksheet"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-sm sm:text-base">Previous Marksheet</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                field.onChange(e.target.files[0]);
                              }
                            }}
                            className="border-gray-300 text-sm sm:text-base"
                          />
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
                        <FormLabel className="text-gray-700 text-sm sm:text-base">Aadhaar Card</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                field.onChange(e.target.files[0]);
                              }
                            }}
                            className="border-gray-300 text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="incomeCertificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 text-sm sm:text-base">Income Certificate</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                field.onChange(e.target.files[0]);
                              }
                            }}
                            className="border-gray-300 text-sm sm:text-base"
                          />
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
                        <FormLabel className="text-gray-700 text-sm sm:text-base">Caste Certificate</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                field.onChange(e.target.files[0]);
                              }
                            }}
                            className="border-gray-300 text-sm sm:text-base"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Declarations */}
              <div className="bg-gray-50 p-3 sm:p-6 rounded-lg border">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 border-b border-gray-300 pb-2">Declarations</h2>
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
  );
};

export default Index;
