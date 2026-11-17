// React rendering is opt-in: the headless Kit entrypoint does not import React.
import { createElement } from 'react';
import { DEFAULT_THEME, kitCssVariables, resolveKitLayout } from './index.js';

const SLOT_TAGS = Object.freeze({
  header: 'header',
  nav: 'nav',
  main: 'main',
  aside: 'aside',
  footer: 'footer'
});
const STATUS_LABELS = Object.freeze({
  loading: 'Loading',
  empty: 'Nothing to display',
  error: 'Unable to load'
});

export function KitSlotRenderer({ slot }) {
  if (!slot || !Object.hasOwn(SLOT_TAGS, slot.name) || !slot.render) {
    throw new TypeError('INVALID_RESOLVED_SLOT');
  }
  const tag = SLOT_TAGS[slot.name];
  return createElement(tag, {
    className: 'axen-kit-slot axen-kit-slot--' + slot.name,
    'data-axen-kit-slot': slot.name,
    ...(slot.name === 'nav' ? { 'aria-label': 'Primary navigation' } : {})
  }, createElement(slot.render, slot.props));
}

export function KitAppShell({
  layout,
  registry,
  theme = DEFAULT_THEME,
  overrides = {},
  runtimeProps = {},
  className = ''
}) {
  const slots = resolveKitLayout(layout, registry, overrides, runtimeProps);
  const withAside = slots.some((slot) => slot.name === 'aside');
  const classes = ['axen-kit-shell', className].filter(Boolean).join(' ');
  return createElement('div', {
    className: classes,
    'data-axen-kit-shell': layout.id,
    'data-axen-kit-aside': String(withAside),
    style: kitCssVariables(theme)
  }, ...slots.map((slot) => createElement(KitSlotRenderer, {
    key: slot.name,
    slot
  })));
}

export function KitPanel({ title, children, className = '' }) {
  return createElement('section', {
    className: ['axen-kit-panel', className].filter(Boolean).join(' '),
    ...(title ? { 'aria-label': title } : {})
  },
  title ? createElement('h2', { className: 'axen-kit-panel__title' }, title) : null,
  children);
}

export function KitStatus({ kind, message }) {
  if (!Object.hasOwn(STATUS_LABELS, kind)) throw new TypeError('UNKNOWN_STATUS_KIND');
  return createElement('div', {
    className: 'axen-kit-status axen-kit-status--' + kind,
    role: kind === 'error' ? 'alert' : 'status',
    'aria-live': kind === 'error' ? 'assertive' : 'polite',
    'data-axen-kit-status': kind
  }, message ?? STATUS_LABELS[kind]);
}

export function KitAction({ children, onClick, disabled = false, loading = false, type = 'button' }) {
  return createElement('button', {
    className: 'axen-kit-action',
    type,
    onClick,
    disabled: disabled || loading,
    'aria-busy': loading ? 'true' : undefined
  }, children);
}
