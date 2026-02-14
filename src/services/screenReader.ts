// Screen reading metadata — defines what voice-over reads for each screen
export interface ScreenReadItem {
  type: 'heading' | 'subheading' | 'description' | 'button' | 'input' | 'stat' | 'status' | 'section';
  label: string;
  detail?: string;
  inputId?: string; // for input fields that can be filled by voice
  action?: string; // what happens when clicked/activated
}

export interface ScreenMeta {
  overview: string;
  purpose: string;
  items: ScreenReadItem[];
}

export function getOnboardingMeta(step: string): ScreenMeta {
  switch (step) {
    case 'welcome':
      return {
        overview: 'Welcome to MemoCare. This is your getting started screen.',
        purpose: 'Set up MemoCare for the first time.',
        items: [
          { type: 'heading', label: 'Welcome to MemoCare' },
          { type: 'description', label: 'Supporting you every step of the way, with care and kindness.' },
          { type: 'button', label: 'Get Started', detail: 'Tap this to begin setting up MemoCare. It will ask you how you want to use the app.', action: 'next' },
          { type: 'button', label: 'I am a caregiver', detail: 'Tap this if you are setting up the app for someone you care for.', action: 'caregiver' },
        ],
      };
    case 'voiceChoice':
      return {
        overview: 'Choose how you want to interact with MemoCare.',
        purpose: 'Select between voice guidance or manual browsing.',
        items: [
          { type: 'heading', label: 'How would you like to use MemoCare?' },
          { type: 'description', label: 'Choose your preferred way to interact with the app.' },
          { type: 'button', label: 'Use Voice Over', detail: 'I will guide you with voice. You can speak to navigate, take medicine, call your caregiver, and more. Recommended for easier use.', action: 'voiceover' },
          { type: 'button', label: 'Browse Mode', detail: 'Use the app by tapping and swiping on your own. You can enable voice guidance later from settings.', action: 'browse' },
        ],
      };
    case 'assess':
      return {
        overview: 'Technology comfort assessment. This helps us customize the app for you.',
        purpose: 'We adjust the interface based on your comfort level with technology.',
        items: [
          { type: 'heading', label: 'How comfortable are you with technology?' },
          { type: 'description', label: 'This helps us set up the best experience for you.' },
          { type: 'button', label: 'Very comfortable', detail: 'You use apps and phones regularly. The app will show all features with smaller text and more options.', action: 'mode_full' },
          { type: 'button', label: 'Somewhat comfortable', detail: 'You prefer simple, larger buttons. The app will show bigger text and fewer options on each screen.', action: 'mode_simplified' },
          { type: 'button', label: 'I need help', detail: 'A caregiver will set things up for you. The app will show only the most essential features with very large buttons.', action: 'mode_essential' },
        ],
      };
    case 'personalize':
      return {
        overview: 'Personalization. We want to know your name so we can greet you properly.',
        purpose: 'Tell us your name to personalize MemoCare.',
        items: [
          { type: 'heading', label: 'What should we call you?' },
          { type: 'description', label: 'We will use this to personalize your experience.' },
          { type: 'input', label: 'Your name', detail: 'Please tell me your name and I will type it in for you. Speak clearly.', inputId: 'onboarding-name' },
          { type: 'button', label: 'Continue', detail: 'Tap this after entering your name to proceed to the final step.', action: 'continue' },
        ],
      };
    case 'complete':
      return {
        overview: 'All set! MemoCare is ready to help you every day.',
        purpose: 'Finish setup and start using MemoCare.',
        items: [
          { type: 'heading', label: 'You are all set!' },
          { type: 'description', label: 'MemoCare is ready to help you every day.' },
          { type: 'button', label: 'Start with Voice Over', detail: 'Tap this to begin using MemoCare with voice guidance. I will read screens aloud and listen to your commands.', action: 'finish_voice' },
          { type: 'button', label: 'Start Browsing', detail: 'Tap this to begin using MemoCare on your own by tapping and swiping.', action: 'finish_browse' },
        ],
      };
    default:
      return { overview: '', purpose: '', items: [] };
  }
}

