import { Button, Card, Col, Link, Row, Spacer, Text } from "@nextui-org/react";
import { Icon } from "components/Icon";
import { NextLink } from "components/NextLink";
import { WithdrawSuggestion } from "components/tippee/WithdrawSuggestion";
import { useGuides } from "hooks/useGuides";
import { useReceivedTips } from "hooks/useTips";
import { PageRoutes } from "lib/PageRoutes";
import { hasTipExpired } from "lib/utils";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Guide } from "types/Guide";

export function TippeeSuggestions() {
  const { data: tips } = useReceivedTips();
  const hasWithdrawableTip = tips?.some(
    (tip) => tip.status === "CLAIMED" && !hasTipExpired(tip)
  );

  const guides = useGuides();
  const suggestions: Guide[] = [guides[0], guides[2], guides[7]];

  return hasWithdrawableTip ? (
    <WithdrawSuggestion />
  ) : (
    <>
      <Row justify="space-between" align="center">
        <Text css={{ m: 0 }} h5>
          Suggestions
        </Text>
        <NextLink href={PageRoutes.guide} passHref>
          <Link>See all</Link>
        </NextLink>
      </Row>
      <Spacer y={0.5} />
      <Row>
        <Swiper
          slidesPerView={(global?.window.innerWidth || 0) > 500 ? 1.4 : 1.2}
          spaceBetween={20}
          navigation
          pagination
        >
          {suggestions.map((suggestion) => (
            <SwiperSlide key={suggestion.link} style={{ paddingBottom: 20 }}>
              <NextLink href={suggestion.link}>
                <a>
                  <Card
                    css={{ width: "100%", background: "$white" }}
                    variant="flat"
                  >
                    <Card.Body>
                      <Row align="center">
                        <Button
                          color="primary"
                          auto
                          flat
                          css={{ px: 18 }}
                          size="xl"
                        >
                          <Icon>{suggestion.icon}</Icon>
                        </Button>
                        <Spacer />
                        <Col>
                          <Row>
                            <Text b>{suggestion.name}</Text>
                          </Row>
                          <Row>
                            <Text color="$gray700">
                              {suggestion.shortDescription ||
                                suggestion.description}
                            </Text>
                          </Row>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </a>
              </NextLink>
            </SwiperSlide>
          ))}
        </Swiper>
      </Row>
    </>
  );
}
