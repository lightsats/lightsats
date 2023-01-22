import { Loading, Spacer, Text } from "@nextui-org/react";
import { Tip } from "@prisma/client";
import { TipForm } from "components/tipper/TipForm/TipForm";
import {
  getSharedTipFormRequestFields,
  TipFormData,
  TipFormSubmitData,
} from "components/tipper/TipForm/TipFormData";
import { differenceInHours } from "date-fns";
import { useTip } from "hooks/useTip";
import { DEFAULT_FIAT_CURRENCY } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import useSWRImmutable from "swr/immutable";
import { UpdateTipRequest } from "types/TipRequest";

const EditTip: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tip, mutate: mutateTip } = useTip(
    id as string,
    false,
    useSWRImmutable
  );

  const tipFormDefaultValues = React.useMemo(() => {
    if (!tip) {
      return undefined;
    }

    const expiresIn = Math.max(
      Math.ceil(differenceInHours(new Date(tip.expiry), new Date()) / 24),
      1
    );

    const defaultValues: Partial<TipFormData> = {
      currency: tip.currency || DEFAULT_FIAT_CURRENCY,
      expiresIn,
      expiryUnit: "days",
      tippeeLocale: tip.tippeeLocale || undefined,
      note: tip.note || undefined,
      tippeeName: tip.tippeeName || undefined,
      skipOnboarding: tip.skipOnboarding,
      recommendedWalletId: tip.recommendedWalletId || undefined,
      anonymousTipper: tip.anonymousTipper,
      showAdvancedOptions: true,
    };
    return defaultValues;
  }, [tip]);

  const onSubmit = React.useCallback(
    async (data: TipFormSubmitData) => {
      try {
        const updateTipRequest: UpdateTipRequest = {
          ...getSharedTipFormRequestFields(data),
          tippeeName: data.tippeeName?.length ? data.tippeeName : undefined,
        };
        const result = await fetch(`/api/tipper/tips/${id}`, {
          method: "PUT",
          body: JSON.stringify(updateTipRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Tip updated");
          const updatedTip = (await result.json()) as Tip;
          mutateTip(updatedTip);
          router.push(`${PageRoutes.tips}/${updatedTip.id}`);
        } else {
          toast.error("Failed to update tip: " + result.statusText);
        }
      } catch (error) {
        console.error(error);
        toast.error("Tip update failed. Please try again.");
      }
    },
    [id, mutateTip, router]
  );

  if (!tip) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Text h3>✏️ Edit tip</Text>
      <Spacer />
      <TipForm
        onSubmit={onSubmit}
        defaultValues={tipFormDefaultValues}
        mode="update"
      />
    </>
  );
};

export default EditTip;
