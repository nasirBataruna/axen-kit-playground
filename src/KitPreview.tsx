import { useState } from 'react';
import { FormWithFeedback } from './FormWithFeedback';
import { DEFAULT_THEME, createKitTheme, defineKitLayout, resolveKitLayout } from '@axenstudio/axen-kit';
import { KitAppShell, KitPanel, KitAction, KitStatus } from '@axenstudio/axen-kit/react';
import '@axenstudio/axen-kit/react.css';

const formLayout = defineKitLayout({ id: 'kit-form-playground', slots: [{ name: 'main', component: 'FormSlot' }] });
const demoLayout = defineKitLayout({ id: 'kit-theme-playground', slots: [{ name: 'main', component: 'DemoSlot' }] });
const slotLayout = defineKitLayout({ id: 'kit-slots-playground', slots: [
  { name: 'header', component: 'HeaderSlot' },
  { name: 'main', component: 'DemoSlot' },
  { name: 'aside', component: 'AsideSlot' }
] });
const registryLayout = defineKitLayout({ id: 'kit-registry-playground', slots: [{ name: 'main', component: 'DemoSlot' }] });
const statusLayout = defineKitLayout({ id: 'kit-status-playground', slots: [{ name: 'main', component: 'StatusSlot' }] });

function FormSlot({ onPayload }: { onPayload: (payload: unknown) => void }) {
  return (
    <KitPanel title="Real Kit + Axen Form">
      <p className="hint">Real KitAppShell slot · Form owns input state and validation</p>
      <FormWithFeedback kitButton onPayload={onPayload} />
    </KitPanel>
  );
}
function DemoSlot() {
  return <KitPanel title="Real Axen Kit Panel"><p>Rendered by the trusted Kit slot registry.</p></KitPanel>;
}
function AlternateSlot() {
  return <KitPanel title="Trusted override"><p>Approved override resolved by Axen Kit.</p></KitPanel>;
}
function HeaderSlot() {
  return <p><strong>Header slot</strong> · Kit's semantic header element</p>;
}
function AsideSlot() {
  return <KitPanel title="Aside slot">Optional sidebar, provided by Kit layout.</KitPanel>;
}
function StatusSlot() {
  return <KitPanel title="Real Kit status primitives">
    <KitStatus kind="loading" message="Loading fixture" />
    <KitStatus kind="empty" message="No records fixture" />
    <KitStatus kind="error" message="Error fixture" />
  </KitPanel>;
}
const alternateTheme = createKitTheme({ colors: { primary: '#7b4fd9', surface: '#f0eafe' } });

export function KitScenarioPreview({ scenarioId, onPayload }: {
  scenarioId: string;
  onPayload: (payload: unknown) => void;
}) {
  const [alternate, setAlternate] = useState(false);
  const theme = alternate ? alternateTheme : DEFAULT_THEME;
  if (scenarioId === 'I01' || scenarioId === 'I02') {
    return <div className="form-wrap">
      <p className="mini-heading">LIVE · AXEN KIT + AXEN FORM</p>
      {scenarioId === 'I02' && <p><KitAction onClick={() => setAlternate(value => !value)}>Switch Kit theme</KitAction></p>}
      <KitAppShell layout={formLayout} registry={{ FormSlot }} theme={theme}
        runtimeProps={{ main: { onPayload } }} />
      <p className="hint">Kit owns layout/theme; real AxenForm owns validation and values.</p>
    </div>;
  }
  if (scenarioId === 'K02') {
    return <div className="form-wrap">
      <p className="mini-heading">LIVE · AXEN KIT SLOTS</p>
      <KitAppShell layout={slotLayout} registry={{ HeaderSlot, DemoSlot, AsideSlot }} />
    </div>;
  }
  if (scenarioId === 'K03') {
    let rejected = '';
    try {
      resolveKitLayout(registryLayout, { DemoSlot, AlternateSlot }, { main: 'UnregisteredSlot' });
    } catch (error) {
      rejected = error instanceof Error ? error.message : 'UNKNOWN_COMPONENT';
    }
    return <div className="form-wrap">
      <p className="mini-heading">LIVE · TRUSTED REGISTRY</p>
      <KitAction onClick={() => setAlternate(value => !value)}>Switch registry override</KitAction>
      <KitAppShell layout={registryLayout} registry={{ DemoSlot, AlternateSlot }}
        overrides={alternate ? { main: 'AlternateSlot' } : {}} />
      <p role="status">Unknown component rejected: {rejected}</p>
    </div>;
  }
  if (scenarioId === 'I03') {
    return <div className="form-wrap">
      <p className="mini-heading">LIVE · KIT STATUS FIXTURES</p>
      <KitAppShell layout={statusLayout} registry={{ StatusSlot }} />
      <p className="hint">Full keyboard/error announcement acceptance remains K3.</p>
    </div>;
  }
  return <div className="form-wrap">
    <p className="mini-heading">LIVE · AXEN KIT THEME</p>
    <KitAction onClick={() => setAlternate(value => !value)}>Switch Kit theme</KitAction>
    <KitAppShell layout={demoLayout} registry={{ DemoSlot }} theme={theme} />
    <p>Default token remains: {DEFAULT_THEME.colors.primary}</p>
    <p className="hint">Theme override uses immutable createKitTheme() tokens.</p>
  </div>;
}
