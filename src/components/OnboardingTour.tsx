import { useState, useEffect } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface OnboardingTourProps {
  tourType: 'student' | 'teacher';
}

const studentSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to School Task List! Let me show you around. 🎓',
    placement: 'center',
  },
  {
    target: '.stats-cards',
    content: 'Here you can see your progress - total tasks, pending, and completed! 📊',
  },
  {
    target: '.task-grid',
    content: 'All your assignments appear here. Click on a task to view details and submit your work! 📝',
  },
  {
    target: '.coin-balance',
    content: 'Earn coins by completing tasks! Use them in the shop to buy cool titles and badges. 🪙',
  },
  {
    target: '.nav-shop',
    content: 'Visit the shop to spend your coins on titles, badges, and namecards! 🛍️',
  },
  {
    target: '.nav-leaderboard',
    content: 'Check the leaderboard to see how you rank against your classmates! 🏆',
  },
  {
    target: '.nav-profile',
    content: 'Customize your profile with titles and badges you\'ve earned! ✨',
  },
];

const teacherSteps: Step[] = [
  {
    target: 'body',
    content: 'Welcome to the Teacher Dashboard! Let me show you the key features. 👨‍🏫',
    placement: 'center',
  },
  {
    target: '.stats-cards',
    content: 'Monitor your class statistics - total students, active assignments, and submissions to grade. 📊',
  },
  {
    target: '.create-task-button',
    content: 'Click here to create new assignments for your students! ➕',
  },
  {
    target: '.filter-controls',
    content: 'Use filters to quickly find specific tasks by subject, status, or search. 🔍',
  },
  {
    target: '.task-table',
    content: 'View and manage all your assignments here. Click on any task to edit or view submissions! 📋',
  },
  {
    target: '.nav-leaderboard',
    content: 'Check student rankings and engagement on the leaderboard! 🏆',
  },
];

export const OnboardingTour = ({ tourType }: OnboardingTourProps) => {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`hasSeenTour_${tourType}`);
    if (!hasSeenTour) {
      // Delay tour start to ensure page is fully loaded
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourType]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem(`hasSeenTour_${tourType}`, 'true');
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={tourType === 'student' ? studentSteps : teacherSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#4F46E5',
          textColor: '#F7FAFC',
          backgroundColor: '#1a1f35',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          arrowColor: '#1a1f35',
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          padding: 20,
        },
        buttonNext: {
          backgroundColor: '#4F46E5',
          borderRadius: 8,
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#A0AEC0',
          marginRight: 10,
        },
        buttonSkip: {
          color: '#A0AEC0',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        skip: 'Skip Tour',
      }}
    />
  );
};
