import {
  DocumentDuplicateIcon,
  PencilIcon,
  PrinterIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import { Dropdown } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { ApiRoutes } from "lib/ApiRoutes";
import { refundableTipStatuses } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

export function TipGroupSettingsDropdown() {
  const router = useRouter();
  const { id } = router.query;
  //const [showClaimUrls, setShowClaimUrls] = React.useState(false);

  const { data: tipGroup, mutate: mutateTipGroup } = useSWR<TipGroupWithTips>(
    `${ApiRoutes.tipGroups}/${id}`,
    defaultFetcher
  );

  const reclaimableTips = React.useMemo(
    () =>
      tipGroup?.tips.filter(
        (tip) => refundableTipStatuses.indexOf(tip.status) >= 0
      ),
    [tipGroup?.tips]
  );

  const reclaimTips = React.useCallback(() => {
    if (
      window.confirm(
        "Are you sure you wish to reclaim all tips? your recipients won't be able to withdraw their sats."
      )
    ) {
      (async () => {
        router.push(PageRoutes.dashboard);
        const result = await fetch(`${ApiRoutes.tipGroups}/${id}/reclaim`, {
          method: "POST",
        });
        if (!result.ok) {
          toast.error("Failed to reclaim tips: " + result.statusText);
        } else {
          mutateTipGroup();
        }
      })();
    }
  }, [id, mutateTipGroup, router]);

  const menuItems = React.useMemo(
    () =>
      tipGroup
        ? [
            <Dropdown.Item
              key="edit"
              icon={
                <Icon>
                  <PencilIcon />
                </Icon>
              }
            >
              <NextLink
                href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
                passHref
              >
                <a>Bulk edit</a>
              </NextLink>
            </Dropdown.Item>,
            <Dropdown.Item
              key="print"
              icon={
                <Icon>
                  <PrinterIcon />
                </Icon>
              }
            >
              <NextLink
                href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
                passHref
              >
                <a>Print</a>
              </NextLink>
            </Dropdown.Item>,
            <Dropdown.Item
              key="copy"
              icon={
                <Icon>
                  <DocumentDuplicateIcon />
                </Icon>
              }
            >
              <a
                onClick={() =>
                  /*setShowClaimUrls((current) => !current)*/ alert("TODO")
                }
              >
                Enable copy mode
              </a>
            </Dropdown.Item>,
            ...((reclaimableTips?.length ?? 0) > 0
              ? [
                  <Dropdown.Section title="Danger zone" key="danger">
                    <Dropdown.Item
                      color="error"
                      icon={
                        <Icon>
                          <WalletIcon />
                        </Icon>
                      }
                    >
                      {/* <Button  color="error">
          Reclaim unwithdrawn tips ({reclaimableTips?.length})
        </Button>
        <Spacer /> */}
                      <a href="" onClick={reclaimTips}>
                        Reclaim {reclaimableTips?.length} tips
                      </a>
                    </Dropdown.Item>
                  </Dropdown.Section>,
                ]
              : []),
          ]
        : [],
    [reclaimTips, reclaimableTips?.length, tipGroup]
  );

  return (
    <Dropdown placement="bottom-right" type="menu">
      <Dropdown.Button flat>⚙️</Dropdown.Button>
      <Dropdown.Menu css={{ $$dropdownMenuWidth: "300px" }}>
        {menuItems}
      </Dropdown.Menu>
    </Dropdown>
  );
}
