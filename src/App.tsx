import { useRef, useState } from 'react';
import { NavLink, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AxenForm, defaultComponentMap, type AxenFormRef, type FormConfig } from '@axenstudio/axen-form';
import { FORM_VERSION, groups, KIT_PROVIDER, getScenario, scenarios, type Scenario } from './scenarios';
import { KitScenarioPreview } from './KitPreview';

const formConfig: FormConfig = {
  initialValues: { fullName: '', email: '' },
  fields: [
    { name: 'fullName', type: 'text', label: 'Full name', required: true, colSpan: 6 },
    { name: 'email', type: 'email', label: 'Email address', required: true, colSpan: 6 }
  ]
};

function statusLabel(state: Scenario['state']) {
  return state === 'live-form' ? 'Real Form demo' :
    state === 'live-kit' ? 'Real Kit demo' :
    state === 'live-integrated' ? 'Kit + Form live' :
    state === 'kit-pending' ? 'Kit artifact pending' : 'Behavior planned';
}
function sourceSample(scenario: Scenario) {
  if (scenario.id === 'F01') return `import { AxenForm, defaultComponentMap } from '@axenstudio/axen-form';

// This is the actual live F01 example in the playground.
const formRef = useRef<AxenFormRef>(null);
<AxenForm ref={formRef} config={formConfig}
  components={defaultComponentMap}
  onSubmit={(values) => record(values)} />
<button type="button" onClick={() => formRef.current?.submit()}>
  Submit form
</button>`;
  if (scenario.group === 'Form') return '// K3 behavior fixture not yet implemented.\n// Do not treat this sample as a passing Form test.';
  return `import { defineKitLayout, createKitTheme } from '@axenstudio/axen-kit';
import { KitAppShell, KitPanel } from '@axenstudio/axen-kit/react';
// Real Kit-only package pinned from axen-lib @ ${KIT_PROVIDER}
// Live implementation: src/KitPreview.tsx
// Scenario ${scenario.id} uses real Kit registry, slots and presentation.`;
}
function configSample(scenario: Scenario) {
  if (scenario.id === 'F01') return JSON.stringify(formConfig, null, 2);
  return JSON.stringify({
    scenario: scenario.id,
    provider: scenario.group === 'Form' ? '@axenstudio/axen-form@0.1.19' : '@axenstudio/axen-kit@0.1.0',
    status: scenario.state,
    fixture: scenario.state === 'future' ? 'pending K3 implementation' : 'real Kit runtime; full K3 acceptance pending',
    expected: scenario.expected
  }, null, 2);
}

function RealFormPreview({ onPayload }: { onPayload: (payload: unknown) => void }) {
  const formRef = useRef<AxenFormRef>(null);
  return (
    <div className="form-wrap">
      <p className="mini-heading">Live · Axen Form v{FORM_VERSION}</p>
      <AxenForm
        ref={formRef}
        config={formConfig}
        components={defaultComponentMap}
        onSubmit={(values) => onPayload(values)}
      />
      <button
        type="button"
        className="primary-link"
        style={{ border: 0, marginTop: 18, fontWeight: 700 }}
        onClick={() => formRef.current?.submit()}
      >
        Submit form
      </button>
      <p className="hint">Submit this form to append its real payload to the Events panel. No data leaves the browser.</p>
    </div>
  );
}

