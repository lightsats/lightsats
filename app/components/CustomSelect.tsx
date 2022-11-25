import { useTheme } from "@nextui-org/react";
import Select from "react-select";
export type SelectOption = { label: string; value: string };

type CustomSelectProps = {
  options: SelectOption[];
  defaultValue: string;
  onChange(value: string): void;
  width?: string;
};

export function CustomSelect({
  options,
  defaultValue,
  onChange,
  width,
}: CustomSelectProps) {
  const { theme } = useTheme();
  return (
    <Select
      menuPortalTarget={document.body}
      options={options}
      defaultValue={options.find(
        (option: SelectOption) => option.value === defaultValue
      )}
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
          height: "40px",
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
