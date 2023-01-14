import {
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  PencilIcon,
  PrinterIcon,
  TrashIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import { Dropdown } from "@nextui-org/react";
import { Icon } from "components/Icon";
import copy from "copy-to-clipboard";
import { ApiRoutes } from "lib/ApiRoutes";
import { refundableTipStatuses } from "lib/constants";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { getClaimUrl } from "lib/utils";
import { useRouter } from "next/router";
import React from "react";
import toast from "react-hot-toast";
import useSWR, { useSWRConfig } from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

enum actionKeys {
  copyAll = "copyAll",
  copyIndividual = "copyIndividual",
  reclaimTips = "reclaimTips",
  deleteTipGroup = "deleteTipGroup",
}

type TipGroupSettingsDropdownProps = {
  setCopyIndividualLinksEnabled(): void;
  copyIndividualLinksEnabled: boolean;
};

export function TipGroupSettingsDropdown({
  copyIndividualLinksEnabled,
  setCopyIndividualLinksEnabled,
}: TipGroupSettingsDropdownProps) {
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

  const { mutate } = useSWRConfig();
  const mutateTips = React.useCallback(
    () => mutate("/api/tipper/tips"),
    [mutate]
  );

  const deleteTipGroup = React.useCallback(() => {
    (async () => {
      router.push(PageRoutes.dashboard);
      const result = await fetch(`${ApiRoutes.tipGroups}/${id}`, {
        method: "DELETE",
      });
      if (!result.ok) {
        toast.error("Failed to delete tip group: " + result.statusText);
      } else {
        mutateTips();
      }
    })();
  }, [id, router, mutateTips]);

  const copyAllTipUrls = React.useCallback(() => {
    (async () => {
      if (tipGroup) {
        copy(tipGroup.tips.map((tip) => getClaimUrl(tip)).join("\n"));
        toast.success("Copied all tip URLs to clipboard");
      }
    })();
  }, [tipGroup]);

  const menuItems = React.useMemo(
    () =>
      tipGroup
        ? [
            <Dropdown.Item
              key={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
              icon={
                <Icon>
                  <PencilIcon />
                </Icon>
              }
            >
              Bulk edit
            </Dropdown.Item>,
            <Dropdown.Item
              key={`${PageRoutes.tipGroups}/${tipGroup.id}/print`}
              icon={
                <Icon>
                  <PrinterIcon />
                </Icon>
              }
            >
              Print
            </Dropdown.Item>,
            <Dropdown.Item
              key={actionKeys.copyAll}
              icon={
                <Icon>
                  <ClipboardDocumentListIcon />
                </Icon>
              }
            >
              Copy all claim links
            </Dropdown.Item>,
            <Dropdown.Item
              key={actionKeys.copyIndividual}
              icon={
                <Icon>
                  <DocumentDuplicateIcon />
                </Icon>
              }
            >
              {copyIndividualLinksEnabled
                ? "Finish copying"
                : "Copy individual claim links"}
            </Dropdown.Item>,
            ...((reclaimableTips?.length ?? 0) > 0 ||
            tipGroup.status === "UNFUNDED"
              ? [
                  <Dropdown.Section title="Danger zone" key="danger">
                    {tipGroup.status === "UNFUNDED" ? (
                      <Dropdown.Item
                        key={actionKeys.deleteTipGroup}
                        color="error"
                        icon={
                          <Icon>
                            <TrashIcon />
                          </Icon>
                        }
                      >
                        Delete Tip Group
                      </Dropdown.Item>
                    ) : (
                      <Dropdown.Item
                        key={actionKeys.reclaimTips}
                        color="error"
                        icon={
                          <Icon>
                            <WalletIcon />
                          </Icon>
                        }
                      >
                        Reclaim {reclaimableTips?.length} tips
                      </Dropdown.Item>
                    )}
                  </Dropdown.Section>,
                ]
              : []),
          ]
        : [],
    [copyIndividualLinksEnabled, reclaimableTips?.length, tipGroup]
  );

  const onDropdownAction = React.useCallback(
    (key: React.Key) => {
      switch (key) {
        case actionKeys.copyAll:
          copyAllTipUrls();
          break;
        case actionKeys.copyIndividual:
          setCopyIndividualLinksEnabled();
          break;
        case actionKeys.reclaimTips:
          reclaimTips();
          break;
        case actionKeys.deleteTipGroup:
          deleteTipGroup();
          break;
        default:
          router.push(key as string);
      }
    },
    [
      copyAllTipUrls,
      deleteTipGroup,
      reclaimTips,
      router,
      setCopyIndividualLinksEnabled,
    ]
  );

  return (
    <Dropdown placement="bottom-right" type="menu">
      <Dropdown.Button flat>⚙️&nbsp;Manage Tips</Dropdown.Button>
      <Dropdown.Menu
        css={{ $$dropdownMenuWidth: "300px" }}
        onAction={onDropdownAction}
      >
        {menuItems}
      </Dropdown.Menu>
    </Dropdown>
  );
}
