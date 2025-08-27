import React from "react";

export const Logo = () => {
  return (
    <div className="flex flex-row items-center">
      <div className="flex flex-row items-center sm:hidden font-oswald">
        <span className="text-2xl text-[#2dffb5]">B</span>
        <span
          className="text-4xl"
          style={{
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            backgroundImage: "linear-gradient(to right, #ffe498, #e7ca6d)",
          }}
        >
          V
        </span>
        <span className="text-2xl text-[#f50105]">B</span>
      </div>
      <div className="flex-row items-center hidden sm:flex font-oswald">
        <span className="text-2xl text-[#2dffb5]">BULLS</span>
        <span
          className="text-4xl"
          style={{
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            backgroundImage: "linear-gradient(to right, #ffe498, #e7ca6d)",
          }}
        >
          VS
        </span>
        <span className="text-2xl text-[#f50105]">BEARS</span>
      </div>
    </div>
  );
};
