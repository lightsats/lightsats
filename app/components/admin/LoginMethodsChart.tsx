import { Row } from "@nextui-org/react";
import { User } from "@prisma/client";
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
import { LoginMethod, loginMethods } from "types/LoginMethod";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title);

type LoginMethodsChartProps = {
  users: User[];
};

export function LoginMethodsChart({ users }: LoginMethodsChartProps) {
  const userDates = Array.from(
    new Set(
      users
        .map((user) => new Date(user.created))
        .sort((a, b) => a.getTime() - b.getTime())
        .map((date) => getDateLabel(date))
    )
  );

  const dailyUserCountsByStatus = loginMethods.map((loginMethod) =>
    userDates.map((date) => {
      return users.filter(
        (user) =>
          getDateLabel(new Date(user.created)) === date &&
          (loginMethod === "email"
            ? !!user.email
            : loginMethod === "phone"
            ? !!user.phoneNumber
            : loginMethod === "lightning"
            ? !!user.lnurlPublicKey
            : false)
      ).length;
    })
  );

  const getLoginMethodColor = (loginMethod: LoginMethod) =>
    loginMethod === "phone"
      ? "#0f0"
      : loginMethod === "lightning"
      ? "#ff0"
      : loginMethod === "email"
      ? "#00f"
      : "#000";

  const data: ChartData<"line"> = {
    labels: userDates,
    datasets: loginMethods.map((loginMethod, loginMethodIndex) => ({
      type: "line",
      backgroundColor: getLoginMethodColor(loginMethod),
      borderColor: getLoginMethodColor(loginMethod),
      data: dailyUserCountsByStatus[loginMethodIndex],
      label: loginMethod,
    })),
  };
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      yAxis: {
        min: 0,
        max: Math.max(...([] as number[]).concat(...dailyUserCountsByStatus)),
        title: {
          text: "#users",
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
        text: "Login Methods",
      },
    },
  };
  return (
    <Row>
      <Line data={data} options={chartOptions} />
    </Row>
  );
}
