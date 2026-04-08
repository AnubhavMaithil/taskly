import { ReactNode } from "react";

interface MaxWidthWrapperProps {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const MaxWidthWrapper = ({ children, className, style }: MaxWidthWrapperProps) => {
    return (
        <div
            style={style}
            className={`w-full max-w-7xl mx-auto ${className} px-6 md:px-10 lg:px-20`}
        >
            {children}
        </div>
    );
};

export default MaxWidthWrapper;