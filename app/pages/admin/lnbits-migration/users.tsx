import { Button, Loading, Text } from "@nextui-org/react";
import { ApiRoutes } from "lib/ApiRoutes";
import { defaultFetcher } from "lib/swr";
import type { NextPage } from "next";
import React from "react";
import useSWRImmutable from "swr/immutable";

import { AdminLnbitsMigrationUsers } from "types/Admin";

type MigrateUserError = { userId: string; error: string };

const AdminPage: NextPage = () => {
  const { data: adminLnbitsMigrationUsers } =
    useSWRImmutable<AdminLnbitsMigrationUsers>(
      "/api/admin/lnbits-migration/users",
      defaultFetcher
    );
  const [usersProcessed, setUsersProcessed] = React.useState(0);
  const [usersErrored, setUsersErrored] = React.useState<MigrateUserError[]>(
    []
  );
  const [executingMigration, setExecutingMigration] = React.useState(false);
  const [finishedMigration, setFinishedMigration] = React.useState(false);
  if (!adminLnbitsMigrationUsers) {
    return <Loading color="currentColor" size="sm" />;
  }

  if (!adminLnbitsMigrationUsers.lnbitsMigrationDate) {
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
            {usersProcessed}/{adminLnbitsMigrationUsers.users.length} processed
          </Text>
          <Text>{usersErrored.length} errors</Text>
          <Text
            css={{
              whiteSpace: "pre-wrap",
              fontFamily: "monospace",
              maxWidth: "80vw",
            }}
          >
            Errors: {JSON.stringify(usersErrored)}
          </Text>
        </>
      )}

      {!executingMigration && (
        <>
          <Text>{adminLnbitsMigrationUsers.users.length} users to migrate</Text>
          <Button
            onPress={async () => {
              setExecutingMigration(true);
              await executeMigration(
                adminLnbitsMigrationUsers.users,
                setUsersProcessed,
                setUsersErrored
              );
              setFinishedMigration(true);
            }}
          >
            Execute migration
          </Button>
        </>
      )}

      <Text>User IDs:</Text>
      <Text css={{ whiteSpace: "pre-wrap", fontFamily: "monospace" }}>
        {JSON.stringify(
          adminLnbitsMigrationUsers.users.map((user) => user.id),
          null,
          "  "
        )}
      </Text>
    </>
  );
};

export default AdminPage;

async function executeMigration(
  users: { id: string }[],
  setUsersProcessed: (amount: number) => void,
  setUsersErrored: (usersErrored: MigrateUserError[]) => void
) {
  const confirmation = window.prompt('Type "YES" to continue');
  if (confirmation !== "YES") {
    return;
  }
  let usersProcessed = 0;
  let usersErrored: MigrateUserError[] = [];
  for (const user of users) {
    const result = await fetch(
      `${ApiRoutes.adminUsers}/${user.id}/replaceLnbitsWallet`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (!result.ok) {
      usersErrored = [
        ...usersErrored,
        {
          userId: user.id,
          error: result.statusText + " " + (await result.text()),
        },
      ];
      setUsersErrored(usersErrored);
    } else {
      setUsersProcessed(++usersProcessed);
    }
  }
}
