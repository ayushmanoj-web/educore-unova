-- Clear all user-generated data permanently

-- Clear all profiles
DELETE FROM public.profiles;

-- Clear all public profiles  
DELETE FROM public.public_profiles;

-- Clear all live chat messages
DELETE FROM public.messages;

-- Clear all chat messages
DELETE FROM public.chat_messages;

-- Clear all teacher-student chat messages
DELETE FROM public.messages_chat;

-- Clear all teacher messages
DELETE FROM public.teacher_messages;

-- Clear all club chat messages
DELETE FROM public.club_chat_messages;

-- Clear all notifications
DELETE FROM public.notifications;

-- Clear all leave applications
DELETE FROM public.leave_applications;

-- Clear all club applications
DELETE FROM public.club_applications;

-- Clear all homework status
DELETE FROM public.homework_status;

-- Clear all test scores
DELETE FROM public.test_scores;

-- Clear all teacher student assignments
DELETE FROM public.teacher_student_assignments;

-- Clear all chat participants
DELETE FROM public.chat_participants;

-- Clear all chat rooms
DELETE FROM public.chat_rooms;

-- Clear all user profiles
DELETE FROM public.user_profiles;