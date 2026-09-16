// Unified Email Tone Options for Campaign Creation, Settings, and Outreach Launching

export const TONE_OPTIONS = [
  {
    id: 'Professional',
    label: 'Professional',
    subtitle: 'Corporate, ROI-focused',
    desc: 'Formal, value-driven enterprise tone',
    badge: 'Recommended'
  },
  {
    id: 'Casual',
    label: 'Casual',
    subtitle: 'Warm, conversational',
    desc: 'Warm, approachable and conversational',
    badge: 'High Engagement'
  },
  {
    id: 'Urgent',
    label: 'Urgent',
    subtitle: 'Direct, action-driven',
    desc: 'Direct, concise, and action-driven',
    badge: 'Fast Read'
  },
  {
    id: 'Consultative',
    label: 'Consultative',
    subtitle: 'Advisory, value-first',
    desc: 'Advisory, partnership, and value-first',
    badge: 'Advisory'
  },
  {
    id: 'Creative',
    label: 'Creative',
    subtitle: 'Punchy, memorable',
    desc: 'Punchy, memorable, and standout pitch',
    badge: 'Standout'
  }
];

// Helper to safely find tone metadata, with backward compatibility aliases
export const findToneOption = (toneId) => {
  if (!toneId) return TONE_OPTIONS[0];
  const lower = String(toneId).toLowerCase().trim();
  const exact = TONE_OPTIONS.find(t => t.id.toLowerCase() === lower);
  if (exact) return exact;

  // Aliases for backward compatibility with previously saved campaigns
  if (lower === 'friendly') return TONE_OPTIONS.find(t => t.id === 'Casual') || TONE_OPTIONS[1];
  if (lower === 'direct' || lower === 'aggressive') return TONE_OPTIONS.find(t => t.id === 'Urgent') || TONE_OPTIONS[2];

  return {
    id: toneId,
    label: toneId,
    subtitle: 'Custom outreach tone',
    desc: 'Custom tone style',
    badge: 'Custom'
  };
};
