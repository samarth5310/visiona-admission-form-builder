import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, User, GraduationCap, CreditCard, FileText, Phone, Mail } from "lucide-react";
import Navigation from "@/components/Navigation";
import FeesManagement from "@/components/FeesManagement";

const Index = () => {
  const [activeSection, setActiveSection] = useState('admission');
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    fatherName: "",
    motherName: "",
    fatherOccupation: "",
    motherOccupation: "",
    contactNumber: "",
    email: "",
    satsNumber: "",
    aadhaarNumber: "",
    dateOfBirth: "",
    gender: "",
    currentSchool: "",
    class: "",
    lastYearPercentage: "",
    streetAddress: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
    category: "",
    examsPreparingFor: [] as string[],
    subjectsWeakIn: "",
    paymentMode: "",
    amountPaid: "",
    transactionId: "",
    place: "",
    declarationDate: ""
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExamChange = (exam: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      examsPreparingFor: checked 
        ? [...prev.examsPreparingFor, exam]
        : prev.examsPreparingFor.filter(e => e !== exam)
    }));
  };

  const generateAdmissionNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `VIS${year}${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const admissionNumber = generateAdmissionNumber();
      
      const { data, error } = await supabase
        .from('applications')
        .insert({
          admission_number: admissionNumber,
          admission_type: 'New Admission',
          full_name: formData.fullName,
          father_name: formData.fatherName,
          mother_name: formData.motherName,
          father_occupation: formData.fatherOccupation,
          mother_occupation: formData.motherOccupation,
          contact_number: formData.contactNumber,
          email: formData.email,
          sats_number: formData.satsNumber,
          aadhaar_number: formData.aadhaarNumber,
          date_of_birth: formData.dateOfBirth,
          gender: formData.gender,
          current_school: formData.currentSchool,
          class: formData.class,
          last_year_percentage: parseFloat(formData.lastYearPercentage),
          street_address: formData.streetAddress,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pinCode,
          landmark: formData.landmark,
          category: formData.category,
          exams_preparing_for: formData.examsPreparingFor,
          subjects_weak_in: formData.subjectsWeakIn,
          payment_mode: formData.paymentMode,
          amount_paid: parseFloat(formData.amountPaid),
          transaction_id: formData.transactionId,
          place: formData.place,
          declaration_date: formData.declarationDate
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Application Submitted Successfully!",
        description: `Your admission number is: ${admissionNumber}`,
      });

      // Reset form
      setFormData({
        fullName: "",
        fatherName: "",
        motherName: "",
        fatherOccupation: "",
        motherOccupation: "",
        contactNumber: "",
        email: "",
        satsNumber: "",
        aadhaarNumber: "",
        dateOfBirth: "",
        gender: "",
        currentSchool: "",
        class: "",
        lastYearPercentage: "",
        streetAddress: "",
        city: "",
        state: "",
        pinCode: "",
        landmark: "",
        category: "",
        examsPreparingFor: [],
        subjectsWeakIn: "",
        paymentMode: "",
        amountPaid: "",
        transactionId: "",
        place: "",
        declarationDate: ""
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/lovable-uploads/60b569e4-862b-4ff6-8f40-7aea15908296.png" 
              alt="Visiona Academy Logo" 
              className="h-24 w-auto mr-4"
            />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">VISIONA ACADEMY</h1>
              <p className="text-lg text-gray-600">Excellence in Education</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />

        {/* Content */}
        {activeSection === 'admission' ? (
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold text-center">Student Admission Form</CardTitle>
              <CardDescription className="text-center text-purple-100">
                Please fill in all the required information accurately
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-5 mb-8">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Personal
                    </TabsTrigger>
                    <TabsTrigger value="academic" className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Academic
                    </TabsTrigger>
                    <TabsTrigger value="address" className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Address
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Preferences
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Information Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full Name *</Label>
                        <Input
                          id="fullName"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fatherName" className="text-sm font-medium text-gray-700">Father's Name *</Label>
                        <Input
                          id="fatherName"
                          placeholder="Enter father's name"
                          value={formData.fatherName}
                          onChange={(e) => handleInputChange('fatherName', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="motherName" className="text-sm font-medium text-gray-700">Mother's Name *</Label>
                        <Input
                          id="motherName"
                          placeholder="Enter mother's name"
                          value={formData.motherName}
                          onChange={(e) => handleInputChange('motherName', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fatherOccupation" className="text-sm font-medium text-gray-700">Father's Occupation *</Label>
                        <Input
                          id="fatherOccupation"
                          placeholder="Enter father's occupation"
                          value={formData.fatherOccupation}
                          onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="motherOccupation" className="text-sm font-medium text-gray-700">Mother's Occupation *</Label>
                        <Input
                          id="motherOccupation"
                          placeholder="Enter mother's occupation"
                          value={formData.motherOccupation}
                          onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactNumber" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Contact Number *
                        </Label>
                        <Input
                          id="contactNumber"
                          placeholder="Enter contact number"
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter email address"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="satsNumber" className="text-sm font-medium text-gray-700">SATS Number *</Label>
                        <Input
                          id="satsNumber"
                          placeholder="Enter SATS number"
                          value={formData.satsNumber}
                          onChange={(e) => handleInputChange('satsNumber', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="aadhaarNumber" className="text-sm font-medium text-gray-700">Aadhaar Number *</Label>
                        <Input
                          id="aadhaarNumber"
                          placeholder="Enter Aadhaar number"
                          value={formData.aadhaarNumber}
                          onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Date of Birth *
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Gender *</Label>
                        <RadioGroup 
                          value={formData.gender} 
                          onValueChange={(value) => handleInputChange('gender', value)}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Other</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Academic Information Tab */}
                  <TabsContent value="academic" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentSchool" className="text-sm font-medium text-gray-700">Current School *</Label>
                        <Input
                          id="currentSchool"
                          placeholder="Enter current school name"
                          value={formData.currentSchool}
                          onChange={(e) => handleInputChange('currentSchool', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="class" className="text-sm font-medium text-gray-700">Class *</Label>
                        <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                          <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8">8th</SelectItem>
                            <SelectItem value="9">9th</SelectItem>
                            <SelectItem value="10">10th</SelectItem>
                            <SelectItem value="11">11th</SelectItem>
                            <SelectItem value="12">12th</SelectItem>
                            <SelectItem value="12-pass">12th Pass</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="lastYearPercentage" className="text-sm font-medium text-gray-700">Last Year Percentage *</Label>
                        <Input
                          id="lastYearPercentage"
                          type="number"
                          placeholder="Enter percentage"
                          value={formData.lastYearPercentage}
                          onChange={(e) => handleInputChange('lastYearPercentage', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Address Information Tab */}
                  <TabsContent value="address" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="streetAddress" className="text-sm font-medium text-gray-700">Street Address *</Label>
                        <Textarea
                          id="streetAddress"
                          placeholder="Enter complete address"
                          value={formData.streetAddress}
                          onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">City *</Label>
                        <Input
                          id="city"
                          placeholder="Enter city"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">State *</Label>
                        <Input
                          id="state"
                          placeholder="Enter state"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pinCode" className="text-sm font-medium text-gray-700">PIN Code *</Label>
                        <Input
                          id="pinCode"
                          placeholder="Enter PIN code"
                          value={formData.pinCode}
                          onChange={(e) => handleInputChange('pinCode', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="landmark" className="text-sm font-medium text-gray-700">Landmark</Label>
                        <Input
                          id="landmark"
                          placeholder="Enter nearby landmark"
                          value={formData.landmark}
                          onChange={(e) => handleInputChange('landmark', e.target.value)}
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Preferences Tab */}
                  <TabsContent value="preferences" className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="obc">OBC</SelectItem>
                            <SelectItem value="sc">SC</SelectItem>
                            <SelectItem value="st">ST</SelectItem>
                            <SelectItem value="ews">EWS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-medium text-gray-700">Exams Preparing For *</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {['JEE MAIN', 'JEE ADVANCED', 'NEET', 'BITSAT', 'WBJEE', 'MHT CET', 'KCET', 'EAMCET', 'Board Exams'].map((exam) => (
                            <div key={exam} className="flex items-center space-x-2">
                              <Checkbox
                                id={exam}
                                checked={formData.examsPreparingFor.includes(exam)}
                                onCheckedChange={(checked) => handleExamChange(exam, !!checked)}
                              />
                              <Label htmlFor={exam} className="text-sm">{exam}</Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subjectsWeakIn" className="text-sm font-medium text-gray-700">Subjects Weak In</Label>
                        <Textarea
                          id="subjectsWeakIn"
                          placeholder="Mention subjects you need help with"
                          value={formData.subjectsWeakIn}
                          onChange={(e) => handleInputChange('subjectsWeakIn', e.target.value)}
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  {/* Payment Information Tab */}
                  <TabsContent value="payment" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="paymentMode" className="text-sm font-medium text-gray-700">Payment Mode *</Label>
                        <Select value={formData.paymentMode} onValueChange={(value) => handleInputChange('paymentMode', value)}>
                          <SelectTrigger className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20">
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="online">Online Payment</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                            <SelectItem value="dd">Demand Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amountPaid" className="text-sm font-medium text-gray-700">Amount Paid *</Label>
                        <Input
                          id="amountPaid"
                          type="number"
                          placeholder="Enter amount"
                          value={formData.amountPaid}
                          onChange={(e) => handleInputChange('amountPaid', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionId" className="text-sm font-medium text-gray-700">Transaction ID *</Label>
                        <Input
                          id="transactionId"
                          placeholder="Enter transaction ID"
                          value={formData.transactionId}
                          onChange={(e) => handleInputChange('transactionId', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="place" className="text-sm font-medium text-gray-700">Place *</Label>
                        <Input
                          id="place"
                          placeholder="Enter place"
                          value={formData.place}
                          onChange={(e) => handleInputChange('place', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="declarationDate" className="text-sm font-medium text-gray-700">Declaration Date *</Label>
                        <Input
                          id="declarationDate"
                          type="date"
                          value={formData.declarationDate}
                          onChange={(e) => handleInputChange('declarationDate', e.target.value)}
                          required
                          className="border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-center">
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 text-lg"
                  >
                    Submit Application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <FeesManagement />
        )}
      </div>
    </div>
  );
};

export default Index;
