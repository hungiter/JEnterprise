import { Separator } from "../ui/separator";
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
        <h2 className="text-xl font-semibold text-primary">{title}</h2>
        <Separator />
        <div className="text-sm text-muted-foreground space-y-2">{children}</div>
    </div>
);

export { Section };