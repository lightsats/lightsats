/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/display-name */
import { Button, Loading, Text } from "@nextui-org/react";
import { useTip } from "hooks/useTip";
import { getStaticPaths, getStaticProps } from "lib/i18n/i18next";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { useReactToPrint } from "react-to-print";

const PrintTipCardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data: tip } = useTip(id as string);
  const insidePageRef = React.useRef(null);
  const outsidePageRef = React.useRef(null);

  const printInside = useReactToPrint({
    content: () => insidePageRef.current,
  });
  const printOutside = useReactToPrint({
    content: () => outsidePageRef.current,
  });

  if (!tip) {
    return <Loading />;
  }

  return (
    <>
      <Button size="sm" bordered onClick={printInside}>
        Print inside page
      </Button>
      <Text>
        Flip your printed page over and re-insert it back into the printer.
      </Text>
      <Button size="sm" bordered onClick={printOutside}>
        Print outside page
      </Button>

      <div style={{ display: "none" }}>
        <InsidePage ref={insidePageRef} />
        <OutsidePage ref={outsidePageRef} />
      </div>
    </>
  );
};

export default PrintTipCardPage;

export { getStaticProps, getStaticPaths };

const InsidePage = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} style={{ width: 3508, height: 2480, display: "flex" }}>
      <img alt="" src="https://via.placeholder.com/1754x2480/0000FF/808080" />
      <img alt="" src="https://via.placeholder.com/1754x2480/00FF00/808080" />
    </div>
  );
});
const OutsidePage = React.forwardRef<HTMLDivElement>((props, ref) => {
  return (
    <div ref={ref} style={{ width: 3508, height: 2480, display: "flex" }}>
      <img
        alt=""
        width={1754}
        height={2480}
        src="/tips/printed-cards/christmas/outside-left.png"
      />
      <img
        alt=""
        width={1754}
        height={2480}
        src="/tips/printed-cards/christmas/outside-right.png"
      />
    </div>
  );
});
