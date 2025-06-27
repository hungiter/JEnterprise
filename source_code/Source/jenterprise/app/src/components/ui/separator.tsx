import * as React from "react";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

const Separator = ({ className = "", ...props }: SeparatorProps) => (
    <div className={`w-full h-px bg-gray-200 ${className}`} {...props} />
);

export { Separator };
