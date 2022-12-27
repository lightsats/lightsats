import { useTheme } from "@nextui-org/react";
import Select from "react-select";
export type SelectOption = { label: string; value: string | undefined };

type CustomSelectProps = {
  options: SelectOption[];
  defaultValue?: string;
  value?: string;
  onChange(value: string | undefined): void;
  width?: string;
  isClearable?: boolean;
};

export function CustomSelect({
  options,
  defaultValue,
  value,
  onChange,
  width,
  isClearable,
}: CustomSelectProps) {
  const { theme } = useTheme();

  // function handleChange = React.useCallback((event) => {
  //   // Overwrite the event with your own object if it doesn't exist
  //   if (!event) {
  //     event = {
  //       target: inputRef,
  //       value: '',
  //     };
  //   }
  //   onChange(event);
  // });

  return (
    <Select
      value={
        value
          ? options.find((option: SelectOption) => option.value === value)
          : undefined
      }
      isClearable={isClearable}
      menuPortalTarget={global.document?.body}
      options={options}
      defaultValue={
        defaultValue
          ? options.find(
              (option: SelectOption) => option.value === defaultValue
            )
          : undefined
      }
      onChange={(e) => (e || isClearable) && onChange(e?.value)}
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
        clearIndicator: (baseStyles) => ({
          ...baseStyles,
          color: theme?.colors.secondary.value,
          marginRight: "-10px",
          marginLeft: "-10px",
        }),
      }}
    />
  );
}
