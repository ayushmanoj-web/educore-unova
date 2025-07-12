import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, FileText, Send } from "lucide-react";

const ClubApplication = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [applicationDetails, setApplicationDetails] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const clubName = location.state?.clubName || "Club";
  const studentData = JSON.parse(localStorage.getItem('studentProfile') || '{}');

  useEffect(() => {
    checkApplicationStatus();
  }, [clubId]);

  const checkApplicationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('club_applications')
        .select('*')
        .eq('club_id', clubId)
        .eq('student_phone', studentData.phone)
        .single();

      if (data) {
        setHasApplied(true);
        setIsApproved(data.status === 'approved');
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!applicationDetails.trim()) {
      toast({
        title: "Error",
        description: "Please provide application details",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('club_applications')
        .insert({
          club_id: clubId,
          student_id: studentData.id || 'temp-id',
          student_name: studentData.name,
          student_class: studentData.class,
          student_division: studentData.division,
          student_phone: studentData.phone,
          application_details: applicationDetails,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application submitted successfully!",
      });
      
      setHasApplied(true);
      setApplicationDetails("");
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  const handleLiveChat = () => {
    navigate(`/club-chat/${clubId}`, { 
      state: { clubName } 
    });
  };

  const handleViewApplications = () => {
    navigate(`/club-applications/${clubId}`, { 
      state: { clubName } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/extra-curriculars')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Clubs
          </Button>
          <h1 className="text-3xl font-bold text-primary">{clubName}</h1>
        </div>

        {/* Club buttons for quick navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Club Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'Little Kites', 'SPC', 'JRC', 'Maths Club', 
                'Media Club', 'Hindi Club', 'SS Club', 
                'Scout and Guides', 'Science Club'
              ].map((club) => (
                <Button
                  key={club}
                  variant={club === clubName ? "default" : "outline"}
                  className="text-sm"
                  onClick={() => {
                    // Find club by name and navigate
                    supabase
                      .from('clubs')
                      .select('id')
                      .eq('name', club)
                      .single()
                      .then(({ data }) => {
                        if (data) {
                          navigate(`/club-application/${data.id}`, {
                            state: { clubName: club }
                          });
                        }
                      });
                  }}
                >
                  {club}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Application status or form */}
        {hasApplied && isApproved ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleLiveChat}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Join the club's live chat discussion
                </p>
                <Button className="w-full">
                  Enter Chat Room
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleViewApplications}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  View all student applications for this club
                </p>
                <Button className="w-full" variant="outline">
                  View Applications
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : hasApplied ? (
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-600 font-medium">
                Your application is pending review. You'll be notified once it's processed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Apply to {clubName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={studentData.name || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={`${studentData.class || ''} - ${studentData.division || ''}`}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={studentData.phone || ''}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="details">Application Details</Label>
                <Textarea
                  id="details"
                  placeholder={`Tell us why you want to join ${clubName} and what you can contribute...`}
                  value={applicationDetails}
                  onChange={(e) => setApplicationDetails(e.target.value)}
                  className="min-h-[150px]"
                />
              </div>

              <Button 
                onClick={handleSubmitApplication}
                className="w-full flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Submit Application
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClubApplication;