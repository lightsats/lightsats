import {
  DocumentDuplicateIcon,
  PencilIcon,
  PrinterIcon,
  WalletIcon,
} from "@heroicons/react/24/solid";
import {
  Button,
  Card,
  Dropdown,
  Grid,
  Loading,
  Progress,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { PersonalizeTip } from "components/tipper/PersonalizeTip";
import { SentTipCard } from "components/tipper/SentTipCard";
import { TipGroupProgress } from "components/tipper/TipGroupProgress";
import { TipGroupStatusBadge } from "components/tipper/TipGroupStatusBadge";
import { PayInvoice } from "components/tipper/TipPage/PayInvoice";
import { ApiRoutes } from "lib/ApiRoutes";
import { refundableTipStatuses } from "lib/constants";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import { PageRoutes } from "lib/PageRoutes";
import { defaultFetcher } from "lib/swr";
import { getClaimUrl, getDefaultBulkGiftCardTheme } from "lib/utils";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { BulkTipGiftCardContentsPreview } from "pages/tip-groups/[id]/print";
import React from "react";
import toast from "react-hot-toast";
import useSWR, { SWRConfiguration, useSWRConfig } from "swr";
import { TipGroupWithTips } from "types/TipGroupWithTips";

const pollTipGroupConfig: SWRConfiguration = { refreshInterval: 1000 };

const TipGroupPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [showClaimUrls, setShowClaimUrls] = React.useState(false);
  const [skipPersonalize, setSkipPersonalize] = React.useState(false);

  const { data: tipGroup } = useSWR<TipGroupWithTips>(
    `${ApiRoutes.tipGroups}/${id}`,
    defaultFetcher,
    pollTipGroupConfig
  );

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
          mutateTips();
        }
      })();
    }
  }, [id, mutateTips, router]);

  if (tipGroup) {
    const header = (
      <>
        <Row justify="space-between">
          <Text h3>
            👥 Group of {tipGroup.quantity} tips &nbsp;
            <TipGroupStatusBadge tipGroup={tipGroup} />
          </Text>
          <Dropdown placement="bottom-right" type="menu">
            <Dropdown.Button flat>⚙️</Dropdown.Button>
            <Dropdown.Menu css={{ $$dropdownMenuWidth: "300px" }}>
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
              </Dropdown.Item>
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
              </Dropdown.Item>
              <Dropdown.Item
                key="copy"
                icon={
                  <Icon>
                    <DocumentDuplicateIcon />
                  </Icon>
                }
              >
                <a onClick={() => setShowClaimUrls((current) => !current)}>
                  Show claim URLs
                </a>
              </Dropdown.Item>
              {(reclaimableTips?.length ?? 0) > 0 && (
                <Dropdown.Section title="Danger zone">
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
                </Dropdown.Section>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </Row>
        <Spacer />
      </>
    );

    const firstTip = tipGroup.tips[0];
    const unfundedTips = tipGroup.tips.filter(
      (tip) => tip.status === "UNFUNDED"
    );
    const fundedProgress =
      tipGroup && unfundedTips
        ? (1 - unfundedTips.length / tipGroup.tips.length) * 100
        : 0;
    if (tipGroup.status === "FUNDED" && fundedProgress < 100) {
      return (
        <>
          {header}
          <Text>Preparing tips...</Text>
          <Progress value={fundedProgress} />
        </>
      );
    }

    if (!skipPersonalize && (!firstTip.note || !firstTip.tippeeName)) {
      return (
        <>
          {header}
          <PersonalizeTip
            href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
            skip={() => setSkipPersonalize(true)}
            bulk
          />
        </>
      );
    }

    return (
      <>
        {header}
        {tipGroup.status === "UNFUNDED" && tipGroup.invoice && (
          <>
            <PayInvoice invoice={tipGroup.invoice} variant="tipGroup" />
            <Spacer />
            <Button onClick={deleteTipGroup} color="error">
              Delete Tip Group
            </Button>
            <Spacer />
          </>
        )}
        {tipGroup.status === "FUNDED" && (
          <>
            {showClaimUrls && (
              <>
                <Card css={{ dropShadow: "$sm" }}>
                  <Card.Body>
                    {tipGroup.tips.map((tip) => (
                      <Row key={tip.id}>
                        <Text>{getClaimUrl(tip)}</Text>
                      </Row>
                    ))}
                  </Card.Body>
                </Card>
                <Spacer />
              </>
            )}

            <Card css={{ dropShadow: "$sm" }}>
              <Card.Header>
                <Row justify="space-between">
                  <Text b>{"🆕 Physical cards to print yourself"}</Text>
                  <NextLink
                    href={`${PageRoutes.tipGroups}/${tipGroup.id}/print`}
                    style={{ display: "inline-block" }}
                  >
                    <a>
                      <Button size={"sm"}>Choose design</Button>
                    </a>
                  </NextLink>
                </Row>
              </Card.Header>
              <Card.Body>
                <Card css={{ dropShadow: "$sm", p: 0, scale: 0.8, mt: -25 }}>
                  <BulkTipGiftCardContentsPreview
                    theme={getDefaultBulkGiftCardTheme()}
                    tip={firstTip}
                  />
                </Card>
              </Card.Body>
            </Card>

            <Spacer />
          </>
        )}
        <Spacer />
        <h3>Tips</h3>
        <TipGroupProgress tipGroup={tipGroup} />
        <Grid.Container justify="center" gap={1}>
          {tipGroup.tips.map((tip) => (
            <SentTipCard tip={tip} key={tip.id} />
          ))}
        </Grid.Container>
      </>
    );
  } else {
    return (
      <>
        <Spacer y={4} />
        <Loading color="currentColor" size="lg">
          Loading...
        </Loading>
      </>
    );
  }
};

export default TipGroupPage;

export { getStaticProps, getStaticPaths };
