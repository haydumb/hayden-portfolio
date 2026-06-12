import { describe, it, expect } from 'vitest';
import { fuzzyFilter, type FilterItem } from './filter';

const items: FilterItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'work', label: 'Work' },
  { id: 'under', label: 'Under the Hood', keywords: 'infra architecture' },
  { id: 'resume', label: 'Download resume', keywords: 'cv pdf' },
  { id: 'contact', label: 'Contact' },
];

describe('fuzzyFilter', () => {
  it('returns all items for an empty query', () => {
    expect(fuzzyFilter('', items)).toHaveLength(items.length);
  });
  it('matches a contiguous substring', () => {
    expect(fuzzyFilter('work', items)[0].id).toBe('work');
  });
  it('matches a subsequence', () => {
    expect(fuzzyFilter('wrk', items).map((i) => i.id)).toContain('work');
  });
  it('matches against keywords', () => {
    expect(fuzzyFilter('pdf', items).map((i) => i.id)).toContain('resume');
  });
  it('is case-insensitive', () => {
    expect(fuzzyFilter('HOME', items)[0].id).toBe('home');
  });
  it('excludes non-matches', () => {
    expect(fuzzyFilter('zzzz', items)).toHaveLength(0);
  });
  it('ranks an exact substring above a scattered subsequence', () => {
    expect(fuzzyFilter('con', items).map((i) => i.id)[0]).toBe('contact');
  });
});
