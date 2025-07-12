import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Users } from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
}

const ExtraCurriculars = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [approvedClubs, setApprovedClubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get student data from localStorage
  const studentData = JSON.parse(localStorage.getItem('studentProfile') || '{}');

  useEffect(() => {
    fetchClubs();
    fetchApprovedClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .order('name');

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast({
        title: "Error",
        description: "Failed to load clubs",
        variant: "destructive",
      });
    }
  };

  const fetchApprovedClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('club_applications')
        .select('club_id')
        .eq('student_phone', studentData.phone)
        .eq('status', 'approved');

      if (error) throw error;
      const approved = data?.map(app => app.club_id) || [];
      setApprovedClubs(approved);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching approved clubs:', error);
      setLoading(false);
    }
  };

  const handleClubClick = (club: Club) => {
    navigate(`/club-application/${club.id}`, { 
      state: { clubName: club.name } 
    });
  };

  // Filter clubs based on approval status
  const displayClubs = approvedClubs.length > 0 
    ? clubs.filter(club => approvedClubs.includes(club.id))
    : clubs;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading clubs...</div>
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
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-primary">Extra Curriculars</h1>
        </div>

        {approvedClubs.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">
              🎉 Congratulations! You've been approved for {approvedClubs.length} club(s).
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayClubs.map((club) => (
            <Card 
              key={club.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/50"
              onClick={() => handleClubClick(club)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {club.name}
                </CardTitle>
                <CardDescription>{club.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  {approvedClubs.includes(club.id) ? 'Access Club' : 'Apply Now'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {displayClubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {approvedClubs.length > 0 
                ? "No clubs available" 
                : "No clubs found"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExtraCurriculars;