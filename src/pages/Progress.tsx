import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

interface TestScore {
  id: string;
  subject: string;
  score: number;
  total: number;
  test_name: string;
  date: string;
}

interface HomeworkStatus {
  id: string;
  assignment_name: string;
  subject: string;
  submitted: boolean;
  due_date: string;
}

const Progress = () => {
  const [testScores, setTestScores] = useState<TestScore[]>([]);
  const [homeworkStatus, setHomeworkStatus] = useState<HomeworkStatus[]>([]);
  const [currentUserId] = useState("student-123"); // This would come from auth context

  useEffect(() => {
    fetchTestScores();
    fetchHomeworkStatus();
    // Insert some mock data for demo
    insertMockData();
  }, []);

  const insertMockData = async () => {
    // Insert mock test scores
    const mockTestScores = [
      { student_id: currentUserId, subject: "Mathematics", score: 85, total: 100, test_name: "Algebra Test", date: "2024-01-15" },
      { student_id: currentUserId, subject: "Science", score: 92, total: 100, test_name: "Physics Quiz", date: "2024-01-18" },
      { student_id: currentUserId, subject: "English", score: 78, total: 100, test_name: "Essay Writing", date: "2024-01-20" },
      { student_id: currentUserId, subject: "Mathematics", score: 90, total: 100, test_name: "Geometry Test", date: "2024-01-25" },
      { student_id: currentUserId, subject: "Science", score: 88, total: 100, test_name: "Chemistry Lab", date: "2024-01-28" },
    ];

    // Insert mock homework status
    const mockHomework = [
      { student_id: currentUserId, assignment_id: "hw-1", assignment_name: "Math Problems Ch.5", subject: "Mathematics", submitted: true, due_date: "2024-02-01" },
      { student_id: currentUserId, assignment_id: "hw-2", assignment_name: "Science Lab Report", subject: "Science", submitted: false, due_date: "2024-02-03" },
      { student_id: currentUserId, assignment_id: "hw-3", assignment_name: "English Essay", subject: "English", submitted: true, due_date: "2024-02-05" },
      { student_id: currentUserId, assignment_id: "hw-4", assignment_name: "History Project", subject: "History", submitted: false, due_date: "2024-02-07" },
    ];

    // Insert test scores
    for (const score of mockTestScores) {
      await supabase.from("test_scores").upsert(score, { onConflict: "id" });
    }

    // Insert homework status
    for (const hw of mockHomework) {
      await supabase.from("homework_status").upsert(hw, { onConflict: "id" });
    }
  };

  const fetchTestScores = async () => {
    const { data, error } = await supabase
      .from("test_scores")
      .select("*")
      .eq("student_id", currentUserId)
      .order("date", { ascending: true });

    if (!error && data) {
      setTestScores(data);
    }
  };

  const fetchHomeworkStatus = async () => {
    const { data, error } = await supabase
      .from("homework_status")
      .select("*")
      .eq("student_id", currentUserId)
      .order("due_date", { ascending: false });

    if (!error && data) {
      setHomeworkStatus(data);
    }
  };

  // Process data for charts
  const subjectPerformance = testScores.reduce((acc, score) => {
    const percentage = (score.score / score.total) * 100;
    if (!acc[score.subject]) {
      acc[score.subject] = { subject: score.subject, scores: [], average: 0 };
    }
    acc[score.subject].scores.push(percentage);
    acc[score.subject].average = acc[score.subject].scores.reduce((a, b) => a + b, 0) / acc[score.subject].scores.length;
    return acc;
  }, {} as Record<string, { subject: string; scores: number[]; average: number }>);

  const chartData = Object.values(subjectPerformance).map(item => ({
    subject: item.subject,
    average: Math.round(item.average),
  }));

  const recentScores = testScores.slice(-5).map(score => ({
    test: score.test_name,
    score: (score.score / score.total) * 100,
    date: new Date(score.date).toLocaleDateString(),
  }));

  const homeworkStats = {
    total: homeworkStatus.length,
    completed: homeworkStatus.filter(hw => hw.submitted).length,
    pending: homeworkStatus.filter(hw => !hw.submitted).length,
  };

  const completionRate = homeworkStats.total > 0 ? Math.round((homeworkStats.completed / homeworkStats.total) * 100) : 0;

  return (
    <div className="min-h-screen w-full px-4 py-6 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-blue-800">Progress Tracker</h1>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {chartData.length > 0 
                  ? Math.round(chartData.reduce((acc, item) => acc + item.average, 0) / chartData.length) + '%'
                  : '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">Across all subjects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Homework Completion</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {homeworkStats.completed} of {homeworkStats.total} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{testScores.length}</div>
              <p className="text-xs text-muted-foreground">Tests completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Subject Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                  <Bar dataKey="average" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Test Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recentScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="test" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                  <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Homework Status */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Homework</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {homeworkStatus.slice(0, 8).map((hw) => (
                <div key={hw.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${hw.submitted ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <div>
                      <p className="font-semibold">{hw.assignment_name}</p>
                      <p className="text-sm text-slate-600">{hw.subject}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${hw.submitted ? 'text-green-600' : 'text-yellow-600'}`}>
                      {hw.submitted ? 'Completed' : 'Pending'}
                    </p>
                    <p className="text-sm text-slate-600">
                      Due: {new Date(hw.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;