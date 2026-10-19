import { safeUrl } from './community';
export const submissionTypes = ['mosque', 'business', 'event', 'organization', 'resource', 'correction', 'claim'] as const;
export function validateSubmission(value: unknown) {
  if (!value || typeof value !== 'object') throw new Error('Please complete the form.');
  const input = value as Record<string, unknown>;
  const field = (key: string, max: number) => { const value = typeof input[key] === 'string' ? (input[key] as string).trim() : ''; if (value.length > max) throw new Error(`${key} is too long.`); return value; };
  const type = field('type', 30), name = field('name', 180), city = field('city', 120), email = field('email', 254).toLowerCase(), description = field('description', 4000), url = field('url', 1000), listing = field('listing', 500);
  if (!(submissionTypes as readonly string[]).includes(type)) throw new Error('Choose a suggestion type.');
  if (name.length < 3 || city.length < 2 || description.length < 20) throw new Error('Include a name, city and at least 20 characters of useful details.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.');
  if (!safeUrl(url)) throw new Error('Include an http or https source link so we can check the information.');
  if (listing && (!listing.startsWith('/') || listing.startsWith('//'))) throw new Error('The listing reference is invalid.');
  if (field('company', 200)) throw new Error('This submission could not be accepted.');
  if (input.consent !== true) throw new Error('Please confirm your permission to share this information.');
  return { type, name, city, email, description, url, listing };
}
