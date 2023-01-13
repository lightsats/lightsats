import { Card, Input, Row, Spacer, Text } from "@nextui-org/react";
import { CustomSelect, SelectOption } from "components/CustomSelect";
import { MobilePrintWarning } from "components/tipper/MobilePrintWarning";

type PrintDesignPickerProps<T> = {
  themeSelectOptions: SelectOption[];
  theme: T;
  setTheme(theme: T): void;
  backgroundUrl: string;
  setBackgroundUrl(backgroundUrl: string): void;
};

export function PrintDesignPicker<T>({
  themeSelectOptions,
  theme,
  setTheme,
  backgroundUrl,
  setBackgroundUrl,
}: PrintDesignPickerProps<T>) {
  return (
    <Card>
      <Card.Header>
        <Text h5>🎨 Choose your design</Text>
      </Card.Header>
      <Card.Body css={{ pt: 0 }}>
        <MobilePrintWarning />
        <Row align="center" justify="space-between">
          <Text>Theme</Text>
          <CustomSelect
            options={themeSelectOptions}
            value={theme as string}
            onChange={(value) => {
              if (value) {
                setTheme(value as T);
              }
            }}
          />
        </Row>
        <Row></Row>
        <Spacer />
        <Input
          fullWidth
          label="Custom Background Image URL"
          value={backgroundUrl}
          placeholder={
            "https://images.pexels.com/photos/14546306/pexels-photo-14546306.jpeg"
          }
          onChange={(e) => setBackgroundUrl(e.target.value)}
        />
      </Card.Body>
    </Card>
  );
}
