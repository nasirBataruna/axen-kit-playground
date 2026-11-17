import { useRef, useState } from 'react';
import { AxenForm, defaultComponentMap, type AxenFormRef, type FormConfig } from '@axenstudio/axen-form';
import { KitAction } from '@axenstudio/axen-kit/react';

export const formConfig: FormConfig = {
  initialValues: { fullName: '', email: '' },
  fields: [
    { name: 'fullName', type: 'text', label: 'Full name', required: true, colSpan: 6 },
    { name: 'email', type: 'email', label: 'Email address', required: true, colSpan: 6 }
  ]
};

type Phase = 'idle' | 'validating' | 'submitting' | 'invalid' | 'success' | 'error';
const messages: Record<Phase, string> = {
  idle: 'Complete the fields, then submit the form.',
  validating: 'Checking the required fields…',
  submitting: 'Submitting your demo form…',
  invalid: 'Please correct the highlighted fields before submitting.',
  success: 'Submission successful. Your values are recorded in Events / output.',
  error: 'Submission failed. Please try again.'
};

/** The callback, not the button click, is the source of truth for success. */
export function FormWithFeedback({
  onPayload,
  kitButton = false
}: {
  onPayload: (payload: unknown) => void | Promise<void>;
  kitButton?: boolean;
}) {
  const formRef = useRef<AxenFormRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const [phase, setPhase] = useState<Phase>('idle');
  const busy = phase === 'validating' || phase === 'submitting';

  async function submit() {
    if (inFlight.current) return;
    const api = formRef.current;
    if (!api) {
      setPhase('error');
      return;
    }
    inFlight.current = true;
    setPhase('validating');
    try {
      const errors = await api.validate();
      const names = Object.keys(errors);
      if (names.length > 0) {
        setPhase('invalid');
        inFlight.current = false;
        const first = Array.from(containerRef.current?.querySelectorAll<HTMLInputElement>('[name]') ?? [])
          .find(input => input.name === names[0]);
        first?.focus();
        return;
      }
      setPhase('submitting');
      // The public AxenFormRef.submit() returns void. Never call this success.
      // Only the genuine onSubmit callback can transition to success.
      api.submit();
    } catch {
      setPhase('error');
      inFlight.current = false;
    }
  }

  async function handleSubmit(payload: unknown) {
    try {
      await onPayload(payload);
      setPhase('success');
    } catch {
      setPhase('error');
    } finally {
      inFlight.current = false;
    }
  }

  return (
    <div
      ref={containerRef}
      className="submit-control"
      onChangeCapture={() => {
        if (!inFlight.current && (phase === 'success' || phase === 'invalid' || phase === 'error'))
          setPhase('idle');
      }}
      onSubmitCapture={(event) => {
        // Native Enter submission follows the same validated, visible workflow.
        event.preventDefault();
        event.stopPropagation();
        void submit();
      }}
    >
      <AxenForm ref={formRef} config={formConfig} components={defaultComponentMap}
        validationPolicy={{ mode: 'standard' }}
        onSubmit={(values) => handleSubmit(values)} />
      <div className="submit-actions">
        {kitButton ? (
          <KitAction loading={busy} disabled={busy} onClick={() => { void submit(); }}>
            {busy ? 'Submitting…' : 'Submit Kit + Form'}
          </KitAction>
        ) : (
          <button className="primary-link" type="button" disabled={busy}
            onClick={() => { void submit(); }}>
            {busy ? 'Submitting…' : 'Submit form'}
          </button>
        )}
      </div>
      <div data-submit-state={phase} className={`submit-feedback submit-feedback--${phase}`}
        role={phase === 'invalid' || phase === 'error' ? 'alert' : 'status'}
        aria-live={phase === 'invalid' || phase === 'error' ? 'assertive' : 'polite'}
        aria-atomic="true">
        <span aria-hidden="true" className="submit-feedback-icon">
          {phase === 'success' ? '✓' : phase === 'invalid' || phase === 'error' ? '!' : phase === 'validating' || phase === 'submitting' ? '◌' : 'i'}
        </span>
        <span>{messages[phase]}</span>
      </div>
    </div>
  );
}
