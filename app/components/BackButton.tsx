import { Button } from "@nextui-org/react";

const onBack = () => {
  alert("BACK");
  history.back();
};

export function BackButton() {
  return <Button onClick={onBack}>Back</Button>;
}
