export type ScenarioGroup = 'Kit' | 'Form' | 'Integrated';
export type ScenarioState = 'live-form' | 'kit-pending' | 'future';

export type Scenario = Readonly<{
  id: string;
  name: string;
  group: ScenarioGroup;
  purpose: string;
  expected: string;
  state: ScenarioState;
}>;

export const scenarios: readonly Scenario[] = [
  { id:'K01', group:'Kit', name:'Theme & tokens', purpose:'Default and override theme', expected:'Default theme stays immutable across overrides', state:'kit-pending' },
  { id:'K02', group:'Kit', name:'Layout slots', purpose:'Required and optional slots', expected:'Slots render without overflow at 375, 900 and 1200px', state:'kit-pending' },
  { id:'K03', group:'Kit', name:'Trusted registry', purpose:'Allowlisted component resolution', expected:'Known overrides render; unknown components are rejected', state:'kit-pending' },
  { id:'F01', group:'Form', name:'Basic submission', purpose:'Real Axen Form with two fields', expected:'Required fields validate and submit a structured payload', state:'live-form' },
  { id:'F02', group:'Form', name:'Conditional & reset', purpose:'Form hidden fields and imperative reset', expected:'Conditional values and reset follow real Form contract', state:'future' },
  { id:'F03', group:'Form', name:'Custom field', purpose:'Registration and validation', expected:'Custom field passes real Form adapter validation', state:'future' },
  { id:'I01', group:'Integrated', name:'Kit + Form shell', purpose:'Render Form inside real Kit AppShell', expected:'Form owns values and submit while Kit owns presentation', state:'kit-pending' },
  { id:'I02', group:'Integrated', name:'Theme preservation', purpose:'Switch Kit theme during editing', expected:'Theme changes never erase in-progress Form data', state:'kit-pending' },
  { id:'I03', group:'Integrated', name:'Accessible states', purpose:'Keyboard, errors and status presentation', expected:'Focus, errors, loading/empty states remain accessible', state:'kit-pending' }
];

export function getScenario(id: string | undefined): Scenario | undefined {
  return scenarios.find((item) => item.id === id?.toUpperCase());
}

export const groups: readonly ScenarioGroup[] = ['Kit','Form','Integrated'];

export const KIT_PROVIDER = '2d9af79bac53c7e6dbd6628d712199ea209add8d';
export const FORM_VERSION = '0.1.19';
