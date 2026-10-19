export const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100076979267705';
export type Resource = {
  id: string; name: string; category: string; region: 'Canada' | 'United States' | 'Global';
  description: string; url: string; publisher: string; checkedAt: string;
};
// Editorial summaries of public first-party pages, not copied directory records.
// checkedAt is a manual review date, never a simulated automatic refresh.
export const resources: Resource[] = [
  { id: 'ircc', name: 'Find newcomer services', category: 'Newcomers', region: 'Canada', description: 'Find settlement providers and check service eligibility with the Government of Canada.', url: 'https://ircc.canada.ca/english/newcomers/services/index.asp', publisher: 'Immigration, Refugees and Citizenship Canada', checkedAt: '2026-10-18' },
  { id: '211', name: 'Find help in your community', category: 'Family & support', region: 'Canada', description: 'Explore local food, housing and social-service referrals through 211.', url: 'https://211.ca/', publisher: '211 Canada', checkedAt: '2026-10-18' },
  { id: 'acces', name: 'Build your career in Canada', category: 'Careers & learning', region: 'Canada', description: 'Explore employment support, mentoring and programs for internationally trained professionals.', url: 'https://accesemployment.ca/', publisher: 'ACCES Employment', checkedAt: '2026-10-18' },
  { id: 'icna-food', name: 'Community food banks', category: 'Family & support', region: 'Canada', description: 'Find ICNA Relief food-bank locations and registration information. Contact the provider about eligibility.', url: 'https://www.icnareliefcanada.ca/food-banks/', publisher: 'ICNA Relief Canada', checkedAt: '2026-10-18' },
  { id: 'mwc', name: 'Food support & volunteering', category: 'Give back', region: 'Canada', description: 'Discover food-support programs and ways to volunteer with Muslim Welfare Canada.', url: 'https://mwcanada.org/', publisher: 'Muslim Welfare Canada', checkedAt: '2026-10-18' },
  { id: 'ymca', name: 'Settle into the GTA', category: 'Newcomers', region: 'Canada', description: 'Explore immigrant services and connections through the YMCA of Greater Toronto.', url: 'https://www.ymcagta.org/immigrant-services', publisher: 'YMCA of Greater Toronto', checkedAt: '2026-10-18' },
  { id: 'settlement', name: 'Everyday life in Ontario', category: 'Newcomers', region: 'Canada', description: 'Read practical information about settling, learning, working and living in Ontario.', url: 'https://settlement.org/', publisher: 'Settlement.Org', checkedAt: '2026-10-18' },
  { id: 'volunteer', name: 'Make time for your community', category: 'Give back', region: 'Canada', description: 'Find volunteering guidance and connections through Volunteer Canada.', url: 'https://volunteer.ca/', publisher: 'Volunteer Canada', checkedAt: '2026-10-18' },
  { id: 'irc', name: 'Explore humanitarian work', category: 'Give back', region: 'Canada', description: 'Learn about relief projects and ways to get involved with Islamic Relief Canada.', url: 'https://www.islamicreliefcanada.org/', publisher: 'Islamic Relief Canada', checkedAt: '2026-10-18' },
  { id: 'cra', name: 'Look up a Canadian charity', category: 'Community organizations', region: 'Canada', description: 'Check a charity’s registration using the Canada Revenue Agency’s official listing tool.', url: 'https://www.canada.ca/en/revenue-agency/services/charities-giving/charities-listings.html', publisher: 'Canada Revenue Agency', checkedAt: '2026-10-18' },
  { id: 'icna-us', name: 'Find support across the US', category: 'Family & support', region: 'United States', description: 'Explore ICNA Relief USA’s community assistance programs and service locations.', url: 'https://icnarelief.org/', publisher: 'ICNA Relief USA', checkedAt: '2026-10-18' },
  { id: 'icna', name: 'Connect across North America', category: 'Community organizations', region: 'United States', description: 'Explore educational, outreach and community initiatives from ICNA.', url: 'https://icna.org/', publisher: 'Islamic Circle of North America', checkedAt: '2026-10-18' },
  { id: 'usa', name: 'Navigate US public services', category: 'Newcomers', region: 'United States', description: 'Find official US government information and links to public services.', url: 'https://www.usa.gov/', publisher: 'USAGov', checkedAt: '2026-10-18' },
  { id: 'unhcr', name: 'Refugee information by country', category: 'Newcomers', region: 'Global', description: 'Choose a country to find information for refugees and people seeking asylum from UNHCR.', url: 'https://help.unhcr.org/', publisher: 'UNHCR', checkedAt: '2026-10-18' },
  { id: 'ir-global', name: 'Connect with global relief', category: 'Give back', region: 'Global', description: 'Explore international humanitarian programs and information from Islamic Relief Worldwide.', url: 'https://islamic-relief.org/', publisher: 'Islamic Relief Worldwide', checkedAt: '2026-10-18' },
];

export function safeUrl(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; }
  catch { return undefined; }
}
