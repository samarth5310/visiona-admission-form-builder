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
  dateOfBirth: z.date({
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
  declarationDate: z.date({
    required_error: "A date of birth is required.",
  }),
  studentPhoto: z.array(z.any()).optional(),
  previousMarksheet: z.array(z.any()).optional(),
  aadhaarCard: z.array(z.any()).optional(),
  incomeCertificate: z.array(z.any()).optional(),
  casteCertificate: z.array(z.any()).optional(),
})

const Index = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      dateOfBirth: new Date(),
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
      declarationDate: new Date(),
      studentPhoto: [],
      previousMarksheet: [],
      aadhaarCard: [],
      incomeCertificate: [],
      casteCertificate: [],
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values)
  }

  const isSubmitting = form.formState.isSubmitting;

  const downloadPDF = () => {
    alert('downloaded')
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 bg-white border-4 border-gray-300 rounded-lg shadow-lg">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-500 pb-6 mb-8 bg-gray-200 rounded-lg p-6">
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* General Information with Photo Display */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">General Information</h2>
              <div className="flex gap-6">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Admission Number */}
                  <FormField
                    control={form.control}
                    name="admissionNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700">Admission Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter admission number" 
                            {...field} 
                            className="border-gray-300"
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
                        <FormLabel className="text-gray-700">Admission Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-gray-300">
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
                </div>

                {/* Student Photo Display Box */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-100 overflow-hidden">
                    {form.watch('studentPhoto')?.[0] && createSafeObjectURL(form.watch('studentPhoto')[0]) ? (
                      <img 
                        src={createSafeObjectURL(form.watch('studentPhoto')[0])} 
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
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Student Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Date of Birth</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="border-gray-300"
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
                      <FormLabel className="text-gray-700">Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-gray-300">
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
                      <FormLabel className="text-gray-700">Class</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter class" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Current School</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter current school" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Aadhaar Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Aadhaar number" {...field} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Parent/Guardian Information */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Parent/Guardian Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fatherName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Father's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's name" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Mother's Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's name" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Father's Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter father's occupation" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Mother's Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mother's occupation" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter contact number" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">SATS Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SATS number" {...field} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Address</h2>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="streetAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Street Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter street address" {...field} className="border-gray-300" />
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
                        <FormLabel className="text-gray-700">City</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city" {...field} className="border-gray-300" />
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
                        <FormLabel className="text-gray-700">State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} className="border-gray-300" />
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
                        <FormLabel className="text-gray-700">PIN Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter PIN code" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Landmark (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter landmark" {...field} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="lastYearPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Last Year Percentage</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter percentage" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category" {...field} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subjectsWeakIn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Subjects Weak In</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter subjects" {...field} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="examsPreparingFor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Exams Preparing For</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange([...field.value || [], value])}
                        defaultValue={field.value}
                        multiple
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder="Select exams" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="navodaya">Navodaya</SelectItem>
                          <SelectItem value="sainik">Sainik</SelectItem>
                          <SelectItem value="morarji">Morarji</SelectItem>
                          <SelectItem value="kittur">Kittur</SelectItem>
                          <SelectItem value="alvas">Alvas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Fee Payment Details */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Fee Payment Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="paymentMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Payment Mode</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter payment mode" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Transaction ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter transaction ID" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Amount Paid</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter amount paid" {...field} className="border-gray-300" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Upload Documents */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Upload Documents</h2>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="studentPhoto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Student Photo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(Array.from(e.target.files));
                            }
                          }}
                          className="border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousMarksheet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Previous Marksheet</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(Array.from(e.target.files));
                            }
                          }}
                          className="border-gray-300"
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
                      <FormLabel className="text-gray-700">Aadhaar Card</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(Array.from(e.target.files));
                            }
                          }}
                          className="border-gray-300"
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
                      <FormLabel className="text-gray-700">Income Certificate</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(Array.from(e.target.files));
                            }
                          }}
                          className="border-gray-300"
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
                      <FormLabel className="text-gray-700">Caste Certificate</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files) {
                              field.onChange(Array.from(e.target.files));
                            }
                          }}
                          className="border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Declarations */}
            <div className="bg-gray-50 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2">Declarations</h2>
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Place</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter place" {...field} className="border-gray-300" />
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
                      <FormLabel className="text-gray-700">Declaration Date</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="border-gray-300"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center gap-4 pb-8">
              <PDFPreview formData={form.getValues()} />
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
                className="bg-gray-600 hover:bg-gray-700 text-white px-12 py-3 text-lg font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Index;
