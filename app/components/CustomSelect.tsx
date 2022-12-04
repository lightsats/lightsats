import { useTheme } from "@nextui-org/react";
import Select from "react-select";
export type SelectOption = { label: string; value: string };

type CustomSelectProps = {
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange(value: string): void;
  width?: string;
};

export function CustomSelect({
  options,
  defaultValue,
  value,
  onChange,
  width,
}: CustomSelectProps) {
  const { theme } = useTheme();
  return (
    <Select
      value={
        value
          ? options.find((option: SelectOption) => option.value === value)
          : undefined
      }
      menuPortalTarget={global.document?.body}
      options={options}
      defaultValue={
        defaultValue
          ? options.find(
              (option: SelectOption) => option.value === defaultValue
            )
          : undefined
      }
      onChange={(e) => e && onChange(e?.value)}
      styles={{
        input: (baseStyles) => ({
          ...baseStyles,
          width,
        }),
        singleValue: (baseStyles) => ({
          ...baseStyles,
          color: theme?.colors?.primary.value,
          fontWeight: theme?.fontWeights.medium.value,
        }),
        control: (baseStyles) => ({
          ...baseStyles,
          border: "none",
          borderRadius: theme?.radii.base.value,
          background: theme?.colors.primaryLight.value,
        }),
        dropdownIndicator: (baseStyles) => ({
          ...baseStyles,
          color: theme?.colors.primary.value,
        }),
        indicatorSeparator: (baseStyles) => ({
          ...baseStyles,
          backgroundColor: "transparent",
        }),
      }}
    />
  );
}
