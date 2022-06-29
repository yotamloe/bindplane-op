import { createContext, PropsWithChildren, useContext, useState } from "react";
import { WizardProps } from ".";
import { FormErrors, FormTouched, FormValues } from "../../types/forms";

interface WizardContextValue<T extends {}> {
  // The current step of the wizard starting at 0
  step: number;

  // The function provided to components to change the step
  goToStep: (step: number) => void;

  // Object mapping form names to their value
  formValues: FormValues<T>;
  setValues: (formValue: Partial<FormValues<T>>) => void;

  // Object mapping form names to their error
  formErrors: FormErrors<T>;
  setErrors: (formValue: Partial<FormErrors<T>>) => void;

  // Object mapping form names to their touched state
  formTouched: FormTouched<T>;
  setTouched: (formValue: Partial<FormTouched<T>>) => void;
}

const defaultValue: WizardContextValue<any> = {
  step: 0,
  goToStep: (step) => {},
  formValues: {},
  formErrors: {},
  formTouched: {},
  setValues: () => {},
  setErrors: () => {},
  setTouched: () => {},
};

const WizardContext = createContext(defaultValue);

export function useWizard<T>(): WizardContextValue<T> {
  return useContext(WizardContext);
}

export const WizardContextProvider = <T extends object>({
  initialFormValues,
  children,
}: PropsWithChildren<Pick<WizardProps<T>, "initialFormValues">>) => {
  const [step, setStep] = useState(0);
  const [formValues, setFormValues] =
    useState<FormValues<T>>(initialFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors<T>>(
    initializeErrors(initialFormValues)
  );
  const [formTouched, setFormTouched] = useState<FormTouched<T>>(
    initializeTouched(initialFormValues)
  );

  function setValues(v: Partial<FormValues<T>>) {
    setFormValues((prev) => ({ ...prev, ...v }));
  }

  function setErrors(e: Partial<FormErrors<T>>) {
    setFormErrors((prev) => ({ ...prev, ...e }));
  }

  function setTouched(t: Partial<FormTouched<T>>) {
    setFormTouched((prev) => ({ ...prev, ...t }));
  }

  function goToStep(s: number) {
    setStep(s);
  }

  return (
    <WizardContext.Provider
      value={{
        step,
        goToStep,
        formValues,
        setValues,
        formErrors,
        setErrors,
        formTouched,
        setTouched,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

function initializeErrors<T extends {}>(
  initialValues: T
): FormErrors<typeof initialValues> {
  const errors: any = {};
  for (const key of Object.keys(initialValues)) {
    errors[key] = null;
  }

  return errors;
}

function initializeTouched<T>(initialValues: FormValues<T>): FormTouched<T> {
  const touched: any = {};
  for (const key of Object.keys(initialValues)) {
    touched[key] = false;
  }
  return touched;
}
