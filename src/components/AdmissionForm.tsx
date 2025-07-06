
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Phone, Mail, MapPin, GraduationCap, FileText, CreditCard } from 'lucide-react';

const AdmissionForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    address: '',
    class: '',
    admissionType: '',
    category: '',
    fatherName: '',
    motherName: '',
    previousSchool: '',
    lastYearPercentage: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Applications</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
              <FileText className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Approved</p>
                <p className="text-2xl font-bold">892</p>
              </div>
              <User className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">355</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="new-application" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-application">New Application</TabsTrigger>
          <TabsTrigger value="applications-list">Applications List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="new-application">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Admission Form
              </CardTitle>
              <CardDescription>
                Fill out the form below to register a new student admission
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        placeholder="Enter student's full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
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
                    <div className="space-y-2">
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
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactNumber">Contact Number *</Label>
                      <Input
                        id="contactNumber"
                        placeholder="Enter contact number"
                        value={formData.contactNumber}
                        onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter complete address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Academic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="class">Class *</Label>
                      <Select onValueChange={(value) => handleInputChange('class', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Class 1</SelectItem>
                          <SelectItem value="2">Class 2</SelectItem>
                          <SelectItem value="3">Class 3</SelectItem>
                          <SelectItem value="4">Class 4</SelectItem>
                          <SelectItem value="5">Class 5</SelectItem>
                          <SelectItem value="6">Class 6</SelectItem>
                          <SelectItem value="7">Class 7</SelectItem>
                          <SelectItem value="8">Class 8</SelectItem>
                          <SelectItem value="9">Class 9</SelectItem>
                          <SelectItem value="10">Class 10</SelectItem>
                          <SelectItem value="11">Class 11</SelectItem>
                          <SelectItem value="12">Class 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admissionType">Admission Type *</Label>
                      <Select onValueChange={(value) => handleInputChange('admissionType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select admission type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New Admission</SelectItem>
                          <SelectItem value="transfer">Transfer</SelectItem>
                          <SelectItem value="readmission">Re-admission</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previousSchool">Previous School</Label>
                      <Input
                        id="previousSchool"
                        placeholder="Enter previous school name"
                        value={formData.previousSchool}
                        onChange={(e) => handleInputChange('previousSchool', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastYearPercentage">Last Year Percentage</Label>
                      <Input
                        id="lastYearPercentage"
                        type="number"
                        placeholder="Enter percentage"
                        value={formData.lastYearPercentage}
                        onChange={(e) => handleInputChange('lastYearPercentage', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Parent Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name *</Label>
                      <Input
                        id="fatherName"
                        placeholder="Enter father's name"
                        value={formData.fatherName}
                        onChange={(e) => handleInputChange('fatherName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name *</Label>
                      <Input
                        id="motherName"
                        placeholder="Enter mother's name"
                        value={formData.motherName}
                        onChange={(e) => handleInputChange('motherName', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline">
                    Reset Form
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Submit Application
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="applications-list">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                View and manage all admission applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample application entries */}
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">John Doe</h4>
                      <p className="text-sm text-gray-600">Class 10 • Application #12345</p>
                      <p className="text-sm text-gray-500">Contact: +91 9876543210</p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="secondary">Pending</Badge>
                      <p className="text-sm text-gray-500">Applied: 2 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">Jane Smith</h4>
                      <p className="text-sm text-gray-600">Class 8 • Application #12344</p>
                      <p className="text-sm text-gray-500">Contact: +91 9876543211</p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                      <p className="text-sm text-gray-500">Applied: 5 days ago</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">Mike Johnson</h4>
                      <p className="text-sm text-gray-600">Class 12 • Application #12343</p>
                      <p className="text-sm text-gray-500">Contact: +91 9876543212</p>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge variant="destructive">Rejected</Badge>
                      <p className="text-sm text-gray-500">Applied: 1 week ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdmissionForm;
