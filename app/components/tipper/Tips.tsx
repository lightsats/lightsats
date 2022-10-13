import { Tip } from "@prisma/client";
import { useSession, signIn, signOut } from "next-auth/react";
import useSWR from "swr";
import { defaultFetcher } from "../../lib/swr";
import {
  Card,
  Container,
  Row,
  Col,
  Grid,
  Badge,
  Spacer,
} from "@nextui-org/react";
import NextLink from "next/link";
import { Routes } from "../../lib/Routes";
import { TipStatusBadge } from "./TipStatusBadge";

export function Tips() {
  const { data: session } = useSession();
  const { data: tips } = useSWR<Tip[]>(
    session ? "/api/tipper/tips" : null,
    defaultFetcher
  );

  if (session && !tips) {
    return <>Loading</>;
  }

  if (tips?.length) {
    return (
      <Grid.Container xs={4} gap={2} justify="center">
        {tips.map((tip) => (
          <Grid xs={12} key={tip.id}>
            <NextLink key={tip.id} href={`${Routes.tips}/${tip.id}`}>
              <a>
                <Card isPressable isHoverable>
                  <Card.Body>
                    <Row justify="space-between">
                      {tip.invoice.substring(0, 24)}...
                      <Badge> {tip.amount}⚡ </Badge>
                      <Spacer />
                      <TipStatusBadge status={tip.status} />
                    </Row>
                  </Card.Body>
                </Card>
              </a>
            </NextLink>
          </Grid>
        ))}
      </Grid.Container>
    );
  }

  return <>No tips yet</>;
}
