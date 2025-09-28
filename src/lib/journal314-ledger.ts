export interface Journal314Entry {
  id: string;
  author: string;
  source: string;
  quote: string;
  inference: string;
  nihiltheisticClaim: string;
}

export const journal314Ledger: Journal314Entry[] = [
  {
    id: 'eckhart-rid-me',
    author: 'Meister Eckhart',
    source: 'Sermons',
    quote: 'I pray God to rid me of God.',
    inference:
      'Eckhart implores the divine to dissolve conceptual idols so the ineffable ground can emerge unmediated.',
    nihiltheisticClaim: 'Apophatic surrender clears every image, letting the divine void alone be encountered.'
  },
  {
    id: 'cioran-too-late',
    author: 'E.M. Cioran',
    source: 'The Trouble with Being Born',
    quote: 'It is not worth the bother of killing yourself, since you always kill yourself too late.',
    inference:
      'Cioran sees suicidal negation as futile because consciousness cannot outpace the inertia of being.',
    nihiltheisticClaim:
      'Temporal despair fails; only ontological voiding can displace being’s stubborn recurrence.'
  },
  {
    id: 'kierkegaard-anxiety',
    author: 'Søren Kierkegaard',
    source: 'The Concept of Anxiety',
    quote: 'Anxiety is the dizziness of freedom.',
    inference:
      'Kierkegaard reads anxiety as vertigo before radical possibility, revealing selfhood’s groundless openness.',
    nihiltheisticClaim:
      'Freedom’s vertigo reveals the self as voidal aperture where transcendence gestates.'
  }
];
