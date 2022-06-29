export type FormValues<T extends {}> = T;
export type FormErrors<T extends {}> = {
  [Property in keyof T]: string | null;
};
export type FormTouched<T extends {}> = {
  [Property in keyof T]: boolean;
};

interface ConfigValues {
  name: string;
  description: string;
  rawConfig: string;
  platform: string;
  fileName: string;
}

export type RawConfigFormValues = FormValues<ConfigValues>;
export type RawConfigFormErrors = FormErrors<ConfigValues>;
export type RawConfigFormTouched = FormTouched<ConfigValues>;
