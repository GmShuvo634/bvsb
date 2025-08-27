import React from "react";
import { Doughnut } from "react-chartjs-2";
import styled, { keyframes } from "styled-components";
import { Icon, IconType } from "./icons";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const blinking = keyframes`
  0% {
    color: #fff699;
  }
  50% {
    color: #111016;
  }
  100% {
    color: #fff699;
  }
`;

const BlinkingAnimationDiv = styled.div<{}>`
  animation: ${blinking} 1s ease-in-out infinite;
`;

interface TimerGraphProps {
  maxTime: number;
  time: number;
  isPaying?: boolean;
}

export const TimerGraph: React.FC<TimerGraphProps> = (props) => {
  const { maxTime, time, isPaying } = props;

  const data: ChartData<"doughnut"> = {
    datasets: [
      {
        data: [maxTime - time, time],
        backgroundColor: ["#111016", "#fff699"],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    cutout: "93%",
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    responsive: true,
    events: [],
    animation: {
      duration: 500,
      easing: "easeOutBounce",
    },
  };

  return (
    <div className="flex flex-row items-center justify-center w-full h-full p-2 font-oswald text-[#fff699]">
      {maxTime < time && (
        <Icon type={IconType.LOADING} className="!w-14 !h-14 fill-[#fff699]" />
      )}
      {!isPaying && maxTime >= time && (
        <div className="relative w-full h-full">
          <Doughnut data={data} options={options} />
        </div>
      )}
      {!isPaying && maxTime >= time && (
        <div className="absolute flex flex-col items-center gap-1">
          <span className="text-5xl">{time}</span>
          <span className="text-xl">SEC</span>
        </div>
      )}
      {isPaying && (
        <BlinkingAnimationDiv className="absolute flex flex-col items-center">
          <span className="text-base text-center sm:text-lg">
            DISTRIBUTING
            <br />
            PAYOUTS
          </span>
        </BlinkingAnimationDiv>
      )}
    </div>
  );
};
