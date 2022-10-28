import { Link } from "@nextui-org/react";
import { useRouter } from "next/router";
import React from "react";

export function BackButton() {
  const router = useRouter();
  const onBack = React.useCallback(() => router.back(), [router]);
  return <Link onClick={onBack}>Back</Link>;
}
