import { Tip, User } from "@prisma/client";
import { getFallbackAvatarId } from "lib/utils";
import { PublicTip } from "types/PublicTip";

export function mapTipToPublicTip(
  tip: Tip & { tipper: User; tippee: User | null }
): PublicTip {
  return {
    id: tip.id,
    amount: tip.amount,
    tipperId: tip.tipperId,
    hasClaimed: !!tip.tippeeId,
    currency: tip.currency,
    note: tip.note,
    tippeeId: tip.tippeeId,
    tipper: tip.anonymousTipper
      ? {
          name: null,
          avatarURL: null,
          twitterUsername: null,
          fallbackAvatarId: undefined,
        }
      : {
          name: tip.tipper.name,
          twitterUsername: tip.tipper.twitterUsername,
          avatarURL: tip.tipper.avatarURL,
          fallbackAvatarId: getFallbackAvatarId(tip.tipper),
        },
    tippee: tip.tippee
      ? {
          inJourney: tip.tippee.inJourney,
          journeyStep: tip.tippee.journeyStep,
          name: tip.tippee.name,
          twitterUsername: tip.tippee.twitterUsername,
          avatarURL: tip.tippee.avatarURL,
          fallbackAvatarId: getFallbackAvatarId(tip.tippee),
        }
      : undefined,
    status: tip.status,
    created: tip.created,
    expiry: tip.expiry,
    tippeeName: tip.tippeeName,
    tippeeLocale: tip.tippeeLocale,
    onboardingFlow: tip.onboardingFlow,
    lastWithdrawal: tip.lastWithdrawal,
    recommendedWalletId: tip.recommendedWalletId,
    updated: tip.updated,
  };
}
