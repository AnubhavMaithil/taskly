import Image from "next/image";

type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export default function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={`brand-logo flex flex-col md:flex-row items-center gap-5 ${compact ? "brand-logo-compact" : ""} ${className}`.trim()}>
      <Image
        width={100}
        height={100}
        loading="eager"
        src="/logo-mark.svg"
        alt="Taskly logo"
        className={compact ? "w-12 h-12" : "w-12 h-12"}
      />
      {compact ? null :
        <div className="flex flex-col items-center md:items-start">
          <span className="text-xl md:text-lg font-bold">Taskly</span>
          <span className="text-md md:text-sm font-medium">Get it done. One tiny win at a time.</span>
        </div>
      }
    </div>
  );
}