function WaitingPreview({ scenario }: { scenario: Scenario }) {
  const isKit = scenario.state === 'kit-pending';
  return (
    <div className="waiting-content" role="status">
      <div className="waiting-symbol" aria-hidden="true">{isKit ? '⌘' : '◇'}</div>
      <span className="state-pill">{isKit ? 'Library delivery gate' : 'K3 implementation gate'}</span>
      <h3>{isKit ? 'Kit runtime is not shipped here yet' : 'This behavior is not implemented yet'}</h3>
      <p>{isKit
        ? 'This repository is public, but the pinned Kit provider is private. We will not publish a private package or pretend a demo surface is the actual Kit.'
        : 'The real Form engine is available in F01. This scenario will be added and browser-verified during K3.'}
      </p>
      <div className="illustration-row" aria-label="Illustrative, non-Kit placeholder components">
        <div><small>DEMO ONLY</small><strong>Theme</strong><span>token · surface</span></div>
        <div><small>DEMO ONLY</small><strong>Slot</strong><span>header · main</span></div>
        <div><small>DEMO ONLY</small><strong>Result</strong><span>awaiting proof</span></div>
      </div>
      <p className="hint">No Kit source, tarballs, credentials, or fake acceptance results are embedded in this public repository.</p>
      <div className="reference-actions">
        <a href="https://github.com/nasirBataruna/axen-lib/pull/5" target="_blank" rel="noreferrer">Pinned Kit PR #5</a>
        <a href="https://github.com/nasirBataruna/axen-form-playground" target="_blank" rel="noreferrer">Form reference</a>
      </div>
    </div>
  );
}

function ScenarioPanel({ scenario }: { scenario: Scenario }) {
  const [tab, setTab] = useState<'config' | 'source'>('config');
  const [events, setEvents] = useState<string[]>([]);
  const [resetKey, setResetKey] = useState(0);
  function reset() {
    setResetKey(value => value + 1);
    setEvents(['Reset requested: component remounted; previous demo output cleared']);
  }
  function record(payload: unknown) {
    setEvents(history => [
      JSON.stringify({ event: 'form.submit', payload }, null, 2),
      ...history
    ]);
  }
  return (
    <div className="scenario-page">
      <div className="page-head">
        <div>
          <p className="eyebrow">SCENARIO / {scenario.group.toUpperCase()} / {scenario.id}</p>
          <h2>{scenario.name}</h2>
          <p>{scenario.purpose}</p>
        </div>
        <span className={`state-pill ${scenario.state.startsWith('live-') ? 'live' : ''}`}>{statusLabel(scenario.state)}</span>
      </div>
      <div className="workbench">
        <section className="lab-panel live-panel" aria-label="Live scenario">
          <div className="panel-bar"><span><span className="dot live-dot" /> Live preview</span><button type="button" onClick={reset}>↺ Reset</button></div>
          {scenario.id === 'F01'
            ? <RealFormPreview key={resetKey} onPayload={record} />
            : scenario.state === 'live-kit' || scenario.state === 'live-integrated'
              ? <KitScenarioPreview key={resetKey} scenarioId={scenario.id} onPayload={record} />
              : <WaitingPreview scenario={scenario} />}
        </section>
        <section className="lab-panel code-panel" aria-label="Config and source">
          <div className="panel-bar">
            <span>Configuration & source</span>
            <div className="tabs" role="group" aria-label="Choose code panel">
              <button type="button" className={tab==='config'?'selected':''} onClick={() => setTab('config')}>Config</button>
              <button type="button" className={tab==='source'?'selected':''} onClick={() => setTab('source')}>Source</button>
            </div>
          </div>
          <div className="code-caption">{tab === 'source' ? 'Representative source · clearly marked if not runnable' : 'Versioned scenario configuration'}</div>
          <pre><code>{tab==='source' ? sourceSample(scenario) : configSample(scenario)}</code></pre>
        </section>
      </div>
      <div className="bottom-grid">
        <section className="lab-panel lower">
          <h3>Expected behavior</h3>
          <p>{scenario.expected}</p>
          <span className="evidence-label">{scenario.state === 'future' ? 'Planned · K3' : 'Real runtime · full K3 acceptance pending'}</span>
        </section>
        <section className="lab-panel lower">
          <div className="section-title"><h3>Events / output</h3><span>{events.length} events</span></div>
          {events.length ? <pre className="event-log">{events.join('\n\n')}</pre> : <p className="muted">No events. Submit F01 or press Reset to record an observed action.</p>}
        </section>
      </div>
      <div className="provenance">
        <strong>Provenance</strong>
        <span>Axen Kit 0.1.0 · Kit-only local package · SHA <code>{KIT_PROVIDER.slice(0,12)}</code></span>
        <span>Axen Form {FORM_VERSION} · public dependency</span>
        <span>K2 A04 shell · not K3/K4 accepted</span>
      </div>
    </div>
  );
}
function ScenarioRoute() {
  const { id } = useParams();
  const scenario = getScenario(id);
  if (!scenario) return (
    <div className="not-found">
      <h2>Scenario not found</h2>
      <p>Use the navigation to open a registered K01–I03 route.</p>
      <NavLink to="/scenario/F01">Open live Form example</NavLink>
    </div>
  );
  return <ScenarioPanel key={scenario.id} scenario={scenario} />;
}

