import { Button, Loading, Text } from "@nextui-org/react";
import { ApiRoutes } from "lib/ApiRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import React from "react";
import useSWRImmutable from "swr/immutable";

import { AdminLnbitsMigrationTips } from "types/Admin";

type MigrateTipError = { tipId: string; error: string };

const AdminPage: NextPage = () => {
  const { data: adminLnbitsMigrationTips } =
    useSWRImmutable<AdminLnbitsMigrationTips>(
      "/api/admin/lnbits-migration/tips",
      defaultFetcher
    );
  const [tipsProcessed, setTipsProcessed] = React.useState(0);
  const [tipsErrored, setTipsErrored] = React.useState<MigrateTipError[]>([]);
  const [executingMigration, setExecutingMigration] = React.useState(false);
  const [finishedMigration, setFinishedMigration] = React.useState(false);
  if (!adminLnbitsMigrationTips) {
    return <Loading color="currentColor" size="sm" />;
  }

  if (!adminLnbitsMigrationTips.lnbitsMigrationDate) {
    return <Text>No pending migration</Text>;
  }

  return (
    <>
      {executingMigration && (
        <>
          {finishedMigration ? (
            <Text>MIGRATION FINISHED</Text>
          ) : (
            <Text>Processing migration</Text>
          )}

          <Text>
            {tipsProcessed}/{adminLnbitsMigrationTips.tips.length} processed
          </Text>
          <Text>{tipsErrored.length} errors</Text>
          <Text
            css={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              maxWidth: "80vw",
            }}
          >
            Errors: {JSON.stringify(tipsErrored)}
          </Text>
        </>
      )}

      {!executingMigration && (
        <>
          <Text>{adminLnbitsMigrationTips.tips.length} tips to migrate</Text>
          <Button
            onPress={async () => {
              setExecutingMigration(true);
              await executeMigration(
                adminLnbitsMigrationTips.tips,
                setTipsProcessed,
                setTipsErrored
              );
              setFinishedMigration(true);
            }}
          >
            Execute migration
          </Button>
        </>
      )}

      <Text>Tip IDs:</Text>
      <Text css={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {JSON.stringify(
          adminLnbitsMigrationTips.tips.map((tip) => tip.id),
          null,
          "  "
        )}
      </Text>
    </>
  );
};

export default AdminPage;

async function executeMigration(
  tips: { id: string }[],
  setTipsProcessed: (amount: number) => void,
  setTipsErrored: (tipsErrored: MigrateTipError[]) => void
) {
  const confirmation = window.prompt('Type "YES" to continue');
  if (confirmation !== "YES") {
    return;
  }
  let tipsProcessed = 0;
  let tipsErrored: MigrateTipError[] = [];
  for (const tip of tips) {
    const result = await fetch(
      `${ApiRoutes.adminTips}/${tip.id}/replaceLnbitsWallet`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!result.ok) {
      tipsErrored = [
        ...tipsErrored,
        {
          tipId: tip.id,
          error: result.statusText + " " + (await result.text()),
        },
      ];
      setTipsErrored(tipsErrored);
    } else {
      setTipsProcessed(++tipsProcessed);
    }
  }
}
