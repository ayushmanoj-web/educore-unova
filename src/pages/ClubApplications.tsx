import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Check, X, Clock } from "lucide-react";

interface Application {
  id: string;
  student_name: string;
  student_class: string;
  student_division: string;
  student_phone: string;
  application_details: string;
  status: string;
  submitted_at: string;
}

const ClubApplications = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  const clubName = location.state?.clubName || "Club";

  useEffect(() => {
    fetchApplications();
  }, [clubId]);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('club_applications')
        .select('*')
        .eq('club_id', clubId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('club_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'Teacher'
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application approved successfully!",
      });
      
      fetchApplications();
    } catch (error) {
      console.error('Error approving application:', error);
      toast({
        title: "Error",
        description: "Failed to approve application",
        variant: "destructive",
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('club_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'Teacher'
        })
        .eq('id', applicationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application rejected",
      });
      
      fetchApplications();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast({
        title: "Error",
        description: "Failed to reject application",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading applications...</div>
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
            onClick={() => navigate(`/club-application/${clubId}`, { 
              state: { clubName } 
            })}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Club
          </Button>
          <h1 className="text-3xl font-bold text-primary">{clubName} Applications</h1>
        </div>

        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{application.student_name}</CardTitle>
                    <p className="text-muted-foreground">
                      Class: {application.student_class} - {application.student_division} | 
                      Phone: {application.student_phone}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted: {new Date(application.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Application Details:</h4>
                    <p className="text-muted-foreground bg-gray-50 p-4 rounded-lg">
                      {application.application_details}
                    </p>
                  </div>
                  
                  {application.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproveApplication(application.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectApplication(application.id)}
                        className="flex items-center gap-2"
                      >
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {applications.length === 0 && (
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              No applications submitted yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubApplications;