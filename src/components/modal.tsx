import React, { useState, useEffect, type PropsWithChildren } from "react";
import styled, { keyframes } from "styled-components";

const appear = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const hide = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.5);
    opacity: 0;
  }
`;

enum AnimType {
  APPEAR = "appear",
  HIDE = "hide",
}

const AnimatedDiv = styled.div<{ type: string }>`
  animation: ${(props) =>
      props.type === AnimType.APPEAR
        ? appear
        : props.type === AnimType.HIDE
        ? hide
        : ""}
    0.5s ease-in-out forwards;
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Modal: React.FC<PropsWithChildren<ModalProps>> = (props) => {
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
      } fixed top-0 left-0 w-screen h-screen bg-black bg-opacity-50 z-50 flex flex-row items-center justify-center`}
    >
      <div
        className="fixed top-0 left-0 w-screen h-screen backdrop-blur-sm"
        onClick={() => props.onClose()}
      />
      <AnimatedDiv
        className="w-fit h-fit"
        type={isCloseStarted ? AnimType.HIDE : AnimType.APPEAR}
      >
        {props.children}
      </AnimatedDiv>
    </div>
  );
};

export default Modal;
