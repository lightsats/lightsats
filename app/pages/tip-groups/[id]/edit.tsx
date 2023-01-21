import { Loading, Spacer, Text } from "@nextui-org/react";
import { Alert } from "components/Alert";
import { TipForm, TipFormSubmitData } from "components/tipper/TipForm/TipForm";
import { TipFormData } from "components/tipper/TipForm/TipFormData";
import { add, differenceInHours } from "date-fns";
import { ApiRoutes } from "lib/ApiRoutes";
import { DEFAULT_FIAT_CURRENCY, DEFAULT_NAME } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import useSWRImmutable from "swr/immutable";
import { TipGroupWithTips } from "types/TipGroupWithTips";
import { UpdateTipsRequest } from "types/TipRequest";

const EditTipGroup: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tipGroup, mutate: mutateTipGroup } =
    useSWRImmutable<TipGroupWithTips>(
      `${ApiRoutes.tipGroups}/${id}`,
      defaultFetcher
    );

  const tipFormDefaultValues = React.useMemo(() => {
    if (!tipGroup) {
      return undefined;
    }

    const firstTip = tipGroup.tips[0];
    const secondTip = tipGroup.tips[1];
    if (!secondTip) {
      throw new Error(
        "Tip group should have at least two tips: " + tipGroup.id
      );
    }

    const expiresIn = Math.max(
      Math.ceil(differenceInHours(new Date(firstTip.expiry), new Date()) / 24),
      1
    );

    let note: string | undefined;
    if (firstTip.note) {
      note = firstTip.note.replaceAll(
        firstTip.tippeeName ?? DEFAULT_NAME,
        "{{name}}"
      );
    }
    let tippeeName = undefined;
    let enterIndividualNames = false;
    if (
      tipGroup.tips.every(
        (tip) =>
          tip.tippeeName &&
          tip.tippeeName.indexOf(((tip.groupTipIndex || 0) + 1).toString()) > 0
      )
    ) {
      tippeeName = firstTip.tippeeName?.replace("1", "{{index}}");
    } else if (firstTip.tippeeName && firstTip.tippeeName !== DEFAULT_NAME) {
      tippeeName = tipGroup.tips
        .map((tip) => tip.tippeeName)
        .filter((tipName) => tipName)
        .join("\n");
      enterIndividualNames = tippeeName.split("\n").length > 1;
    }

    const defaultValues: Partial<TipFormData> = {
      currency: firstTip.currency || DEFAULT_FIAT_CURRENCY,
      expiresIn,
      expiryUnit: "days",
      tippeeLocale: firstTip.tippeeLocale || undefined,
      note,
      tippeeName,
      skipOnboarding: firstTip.skipOnboarding,
      enterIndividualNames,
      showAdvancedOptions: true,
    };
    return defaultValues;
  }, [tipGroup]);

  const onSubmit = React.useCallback(
    async (data: TipFormSubmitData) => {
      try {
        const updateTipGroupTipsRequest: UpdateTipsRequest = {
          currency: data.currency,
          note: data.note?.length ? data.note : undefined,
          expiry: add(new Date(), {
            [data.expiryUnit]: data.expiresIn,
          }),
          tippeeNames: data.tippeeName?.length
            ? data.tippeeName.split("\n")
            : undefined,
          tippeeLocale: data.tippeeLocale,
          skipOnboarding: data.skipOnboarding,
        };
        const result = await fetch(`/api/tipGroups/${id}/tips`, {
          method: "PUT",
          body: JSON.stringify(updateTipGroupTipsRequest),
          headers: { "Content-Type": "application/json" },
        });
        if (result.ok) {
          toast.success("Tips updated");
          const updatedTipGroup = (await result.json()) as TipGroupWithTips;
          mutateTipGroup(updatedTipGroup);
          router.push(`${PageRoutes.tipGroups}/${updatedTipGroup.id}`);
        } else {
          toast.error("Failed to update tips: " + result.statusText);
        }
      } catch (error) {
        console.error(error);
        toast.error("Tip update failed. Please try again.");
      }
    },
    [id, mutateTipGroup, router]
  );

  if (!tipGroup) {
    return <Loading color="currentColor" size="sm" />;
  }

  return (
    <>
      <Text h3>✏️ Edit tips</Text>

      <Alert>⚠️ Any individual changes to tips will be overwritten.</Alert>

      <Spacer />
      <TipForm
        onSubmit={onSubmit}
        defaultValues={tipFormDefaultValues}
        mode="update"
        quantity={tipGroup?.tips.length}
      />
    </>
  );
};

export default EditTipGroup;
