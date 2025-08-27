import React from "react";
import { soundService } from "@/services/soundService";

interface SelectPricePanelProps {
  betPrices: number[];
  bettedPrice: number;
  onChangeBet: (bet: number) => void;
  isBettable: boolean;
}

export default function SelectPricePanel(props: SelectPricePanelProps) {

  return (
    <div className="flex flex-row items-center justify-between w-full gap-1 sm:gap-4">
      {props.betPrices.length > 0 &&
        props.betPrices.map((item, index) => (
          <button
            onClick={() => {
              soundService.playButtonClick();
              props.onChangeBet(item);
            }}
            disabled={!props.isBettable}
            key={index}
            className={`w-full h-[42px] font-oswald font-semibold rounded-lg text-xl sm:text-2xl border-2 border-solid border-[#0eff76] transition-all ease-in-out hover:scale-110 duration-300 ${
              !props.isBettable
                ? "filter grayscale-[80%]"
                : "filter grayscale-0"
            } ${
              item === props.bettedPrice
                ? "text-white bg-gradient-to-r from-[#00614a] to-[#00eb96]"
                : "text-[#3bff8a]"
            }`}
          >
{item}
          </button>
        ))}
    </div>
  );
}
