import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const leaveFormSchema = z.object({
  numberOfDays: z.string().min(1, 'Number of days is required').refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    'Must be a valid positive number'
  ),
  reason: z.string().min(10, 'Reason must be at least 10 characters long'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  returnDate: z.date({
    required_error: 'Return date is required',
  }),
}).refine(
  (data) => data.returnDate > data.startDate,
  {
    message: 'Return date must be after start date',
    path: ['returnDate'],
  }
);

type LeaveFormValues = z.infer<typeof leaveFormSchema>;

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

const Leave = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUserProfile();
  
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      numberOfDays: '',
      reason: '',
    },
  });

  const onSubmit = async (data: LeaveFormValues) => {
    if (!currentUser) {
      toast({
        title: 'Profile Required',
        description: 'Please create your profile first before submitting a leave application.',
        variant: 'destructive',
      });
      navigate('/profile');
      return;
    }

    try {
      // Submit leave application to the database
      const { error } = await supabase
        .from('leave_applications')
        .insert({
          student_name: currentUser.name,
          student_class: currentUser.class,
          student_division: currentUser.division,
          student_dob: currentUser.dob,
          student_phone: currentUser.phone,
          student_image: currentUser.image || null,
          number_of_days: parseInt(data.numberOfDays),
          start_date: data.startDate.toISOString().split('T')[0],
          return_date: data.returnDate.toISOString().split('T')[0],
          reason: data.reason,
          status: 'pending'
        });

      if (error) {
        throw error;
      }

      // Send notification to attendance
      await supabase
        .from('notifications')
        .insert({
          title: 'Leave Application Submitted',
          message: `Your leave application for ${data.numberOfDays} day(s) from ${data.startDate.toISOString().split('T')[0]} to ${data.returnDate.toISOString().split('T')[0]} has been submitted. Reason: ${data.reason}`,
          role: 'student'
        });

      toast({
        title: 'Leave Application Submitted',
        description: 'Your leave application has been submitted for teacher approval.',
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error submitting leave application:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit leave application. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Check if user has a profile
  if (!currentUser) {
    return (
      <div className="min-h-screen w-full px-8 py-10 bg-gradient-to-tr from-slate-50 via-white to-blue-50">
        <main className="max-w-2xl mx-auto">
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
            <p className="text-slate-600">You need to create your profile before submitting a leave application.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-lg text-slate-700 mb-6">
              Please create your profile first to submit leave applications.
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
      <main className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Submit Leave Application</h1>
          <p className="text-slate-600">Fill out the form below to submit your leave request</p>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Submitting as:</strong> {currentUser.name} (Class: {currentUser.class}, Division: {currentUser.division})
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="numberOfDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-semibold">Number of Days</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter number of days"
                        type="number"
                        min="1"
                        className="border-slate-300 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-blue-900 font-semibold">Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal border-slate-300 focus:border-blue-500',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick start date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-blue-900 font-semibold">Return Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal border-slate-300 focus:border-blue-500',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick return date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900 font-semibold">Reason for Leave</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide a detailed reason for your leave request..."
                        className="min-h-[100px] border-slate-300 focus:border-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1 border-slate-300 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Submit Leave Application
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Leave;