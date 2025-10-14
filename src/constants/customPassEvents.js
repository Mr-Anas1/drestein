// Custom Pass Events Configuration
// These are individual events/workshops that can be added to a custom pass

export const CUSTOM_PASS_EVENTS = [
  {
    id: 'ideathon',
    name: 'Ideathon',
    description: 'Online Submission - Individual',
    category: 'competition',
    price: 100,
    type: 'individual',
    mode: 'online',
    icon: '💡',
  },
  {
    id: 'project-expo',
    name: 'Project Expo',
    description: 'Discussion Hall - Max 3 per Team',
    category: 'competition',
    price: 300,
    type: 'team',
    maxTeamSize: 3,
    mode: 'offline',
    icon: '🚀',
  },
  {
    id: 'poster-presentation',
    name: 'Poster Presentation',
    description: 'Present your research or project',
    category: 'competition',
    price: 150,
    type: 'individual',
    mode: 'offline',
    icon: '📊',
  },
  {
    id: 'hackathon',
    name: 'Hackathon',
    description: '24-hour coding challenge',
    category: 'competition',
    price: 500,
    type: 'team',
    maxTeamSize: 4,
    mode: 'offline',
    icon: '💻',
  },
  {
    id: 'paid-event-1',
    name: 'Tech Talk Series',
    description: 'Industry expert sessions',
    category: 'event',
    price: 200,
    type: 'individual',
    mode: 'offline',
    icon: '🎤',
  },
  {
    id: 'paid-event-2',
    name: 'Gaming Tournament',
    description: 'Esports competition',
    category: 'event',
    price: 150,
    type: 'individual',
    mode: 'offline',
    icon: '🎮',
  },
  {
    id: 'workshop-ai',
    name: 'AI/ML Workshop',
    description: 'Hands-on AI development',
    category: 'workshop',
    price: 300,
    type: 'individual',
    mode: 'offline',
    icon: '🤖',
  },
  {
    id: 'workshop-web',
    name: 'Web Development Workshop',
    description: 'Full-stack development',
    category: 'workshop',
    price: 250,
    type: 'individual',
    mode: 'offline',
    icon: '🌐',
  },
  {
    id: 'workshop-blockchain',
    name: 'Blockchain Workshop',
    description: 'Cryptocurrency and smart contracts',
    category: 'workshop',
    price: 350,
    type: 'individual',
    mode: 'offline',
    icon: '⛓️',
  },
];

export const PASS_TYPES = {
  GENERAL: 'general',
  WORKSHOP: 'workshop',
  CUSTOM: 'custom',
};

export const getEventById = (id) => {
  return CUSTOM_PASS_EVENTS.find(event => event.id === id);
};

export const getEventsByCategory = (category) => {
  return CUSTOM_PASS_EVENTS.filter(event => event.category === category);
};

export const calculateCustomPassTotal = (selectedEventIds) => {
  return selectedEventIds.reduce((total, id) => {
    const event = getEventById(id);
    return total + (event?.price || 0);
  }, 0);
};
