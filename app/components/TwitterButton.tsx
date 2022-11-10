import { Link } from "@nextui-org/react";
import Image from "next/image";

type TwitterButtonProps = {
  username: string;
};
export function TwitterButton({ username }: TwitterButtonProps) {
  return (
    <Link href={`https://twitter.com/${username}`} target="_blank">
      <Image alt="twitter" src="/icons/twitter.svg" width={16} height={16} />
    </Link>
  );
}
