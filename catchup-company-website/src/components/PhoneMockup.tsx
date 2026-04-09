interface PhoneMockupProps {
  src: string;
  alt?: string;
  animated?: boolean;
  dark?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export default function PhoneMockup({
  src,
  alt = "CatchUp app screenshot",
  animated = false,
  dark = false,
  style,
  className = "",
}: PhoneMockupProps) {
  return (
    <div className={`phone-outer ${animated ? "phone-float" : ""} ${className}`} style={style}>
      <div className={`phone-frame ${dark ? "phone-frame-dark" : ""}`}>
        {/* Notch */}
        <div className={`phone-notch ${dark ? "phone-notch-dark" : ""}`}>
          <div className="phone-camera" />
        </div>
        {/* Screenshot */}
        <div className="phone-screen-img">
          <img src={src} alt={alt} draggable={false} />
        </div>
        {/* Home bar */}
        <div className={`phone-home-bar ${dark ? "phone-home-bar-dark" : ""}`}>
          <div className={`phone-home-indicator ${dark ? "phone-home-indicator-dark" : ""}`} />
        </div>
      </div>
    </div>
  );
}
