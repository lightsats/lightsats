import { Row } from "@nextui-org/react";
import {
  CategoryScale,
  Chart,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js/";
import { getDateLabel } from "lib/utils";
import { Line } from "react-chartjs-2";
import { AdminDashboard } from "types/Admin";
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Tooltip
);

type ProfitChartProps = {
  withdrawals: AdminDashboard["withdrawals"];
};

export function ProfitChart({ withdrawals }: ProfitChartProps) {
  const withdrawalDates = Array.from(
    new Set(withdrawals.map((w) => getDateLabel(new Date(w.created))))
  );

  const withdrawalRoutingFees = withdrawalDates.map((date) => {
    const dayWithdrawals = withdrawals
      .filter((w) => getDateLabel(new Date(w.created)) === date)
      .map((w) => w.routingFee);
    return dayWithdrawals.length > 0
      ? dayWithdrawals.reduce((a, b) => a + b)
      : 0;
  });

  const withdrawalProfits = withdrawalDates.map((date) => {
    const dayWithdrawals = withdrawals
      .filter((w) => getDateLabel(new Date(w.created)) === date)
      .map(
        (w) =>
          w.tips.map((tip) => tip.fee).reduce((a, b) => a + b) - w.routingFee
      );
    return dayWithdrawals.length > 0
      ? dayWithdrawals.reduce((a, b) => a + b)
      : 0;
  });

  const data: ChartData<"line"> = {
    labels: withdrawalDates,
    datasets: [
      {
        type: "line",
        backgroundColor: "rgb(99, 255, 132)",
        borderColor: "rgb(99, 255, 132)",
        data: withdrawalProfits,
        label: "Profits",
      },
      {
        type: "line",
        backgroundColor: "rgb(255, 99, 132)",
        borderColor: "rgb(255, 99, 132)",
        data: withdrawalRoutingFees,
        label: "Outbound Routing Fees",
      },
    ],
  };
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      yAxis: {
        min: 0,
        max: Math.max(...withdrawalProfits, ...withdrawalRoutingFees),
        title: {
          text: "sats",
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
        text: "Profits",
      },
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (x) => x.raw + " sats",
        },
      },
    },
  };
  return (
    <Row>
      <Line data={data} options={chartOptions} />
    </Row>
  );
}
