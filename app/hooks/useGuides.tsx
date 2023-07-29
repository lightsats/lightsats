import { useTranslation } from "next-i18next";

import {
  BanknotesIcon,
  BookOpenIcon,
  CircleStackIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  GiftIcon,
  HeartIcon,
  PaperAirplaneIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import { PageRoutes } from "lib/PageRoutes";
import React from "react";
import { Guide } from "types/Guide";

export function useGuides() {
  const { t } = useTranslation("guide");

  const guides: Guide[] = React.useMemo(
    () => [
      {
        name: t("spend.name"),
        description: t("spend.description"),
        shortDescription: t("spend.shortDescription"),
        icon: <CreditCardIcon />,
        link: PageRoutes.guideSpend,
      },
      {
        name: t("earn.name"),
        description: t("earn.description"),
        icon: <BanknotesIcon />,
        link: PageRoutes.guideEarn,
      },
      {
        name: t("buy.name"),
        description: t("buy.description"),
        icon: <CurrencyDollarIcon />,
        link: PageRoutes.guideBuy,
      },
      {
        name: t("save.name"),
        description: t("save.description"),
        icon: <CircleStackIcon />,
        link: PageRoutes.guideSave,
      },
      {
        name: t("send.name"),
        description: t("send.description"),
        icon: <PaperAirplaneIcon />,
        link: PageRoutes.guideSend,
      },
      {
        name: t("tip.name"),
        description: t("tip.description"),
        icon: <GiftIcon />,
        link: PageRoutes.guideTip,
      },
      {
        name: t("donate.name"),
        description: t("donate.description"),
        icon: <HeartIcon />,
        link: PageRoutes.guideDonate,
      },
      {
        name: t("learn.name"),
        description: t("learn.description"),
        shortDescription: t("learn.shortDescription"),
        icon: <BookOpenIcon />,
        link: PageRoutes.guideLearn,
      },
      {
        name: t("wallets.name"),
        description: t("wallets.description"),
        icon: <WalletIcon />,
        link: PageRoutes.guideWallets,
      },
    ],
    [t]
  );
  return guides;
}
