import {
  Button,
  Card,
  Col,
  Grid,
  Loading,
  Progress,
  Row,
  Spacer,
  Text,
} from "@nextui-org/react";
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
        <Text h1>Group of {tipGroup.quantity} Tips</Text>
        <Row justify="space-between" align="center">
          <TipGroupStatusBadge tipGroup={tipGroup} />
          <TipGroupProgress tipGroup={tipGroup} />
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
            <Text h6>Manage Tips</Text>
            <>
              <NextLink
                href={`${PageRoutes.tipGroups}/${tipGroup.id}/edit`}
                passHref
              >
                <a>
                  <Button>Bulk Edit</Button>
                </a>
              </NextLink>
              <Spacer />
            </>
            <Button onClick={() => setShowClaimUrls((current) => !current)}>
              Show/Hide claim URLs
            </Button>
            <Spacer />
            {(reclaimableTips?.length ?? 0) > 0 && (
              <>
                <Button onClick={reclaimTips} color="error">
                  Reclaim unwithdrawn tips ({reclaimableTips?.length})
                </Button>
                <Spacer />
              </>
            )}
            {showClaimUrls && (
              <>
                <Card>
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
              <BulkTipGiftCardContentsPreview
                theme={getDefaultBulkGiftCardTheme()}
                tip={firstTip}
              />

              <Card.Footer
                css={{
                  position: "absolute",
                  color: "$white",
                  bottom: 0,
                  width: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <Text b color="white"></Text>
              </Card.Footer>
              <Card.Footer css={{ justifyItems: "flex-start" }}>
                <Col>
                  <Row wrap="wrap" justify="space-between">
                    <Text b>
                      {"🎫 Looking for cards to hand out in person?"}
                    </Text>
                  </Row>
                  <Spacer />
                  <Row justify="center">
                    <NextLink
                      href={`${PageRoutes.tipGroups}/${tipGroup.id}/print`}
                    >
                      <a>
                        <Button>🖨️ Bulk print cards</Button>
                      </a>
                    </NextLink>
                  </Row>
                </Col>
              </Card.Footer>
            </Card>
            <Spacer />

            <Grid.Container justify="center" gap={1}>
              {tipGroup.tips.map((tip) => (
                <SentTipCard tip={tip} key={tip.id} />
              ))}
            </Grid.Container>
          </>
        )}
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
