
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Save } from 'lucide-react';

const AdmissionForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    father_name: '',
    mother_name: '',
    contact_number: '',
    email: '',
    aadhaar_number: '',
    street_address: '',
    city: '',
    state: '',
    pin_code: '',
    current_school: '',
    class: '',
    last_year_percentage: '',
    category: '',
    admission_type: '',
    exams_preparing_for: [],
    subjects_weak_in: '',
    payment_mode: '',
    amount_paid: '',
    transaction_id: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleExamChange = (exam: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      exams_preparing_for: checked 
        ? [...prev.exams_preparing_for, exam]
        : prev.exams_preparing_for.filter(e => e !== exam)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate admission number
      const admissionNumber = `VEA${Date.now()}`;
      
      const { error } = await supabase
        .from('applications')
        .insert({
          ...formData,
          admission_number: admissionNumber,
          declaration_date: new Date().toISOString().split('T')[0],
          father_occupation: 'Not specified',
          mother_occupation: 'Not specified',
          sats_number: 'Not applicable',
          landmark: '',
          place: formData.city,
          last_year_percentage: parseFloat(formData.last_year_percentage) || 0,
          amount_paid: parseFloat(formData.amount_paid) || 0
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application submitted successfully! Admission Number: ${admissionNumber}`,
      });

      // Reset form
      setFormData({
        full_name: '',
        date_of_birth: '',
        gender: '',
        father_name: '',
        mother_name: '',
        contact_number: '',
        email: '',
        aadhaar_number: '',
        street_address: '',
        city: '',
        state: '',
        pin_code: '',
        current_school: '',
        class: '',
        last_year_percentage: '',
        category: '',
        admission_type: '',
        exams_preparing_for: [],
        subjects_weak_in: '',
        payment_mode: '',
        amount_paid: '',
        transaction_id: ''
      });

    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <FileText className="h-6 w-6" />
            Student Admission Form
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <Select onValueChange={(value) => handleInputChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="aadhaar_number">Aadhaar Number *</Label>
                <Input
                  id="aadhaar_number"
                  value={formData.aadhaar_number}
                  onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Parent Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="father_name">Father's Name *</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => handleInputChange('father_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="mother_name">Mother's Name *</Label>
                <Input
                  id="mother_name"
                  value={formData.mother_name}
                  onChange={(e) => handleInputChange('mother_name', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="contact_number">Contact Number *</Label>
                <Input
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={(e) => handleInputChange('contact_number', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="street_address">Street Address *</Label>
                <Input
                  id="street_address"
                  value={formData.street_address}
                  onChange={(e) => handleInputChange('street_address', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pin_code">Pin Code *</Label>
                  <Input
                    id="pin_code"
                    value={formData.pin_code}
                    onChange={(e) => handleInputChange('pin_code', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="current_school">Current School *</Label>
                <Input
                  id="current_school"
                  value={formData.current_school}
                  onChange={(e) => handleInputChange('current_school', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="class">Class *</Label>
                <Select onValueChange={(value) => handleInputChange('class', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="8th">8th</SelectItem>
                    <SelectItem value="9th">9th</SelectItem>
                    <SelectItem value="10th">10th</SelectItem>
                    <SelectItem value="11th">11th</SelectItem>
                    <SelectItem value="12th">12th</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="last_year_percentage">Last Year Percentage *</Label>
                <Input
                  id="last_year_percentage"
                  type="number"
                  value={formData.last_year_percentage}
                  onChange={(e) => handleInputChange('last_year_percentage', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="obc">OBC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Exams Preparing For */}
            <div>
              <Label>Exams Preparing For *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {['JEE', 'NEET', 'CET', 'COMEDK'].map((exam) => (
                  <div key={exam} className="flex items-center space-x-2">
                    <Checkbox
                      id={exam}
                      checked={formData.exams_preparing_for.includes(exam)}
                      onCheckedChange={(checked) => handleExamChange(exam, checked as boolean)}
                    />
                    <Label htmlFor={exam}>{exam}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="subjects_weak_in">Subjects Weak In</Label>
              <Textarea
                id="subjects_weak_in"
                value={formData.subjects_weak_in}
                onChange={(e) => handleInputChange('subjects_weak_in', e.target.value)}
                placeholder="List subjects you need help with..."
              />
            </div>

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="payment_mode">Payment Mode *</Label>
                <Select onValueChange={(value) => handleInputChange('payment_mode', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount_paid">Amount Paid *</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => handleInputChange('amount_paid', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="transaction_id">Transaction ID</Label>
              <Input
                id="transaction_id"
                value={formData.transaction_id}
                onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                placeholder="For online payments"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdmissionForm;
