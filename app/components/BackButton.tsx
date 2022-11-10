import { Button } from "@nextui-org/react";

const onBack = () => {
  history.back();
};

export function BackButton() {
  return (
    <Button bordered onClick={onBack}>
      Back
    </Button>
  );
}
