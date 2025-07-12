import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, MessageCircle, FileText, Users } from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string;
}

const clubs = [
  { id: "little-kites", name: "Little Kites", description: "Environmental awareness and nature conservation" },
  { id: "spc", name: "SPC", description: "Student Police Cadets for discipline and social service" },
  { id: "jrc", name: "JRC", description: "Junior Red Cross for health and humanitarian activities" },
  { id: "maths-club", name: "Maths Club", description: "Mathematics and logical reasoning activities" },
  { id: "media-club", name: "Media Club", description: "Media literacy and communication skills" },
  { id: "hindi-club", name: "Hindi Club", description: "Hindi language and cultural activities" },
  { id: "ss-club", name: "SS Club", description: "Social Studies and civic awareness" },
  { id: "scout-guides", name: "Scout and Guides", description: "Adventure and character building activities" },
  { id: "science-club", name: "Science Club", description: "Scientific experiments and STEM activities" }
];

const ClubManagement = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [club, setClub] = useState<Club | null>(null);
  const [dbClubId, setDbClubId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clubId) {
      const foundClub = clubs.find(c => c.id === clubId);
      if (foundClub) {
        setClub(foundClub);
        initializeClub(foundClub);
      } else {
        navigate('/');
      }
    }
  }, [clubId, navigate]);

  const initializeClub = async (clubData: Club) => {
    try {
      // Check if club exists in database
      const { data: existingClub, error: selectError } = await supabase
        .from('clubs')
        .select('id')
        .eq('name', clubData.name)
        .single();

      if (existingClub) {
        setDbClubId(existingClub.id);
      } else {
        // Create club in database
        const { data: newClub, error: insertError } = await supabase
          .from('clubs')
          .insert({
            name: clubData.name,
            description: clubData.description
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        if (newClub) setDbClubId(newClub.id);
      }
    } catch (error) {
      console.error('Error initializing club:', error);
      toast({
        title: "Error",
        description: "Failed to initialize club",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplications = () => {
    navigate(`/club-applications/${dbClubId}`, { 
      state: { clubName: club?.name } 
    });
  };

  const handleLiveChat = () => {
    navigate(`/club-chat/${dbClubId}`, { 
      state: { clubName: club?.name } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading club...</div>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Club not found</div>
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
          <h1 className="text-3xl font-bold text-primary">{club.name} Management</h1>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              {club.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{club.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={handleLiveChat}
                className="w-full h-16 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              >
                <MessageCircle className="mr-3 h-6 w-6" />
                Live Chat
              </Button>
              
              <Button 
                onClick={handleViewApplications}
                className="w-full h-16 text-lg font-semibold bg-green-600 hover:bg-green-700 text-white shadow-lg"
              >
                <FileText className="mr-3 h-6 w-6" />
                View Applications
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClubManagement;