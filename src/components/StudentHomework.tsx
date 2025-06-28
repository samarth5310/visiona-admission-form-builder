
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, User, ExternalLink } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Homework } from "@/types/homework";

const StudentHomework = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const { toast } = useToast();

  // Get current student data
  const studentData = JSON.parse(localStorage.getItem('visiona_student_data') || '{}');

  useEffect(() => {
    fetchHomework();
  }, []);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .eq('assigned_to_class', studentData.class)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching homework:', error);
        toast({
          title: "Error",
          description: "Failed to fetch homework assignments.",
          variant: "destructive",
        });
        return;
      }

      setHomework(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractFileId = (driveLink: string) => {
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = driveLink.match(pattern);
      if (match) return match[1];
    }
    
    // If it's already just the file ID
    if (/^[a-zA-Z0-9_-]+$/.test(driveLink)) {
      return driveLink;
    }
    
    return null;
  };

  const getEmbedUrl = (driveLink: string) => {
    const fileId = extractFileId(driveLink);
    if (!fileId) return null;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homework assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Homework</h1>
        <p className="text-gray-600">Class: {studentData.class}</p>
      </div>

      {homework.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Homework Assigned</h3>
            <p className="text-gray-600">Check back later for new assignments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Homework List */}
          <div className="lg:col-span-1 space-y-4">
            {homework.map((hw) => (
              <Card 
                key={hw.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedHomework?.id === hw.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedHomework(hw)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{hw.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {hw.subject}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      <span>{hw.assigned_by}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(hw.created_at)}</span>
                    </div>
                  </div>
                  
                  {hw.description && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      {hw.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Document Preview */}
          <div className="lg:col-span-2">
            {selectedHomework ? (
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        {selectedHomework.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <Badge variant="outline">{selectedHomework.subject}</Badge>
                        <span>By: {selectedHomework.assigned_by}</span>
                        <span>{formatDate(selectedHomework.created_at)}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedHomework.google_drive_link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open in Drive
                    </Button>
                  </div>
                  
                  {selectedHomework.description && (
                    <p className="text-gray-600 mt-2">{selectedHomework.description}</p>
                  )}
                </CardHeader>
                
                <CardContent className="flex-1">
                  <div className="h-[600px] border rounded-lg overflow-hidden">
                    {getEmbedUrl(selectedHomework.google_drive_link) ? (
                      <iframe
                        src={getEmbedUrl(selectedHomework.google_drive_link)!}
                        className="w-full h-full"
                        frameBorder="0"
                        title={selectedHomework.title}
                        allow="autoplay"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gray-50">
                        <div className="text-center">
                          <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                          <p className="text-gray-600 mb-4">Unable to preview this document format.</p>
                          <Button
                            onClick={() => window.open(selectedHomework.google_drive_link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open in Google Drive
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select Homework</h3>
                    <p className="text-gray-600">Choose a homework assignment to view the document.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentHomework;
