import type { ReactElement, ReactNode, MouseEventHandler } from 'react';
import type { KitLayout, KitTheme, KitSlotName, KitTrustedRenderer } from './index.js';

export type KitResolvedSlot = {
  readonly name: KitSlotName;
  readonly component: string;
  readonly render: KitTrustedRenderer;
  readonly props: Readonly<Record<string, unknown>>;
};
export type KitAppShellProps = {
  layout: KitLayout;
  registry: Record<string, KitTrustedRenderer>;
  theme?: KitTheme;
  overrides?: Partial<Record<KitSlotName, string>>;
  runtimeProps?: Partial<Record<KitSlotName, Record<string, unknown>>>;
  className?: string;
};
export declare function KitSlotRenderer(props: { slot: KitResolvedSlot }): ReactElement;
export declare function KitAppShell(props: KitAppShellProps): ReactElement;
export declare function KitPanel(props: { title?: string; children?: ReactNode; className?: string }): ReactElement;
export declare function KitStatus(props: { kind: 'loading' | 'empty' | 'error'; message?: string }): ReactElement;
export declare function KitAction(props: {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}): ReactElement;
