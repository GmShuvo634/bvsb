import React, { useState, useEffect, type PropsWithChildren } from "react";
import styled, { keyframes } from "styled-components";

const appearFromLeft = keyframes`
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
`;

const appearFromRight = keyframes`
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(0);    
  }
`;

const hideToLeft = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
`;

const hideToRight = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(100%);
  }
`;

enum AnimType {
  FROM_LEFT = "from-left",
  FROM_RIGHT = "from-right",
  TO_LEFT = "to-left",
  TO_RIGHT = "to-right",
}

const AnimatedDiv = styled.div<{ type: string }>`
  animation: ${(props) =>
      props.type === AnimType.FROM_LEFT
        ? appearFromLeft
        : props.type === AnimType.FROM_RIGHT
        ? appearFromRight
        : props.type === AnimType.TO_LEFT
        ? hideToLeft
        : props.type === AnimType.TO_RIGHT
        ? hideToRight
        : ""}
    0.5s ease-in-out forwards;
`;

export enum DrawerPosition {
  LEFT = "left",
  RIGHT = "right",
}

interface DrawerProps {
  isOpen: boolean;
  position: DrawerPosition;
  onClose: () => void;
}

export const Drawer: React.FC<PropsWithChildren<DrawerProps>> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCloseStarted, setIsCloseStarted] = useState<boolean>(false);

  useEffect(() => {
    if (props.isOpen) {
      setIsCloseStarted(false);
      setIsOpen(true);
    } else {
      onClose();
    }
  }, [props.isOpen]);

  const onClose = () => {
    setIsCloseStarted(true);
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 500);

    return () => clearTimeout(timer);
  };

  return (
    <div
      className={`${
        isOpen ? "flex" : "hidden"
      } fixed top-0 left-0 w-screen h-screen bg-transparent z-40`}
    >
      <div
        className="fixed top-0 left-0 w-screen h-screen backdrop-blur-sm"
        onClick={() => props.onClose()}
      />
      <AnimatedDiv
        className={`absolute top-0 ${
          props.position === DrawerPosition.LEFT ? "left-0" : "right-0"
        } w-fit h-screen`}
        type={
          isCloseStarted
            ? props.position === DrawerPosition.LEFT
              ? AnimType.TO_LEFT
              : AnimType.TO_RIGHT
            : props.position === DrawerPosition.LEFT
            ? AnimType.FROM_LEFT
            : AnimType.FROM_RIGHT
        }
      >
        {props.children}
      </AnimatedDiv>
    </div>
  );
};
