import type { CSSProperties } from "react";

const bars = Array.from({ length: 12 });

type SpinnerProps = {
  color: string;
  size?: number;
};

function Spinner({ color, size = 20 }: SpinnerProps) {
  const style = {
    "--spinner-size": `${size}px`,
    "--spinner-color": color,
  } as CSSProperties;

  return (
    <span className="feedback-spinner-wrapper" style={style} aria-hidden="true">
      <span className="feedback-spinner-bars">
        {bars.map((_, index) => <span className="feedback-spinner-bar" key={index} />)}
      </span>
    </span>
  );
}

export default Spinner;
