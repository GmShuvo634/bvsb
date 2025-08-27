// src/components/chart-js-2-graph.tsx
import React from "react";
import { Config } from "@/config";
import {
  Chart as ChartJS,
  ScatterController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ScatterController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

// Ratios & counts from your config
const graphVerticalRatio = Config.graphVerticalRatio;
const graphHorizontalRatio =
  Config.roundTime.basic / Config.interval.priceUpdate;

const basicPriceCount = Config.roundTime.basic / Config.interval.priceUpdate;
const preparePriceCount =
  Config.roundTime.prepare / Config.interval.priceUpdate;
const playPriceCount = Config.roundTime.play / Config.interval.priceUpdate;

export interface Position {
  x: number;
  y: number;
}

interface ChartJs2GraphProps {
  dotPositions: Position[];
  playingDepth: number;
  color: string;
}

export const ChartJs2Graph: React.FC<ChartJs2GraphProps> = ({
  dotPositions,
  playingDepth,
  color,
}) => {
  const chartData: ChartData<"scatter"> = {
    datasets: [
      {
        label: "Price Path",
        data: dotPositions,
        pointRadius: (ctx) => {
          const idx = ctx.dataIndex;
          const highlightIdx1 = basicPriceCount + preparePriceCount;
          const highlightIdx2 = highlightIdx1 + playPriceCount;
          return (
            playingDepth &&
            (idx === highlightIdx1 || idx === highlightIdx2)
          )
            ? 5
            : 0;
        },
        pointBackgroundColor: (ctx) => {
          const idx = ctx.dataIndex;
          const highlightIdx1 = basicPriceCount + preparePriceCount;
          const highlightIdx2 = highlightIdx1 + playPriceCount;
          return (
            playingDepth &&
            (idx === highlightIdx1 || idx === highlightIdx2)
          )
            ? color
            : "rgba(0,0,0,0)";
        },
        borderColor: color,
        showLine: true,
        fill: false,
      },
    ],
  };

  const chartOptions: ChartOptions<"scatter"> = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      y: {
        type: "linear",
        display: false,
        grid: { display: false },
        min: 0,
        max: graphVerticalRatio,
      },
      x: {
        type: "linear",
        display: false,
        grid: { display: false },
        min: playingDepth
          ? -(
              graphHorizontalRatio -
              (graphHorizontalRatio -
                graphHorizontalRatio / Config.graphHorizontalZoomRatio) *
                (playingDepth /
                  Math.floor(Config.zoomTime / Config.interval.priceUpdate))
            )
          : -graphHorizontalRatio,
        max: 0,
      },
    },
    animation: {
      duration: Config.interval.priceUpdate,
      easing: "linear",
    },
  };

  return (
    <div className="w-full h-full">
      <Scatter data={chartData} options={chartOptions} />
    </div>
  );
};

export default ChartJs2Graph;


