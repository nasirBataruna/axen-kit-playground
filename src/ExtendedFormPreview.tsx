import { type ChangeEvent } from 'react';
import { type FieldComponentProps, type FormConfig } from '@axenstudio/axen-form';
import { zodAdapter } from '@axenstudio/axen-form/adapters/zod';
import { z } from 'zod';
import { FormWithFeedback } from './FormWithFeedback';

/** AxenForm owns condition evaluation, field values and validation. */
export const conditionalConfig: FormConfig = {
  initialValues: { orderType: '', address: '', itemName: '' },
  fields: [
    {
      name: 'orderType', label: 'Order type', type: 'select', required: true,
      options: [{ value: 'pickup', label: 'Pickup' }, { value: 'delivery', label: 'Delivery' }],
      colSpan: 12
    },
    {
      name: 'address', label: 'Delivery address', type: 'text', required: true,
      hidden: (values) => values.orderType !== 'delivery', colSpan: 12,
      helperText: 'Only required when delivery is selected'
    },
    { name: 'itemName', label: 'Item name', type: 'text', required: true, colSpan: 12 }
  ]
};

/** Fully registered, accessible custom field; not a mock rendering. */
function RegistrationCodeField({
  name, value, label, required, error, helperText, onChange, onBlur, disabled
}: FieldComponentProps) {
  const helperId = `custom-${name}-helper`;
  return (
    <div className="custom-registered-field" data-custom-registration={name}>
      <label htmlFor={`custom-${name}`}>{label} {required && <span aria-hidden="true">*</span>}</label>
      <input id={`custom-${name}`} name={name} type="text"
        value={typeof value === 'string' ? value : ''}
        onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event)}
        onBlur={onBlur} disabled={disabled}
        aria-invalid={error ? 'true' : 'false'} aria-describedby={helperId}
        placeholder="Minimum 4 characters" />
      <div id={helperId} className={error ? 'field-error' : 'field-helper'}
        role={error ? 'alert' : undefined}>
        {helperText || 'Enter a registration code with at least 4 characters.'}
      </div>
    </div>
  );
}
export const customFieldComponents = { registrationCode: RegistrationCodeField };
export const customValidationAdapter = zodAdapter(z);
export const customConfig: FormConfig = {
  initialValues: { displayName: '', registrationCode: '' },
  fields: [
    { name: 'displayName', label: 'Display name', type: 'text',
      required: true, validation: z.string().min(2, 'Enter at least 2 characters'), colSpan: 12 },
    { name: 'registrationCode', label: 'Registration code', type: 'registrationCode',
      required: true, validation: z.string().min(4, 'Enter at least 4 characters'), colSpan: 12 }
  ]
};

export function ExtendedFormPreview({
  scenarioId,
  onPayload,
  onRefAction
}: {
  scenarioId: 'F02' | 'F03';
  onPayload: (payload: unknown) => void;
  onRefAction: (action: string, value: unknown) => void;
}) {
  const conditional = scenarioId === 'F02';
  return (
    <div className="form-wrap">
      <p className="mini-heading">Live · Axen Form 0.1.19 · {scenarioId}</p>
      <p className="hint">{conditional
        ? 'Change Order type. Delivery address is required only for delivery. Try getValues() and resetForm().'
        : 'This code field is registered through Axen Form components and validated by the real Zod adapter.'}</p>
      <FormWithFeedback
        config={conditional ? conditionalConfig : customConfig}
        components={conditional ? undefined : customFieldComponents}
        validationAdapter={conditional ? undefined : customValidationAdapter}
        onPayload={onPayload}
        showRefActions={conditional}
        onRefAction={onRefAction}
      />
    </div>
  );
}