export function getScreenMeta(tab: string, appState: {
  medications: { name: string; dosage: string; time: string; taken: boolean }[];
  currentMood: { label: string };
  stepCount: number;
  sleepHours: number;
}): ScreenMeta {
  switch (tab) {
    case 'today': {
      const pendingMeds = appState.medications.filter(m => !m.taken);
      const takenMeds = appState.medications.filter(m => m.taken);
      return {
        overview: 'This is your Today screen. It shows your daily overview including medications, activities, mood, and health stats.',
        purpose: 'Keep track of your daily health and tasks.',
        items: [
          { type: 'heading', label: 'Today' },
          { type: 'section', label: 'Medications', detail: `You have ${pendingMeds.length} medication${pendingMeds.length !== 1 ? 's' : ''} still to take and ${takenMeds.length} already taken.` },
          ...pendingMeds.map(m => ({
            type: 'button' as const,
            label: `${m.name} ${m.dosage}`,
            detail: `Due at ${m.time}. Tap to mark as taken. Say "take my medicine" to mark it done by voice.`,
            action: `take_med_${m.name}`,
          })),
          { type: 'stat', label: 'Mood', detail: `Your current mood is ${appState.currentMood.label}.` },
          { type: 'stat', label: 'Steps', detail: `You have walked ${appState.stepCount.toLocaleString()} steps today.` },
          { type: 'stat', label: 'Sleep', detail: `You slept ${appState.sleepHours} hours last night.` },
        ],
      };
    }
    case 'memories':
      return {
        overview: 'This is your Memories screen. Browse your cherished photo memories and albums.',
        purpose: 'Look at photos that bring you joy and comfort.',
        items: [
          { type: 'heading', label: 'Memories' },
          { type: 'button', label: 'Slideshow', detail: 'Tap to watch a slideshow of your favourite photos. Photos will change automatically.', action: 'slideshow' },
          { type: 'section', label: 'Photo Albums', detail: 'You have albums for Family and Holidays. Tap an album to see photos inside.' },
        ],
      };
    case 'safety':
      return {
        overview: 'This is your Safety screen. It shows your location, fall detection, and emergency contacts.',
        purpose: 'Stay safe and quickly reach help if needed.',
        items: [
          { type: 'heading', label: 'Safety' },
          { type: 'status', label: 'Location', detail: 'Your current location is shown on the map. You are in a safe zone at Home.' },
          { type: 'status', label: 'Fall Detection', detail: 'Fall detection is active. No incidents in the last 30 days.' },
          { type: 'section', label: 'Emergency Contacts', detail: 'Sarah Johnson is your primary caregiver. John Johnson and Doctor Smith are also listed.' },
          { type: 'button', label: 'Emergency SOS', detail: 'Tap this big red button to immediately call your caregiver Sarah for help. Use this only in emergencies. You can also say "call Sarah" or "help".', action: 'sos' },
        ],
      };
    case 'care':
      return {
        overview: 'This is your Care Circle screen. Stay connected with your care team and family.',
        purpose: 'Chat with family, view care tasks, and see appointments.',
        items: [
          { type: 'heading', label: 'Care Circle' },
          { type: 'button', label: 'Chat with Sarah', detail: 'Tap to open a chat with your caregiver Sarah Johnson. You can type or speak a message.', action: 'chat' },
          { type: 'section', label: 'Care Tasks', detail: 'View tasks assigned by your care team.' },
          { type: 'section', label: 'Upcoming Appointments', detail: 'See your scheduled appointments.' },
        ],
      };
    case 'wellbeing':
      return {
        overview: 'This is your Wellbeing screen. Track how you feel and view your health summary.',
        purpose: 'Monitor your overall health and adjust app settings.',
        items: [
          { type: 'heading', label: 'My Wellbeing' },
          { type: 'section', label: 'How are you feeling?', detail: 'Tap an emoji to log your mood. You can also say "I feel happy" or "I feel tired".' },
          { type: 'section', label: 'Health Summary', detail: `Sleep: ${appState.sleepHours} hours. Steps: ${appState.stepCount.toLocaleString()}. Your medication adherence is tracked here.` },
          { type: 'button', label: 'Interface Mode', detail: 'Change how the app looks. Full mode shows everything, Simplified has bigger buttons, Essential shows only the basics.', action: 'mode' },
        ],
      };
    default:
      return { overview: '', purpose: '', items: [] };
  }
}
