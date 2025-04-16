import * as React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className = "", ...props }, ref) => (
    <div
        ref={ref}
        className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
        {...props}
    />
));
Card.displayName = "Card";

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(({ className = "", ...props }, ref) => (
    <div ref={ref} className={`p-4 text-gray-800 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

export { Card, CardContent };
