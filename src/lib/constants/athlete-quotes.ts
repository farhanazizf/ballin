export type AthleteQuote = {
  quote: string;
  quoteBy: string;
};

/** Coach login — work ethic & leadership */
export const COACH_ATHLETE_QUOTES: readonly AthleteQuote[] = [
  {
    quote: 'Hard work beats talent when talent fails to work hard.',
    quoteBy: 'Kevin Durant',
  },
  {
    quote: "I've failed over and over and over again in my life. And that is why I succeed.",
    quoteBy: 'Michael Jordan',
  },
  {
    quote: 'Good, better, best. Never let it rest. Until your good is better and your better is best.',
    quoteBy: 'Tim Duncan',
  },
  {
    quote: "You can't be afraid to fail. It's the only way you succeed.",
    quoteBy: 'LeBron James',
  },
  {
    quote: 'Ask not what your teammates can do for you. Ask what you can do for your teammates.',
    quoteBy: 'Magic Johnson',
  },
  {
    quote: 'Some people want it to happen, some wish it would happen, others make it happen.',
    quoteBy: 'Michael Jordan',
  },
];

/** Player login — process & self-improvement */
export const PLAYER_ATHLETE_QUOTES: readonly AthleteQuote[] = [
  {
    quote: 'Everything negative — pressure, challenges — is all an opportunity for me to rise.',
    quoteBy: 'Kobe Bryant',
  },
  {
    quote: "Don't let anyone tell you what you can't do.",
    quoteBy: 'Giannis Antetokounmpo',
  },
  {
    quote: "I can get better. I haven't reached my ceiling yet.",
    quoteBy: 'Stephen Curry',
  },
  {
    quote: 'Rest at the end, not in the middle.',
    quoteBy: 'Kobe Bryant',
  },
  {
    quote: 'Hard work beats talent when talent fails to work hard.',
    quoteBy: 'Kevin Durant',
  },
  {
    quote: 'Limits, like fears, are often just an illusion.',
    quoteBy: 'Michael Jordan',
  },
];

export function pickRandomAthleteQuote(quotes: readonly AthleteQuote[]): AthleteQuote {
  return quotes[Math.floor(Math.random() * quotes.length)]!;
}
