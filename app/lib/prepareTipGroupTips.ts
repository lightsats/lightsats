import { Prisma, Tip } from "@prisma/client";
import { createInvoice } from "lib/lnbits/createInvoice";
import { getWalletBalance } from "lib/lnbits/getWalletBalance";
import { payInvoice } from "lib/lnbits/payInvoice";
import { markTipAsUnclaimed } from "lib/markTipAsUnclaimed";
import { prepareFundingWallet } from "lib/prepareFundingWallet";
import prisma from "lib/prismadb";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const PREPARE_RETRY_INTERVAL = 15000;

export async function prepareTipGroupTips(
  tipGroup: TipGroupWithTips
): Promise<TipGroupWithTips> {
  if (tipGroup.status === "UNFUNDED") {
    return tipGroup;
  }
  // TODO: review number of iterations to speed up the tip preparation process
  const maxIterations = 5;
  const attemptedTips: Tip[] = [];
  const promises: Promise<void>[] = [];
  for (let i = 0; i < maxIterations; i++) {
    const availableUnfundedTip = tipGroup.tips.find(
      (tip) =>
        tip.status === "UNFUNDED" &&
        attemptedTips.indexOf(tip) < 0 &&
        (!tip.lastWithdrawal ||
          Date.now() - new Date(tip.lastWithdrawal).getTime() >
            PREPARE_RETRY_INTERVAL)
    );

    if (availableUnfundedTip) {
      attemptedTips.push(availableUnfundedTip);
      promises.push(prepareTipGroupTip(tipGroup, availableUnfundedTip));
    }
  }
  await Promise.all(promises);

  return tipGroup;
}

async function prepareTipGroupTip(tipGroup: TipGroupWithTips, tip: Tip) {
  const tipGroupWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      tipGroupId: tipGroup.id,
    },
  });

  if (!tipGroupWallet) {
    throw new Error("Tip group " + tipGroup.id + " has not lnbits wallet");
  }

  // ensure we didn't try to prepare the same tip in a short period of time
  // as we could accidentally create two wallets or fund the same tip twice
  // TODO: create a new field name - lastWithdrawal should just be used for withdrawals

  const [lastWithdrawalResult] = await prisma.$transaction(
    [
      prisma.tip.findUniqueOrThrow({
        where: { id: tip.id },
        select: { lastWithdrawal: true },
      }),
      prisma.tip.update({
        where: { id: tip.id },
        data: { lastWithdrawal: new Date() },
      }),
    ],
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  if (
    lastWithdrawalResult.lastWithdrawal &&
    Date.now() - new Date(lastWithdrawalResult.lastWithdrawal).getTime() <
      PREPARE_RETRY_INTERVAL
  ) {
    console.warn("Already attempted to prepare tip within retry interval");
    return;
  }

  const existingTipWallet = await prisma.lnbitsWallet.findUnique({
    where: {
      tipId: tip.id,
    },
  });

  const tipLnbitsWalletAdminKey =
    existingTipWallet?.adminKey ||
    (await prepareFundingWallet(tip.id, undefined));

  if ((await getWalletBalance(tipLnbitsWalletAdminKey)) > 0) {
    console.warn("Attempted to prepare tip with non-zero wallet balance");
    return;
  }

  let invoice = tip.preparationInvoice;
  if (!invoice) {
    const createInvoiceResult = await createInvoice(
      tip.amount + tip.fee,
      tipLnbitsWalletAdminKey,
      "Fund tip from group wallet",
      undefined
    );
    invoice = createInvoiceResult.invoice;
    await prisma.tip.update({
      where: {
        id: tip.id,
      },
      data: {
        preparationInvoice: createInvoiceResult.invoice,
        preparationInvoiceId: createInvoiceResult.invoiceId,
      },
    });
  }

  const { payInvoiceResponse, payInvoiceResponseBody } = await payInvoice(
    invoice,
    tipGroupWallet.adminKey
  );
  if (!payInvoiceResponse.ok) {
    throw new Error(
      "Failed to pay tip group " +
        tipGroup.id +
        " invoice: " +
        payInvoiceResponse.status +
        " " +
        payInvoiceResponse.statusText +
        " " +
        JSON.stringify(payInvoiceResponseBody)
    );
  }
  await markTipAsUnclaimed(tip);
}
