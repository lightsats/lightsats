import { Row } from "@nextui-org/react";
import { User, UserType } from "@prisma/client";
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

type UserTypesChartProps = {
  users: User[];
};

export function UserTypesChart({ users }: UserTypesChartProps) {
  const userDates = Array.from(
    new Set(
      users
        .map((user) => new Date(user.created))
        .sort((a, b) => a.getTime() - b.getTime())
        .map((date) => getDateLabel(date))
    )
  );

  const userTypes = Object.values(UserType);

  const dailyUserCountsByStatus = userTypes.map((userType) =>
    userDates.map((date) => {
      return users.filter(
        (user) =>
          getDateLabel(new Date(user.created)) === date &&
          user.userType === userType
      ).length;
    })
  );

  const getUserTypeColor = (userType: UserType) =>
    userType === "tippee" ? "#0f0" : "#00f";

  const data: ChartData<"line"> = {
    labels: userDates,
    datasets: userTypes.map((userType, userTypeIndex) => ({
      type: "line",
      backgroundColor: getUserTypeColor(userType),
      borderColor: getUserTypeColor(userType),
      data: dailyUserCountsByStatus[userTypeIndex],
      label: userType,
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
        text: "Tippers vs Tippees",
      },
    },
  };
  return (
    <Row>
      <Line data={data} options={chartOptions} />
    </Row>
  );
}
