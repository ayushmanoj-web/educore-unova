import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface LeaveApplication {
  id: string;
  student_name: string;
  student_class: string;
  student_division: string;
  number_of_days: number;
  start_date: string;
  return_date: string;
  reason: string;
  status: string;
  submitted_at: string;
}

interface AttendanceNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  is_read: boolean;
}

// Get current user profile from localStorage
const getCurrentUserProfile = () => {
  try {
    const profiles = localStorage.getItem("student-profiles");
    if (profiles) {
      const parsedProfiles = JSON.parse(profiles);
      return parsedProfiles.length > 0 ? parsedProfiles[parsedProfiles.length - 1] : null;
    }
  } catch (error) {
    console.error('Error getting current user profile:', error);
  }
  return null;
};

const Attendance = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUserProfile();
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([]);
  const [notifications, setNotifications] = useState<AttendanceNotification[]>([]);
  const [showGraph, setShowGraph] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchLeaveApplications();
      fetchAttendanceNotifications();
    }
  }, [currentUser]);

  const fetchLeaveApplications = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('leave_applications')
        .select('*')
        .eq('student_phone', currentUser.phone)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setLeaveApplications(data || []);
    } catch (error) {
      console.error('Error fetching leave applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch leave applications',
        variant: 'destructive',
      });
    }
  };

  const fetchAttendanceNotifications = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('role', 'student')
        .ilike('title', '%leave%')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalLeaveDays = () => {
    return leaveApplications.reduce((total, leave) => total + leave.number_of_days, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonthlyLeaveData = () => {
    const monthlyData: { [key: string]: number } = {};
    
    leaveApplications.forEach(leave => {
      const month = format(new Date(leave.start_date), 'MMM yyyy');
      monthlyData[month] = (monthlyData[month] || 0) + leave.number_of_days;
    });

    return Object.entries(monthlyData).map(([month, days]) => ({
      month,
      days,
    }));
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen w-full px-8 py-10 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
        <main className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4 hover:bg-blue-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-blue-900 mb-2">Profile Required</h1>
            <p className="text-slate-600">You need to create your profile to view attendance information.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-lg text-slate-700 mb-6">
              Please create your profile first to access attendance features.
            </p>
            <Button
              onClick={() => navigate('/profile')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Profile
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-8 py-10 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
      <main className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">Your Attendance</h1>
              <p className="text-slate-600">Track your leave applications and attendance history</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-800">{getTotalLeaveDays()}</div>
              <div className="text-sm text-slate-600">Total Leave Days</div>
            </div>
          </div>
          
          <div className="flex gap-3 mb-6">
            <Button
              variant={!showGraph ? "default" : "outline"}
              onClick={() => setShowGraph(false)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Leave History
            </Button>
            <Button
              variant={showGraph ? "default" : "outline"}
              onClick={() => setShowGraph(true)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Leave Graph
            </Button>
          </div>
        </div>

        {showGraph ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-blue-900">Monthly Leave Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getMonthlyLeaveData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="days" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Notifications Section */}
            {notifications.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Leave Application Updates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border-l-4 ${
                          notification.is_read 
                            ? 'bg-gray-50 border-gray-300' 
                            : 'bg-blue-50 border-blue-400'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-slate-800">{notification.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{notification.message}</p>
                          </div>
                          <span className="text-xs text-slate-500">
                            {format(new Date(notification.timestamp), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Leave Applications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-900">Leave Applications History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-slate-600 mt-2">Loading leave applications...</p>
                  </div>
                ) : leaveApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 mb-4">No leave applications found</p>
                    <Button
                      onClick={() => navigate('/leave')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Submit Leave Application
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaveApplications.map((leave) => (
                      <div key={leave.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              {leave.number_of_days} Day{leave.number_of_days !== 1 ? 's' : ''} Leave
                            </h3>
                            <p className="text-sm text-slate-600">
                              {format(new Date(leave.start_date), 'MMM dd, yyyy')} - {format(new Date(leave.return_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(leave.status)}>
                            {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 mb-2">
                          <strong>Reason:</strong> {leave.reason}
                        </p>
                        <p className="text-xs text-slate-500">
                          Submitted: {format(new Date(leave.submitted_at), 'MMM dd, yyyy hh:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Attendance;