import { Row } from "@nextui-org/react";
import { Tip, TipStatus } from "@prisma/client";
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  LinearScale,
  LineElement,
  PointElement,
  Title,
} from "chart.js/";
import { getDateLabel } from "lib/utils";
import { Line } from "react-chartjs-2";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title);

type TipsChartProps = {
  tips: Tip[];
};

function getStatusColor(status: TipStatus) {
  switch (status) {
    case "WITHDRAWN":
      return "#0f0";
    case "REFUNDED":
      return "#060";
    case "CLAIMED":
      return "#00f";
    case "RECLAIMED":
      return "#006";
    case "UNCLAIMED":
      return "#f00";
    case "UNFUNDED":
      return "#666";
    default:
      return "#000000";
  }
}

export function TipsChart({ tips }: TipsChartProps) {
  const tipDates = tips
    .map((tip) => new Date(tip.created))
    .filter(
      (date, i, a) =>
        a.findIndex((other) => other.toDateString() === date.toDateString()) ===
        i
    )
    .map((date) => getDateLabel(date));

  const relevantStatuses: TipStatus[] = [
    "CLAIMED",
    "RECLAIMED",
    "REFUNDED",
    "UNCLAIMED",
    "UNFUNDED",
    "WITHDRAWN",
  ];

  const dailyTipCountsByStatus = relevantStatuses.map((status) =>
    tipDates.map((date) => {
      return tips.filter(
        (tip) =>
          getDateLabel(new Date(tip.created)) === date && tip.status === status
      ).length;
    })
  );

  const data: ChartData<"line"> = {
    labels: tipDates,
    datasets: relevantStatuses.map((status, statusIndex) => ({
      type: "line",
      backgroundColor: getStatusColor(status),
      borderColor: getStatusColor(status),
      data: dailyTipCountsByStatus[statusIndex],
      label: status,
    })),
  };
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      yAxis: {
        min: 0,
        max: Math.max(...([] as number[]).concat(...dailyTipCountsByStatus)),
        title: {
          text: "#tips",
          display: true,
        },
        ticks: {
          callback: (val) => val,
        },
      },
    },
    plugins: {
      title: {
        display: true,
        text: "Tips",
      },
    },
  };
  return (
    <Row>
      <Line data={data} options={chartOptions} />
    </Row>
  );
}