function Landing() {
  return (
    <div className="landing">
      <div className="intro">
        <p className="eyebrow">AXEN ECOSYSTEM / G3 / K2</p>
        <h1>Explore the boundaries.<br /><span>Prove the behavior.</span></h1>
        <p>The independent scenario lab for Axen Kit and Axen Form. Navigate real examples, inspect config and source, and track exactly which claims have evidence.</p>
        <div className="landing-actions">
          <NavLink className="primary-link" to="/scenario/F01">Open real Form demo →</NavLink>
          <a href="https://github.com/nasirBataruna/axen-lib/pull/5" target="_blank" rel="noreferrer">View pinned Kit source ↗</a>
        </div>
      </div>
      <div className="overview-grid">
        {groups.map(group => (
          <div className="overview-card" key={group}>
            <span className="card-index">{group==='Kit'?'01':group==='Form'?'02':'03'} / CAPABILITY</span>
            <h2>{group}</h2>
            <p>{group==='Kit'?'Theme, layout slots, trusted registry':group==='Form'?'Real form state and submitted payload':'Composition, persistence and accessibility'}</p>
            <span>{scenarios.filter(item => item.group === group).length} registered routes</span>
          </div>
        ))}
      </div>
      <p className="landing-note">Real Kit + Form composition runs in I01/I02. Form F02/F03 remain planned. Full K3/K4 scenario acceptance is separate.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand" aria-label="Axen Kit Playground home">
          <div className="brand-logo">A<span>✦</span></div>
          <div><strong>Axen Lab</strong><small>Kit / Form Playground</small></div>
        </NavLink>
        <div className="sidebar-section-title">SCENARIO LIBRARY <span>09</span></div>
        <nav aria-label="Scenarios">
          {groups.map(group => (
            <div className="nav-group" key={group}>
              <div className="nav-group-head">{group}</div>
              {scenarios.filter(item=>item.group===group).map(item=>(
                <NavLink key={item.id} to={`/scenario/${item.id}`}
                  className={({isActive})=>`nav-entry ${isActive?'active':''}`}>
                  <span className="nav-code">{item.id}</span><span>{item.name}</span>
                  {item.state==='live-form' && <span className="live-indicator" title="Live demo" />}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="health-line"><span className="health-light" /> Public shell · K2 in progress</div>
          <a href="https://github.com/nasirBataruna/axen-kit-playground" target="_blank" rel="noreferrer">GitHub repository ↗</a>
          <small>Not a Kit release · Demo data only</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumbs"><strong>AXEN</strong><span>/</span><span>Developer playground</span></div>
          <div className="topbar-right"><span className="version-chip">React 19 / Vite</span><a href="https://stackblitz.com/github/nasirBataruna/axen-kit-playground/tree/k2-a04-preview" target="_blank" rel="noreferrer">Open StackBlitz ↗</a></div>
        </header>
        <main id="content">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/scenario/:id" element={<ScenarioRoute />} />
            <Route path="/scenarios" element={<Navigate replace to="/scenario/F01" />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
