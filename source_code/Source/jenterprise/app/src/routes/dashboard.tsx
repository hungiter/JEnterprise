export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Dashboard" },
        { name: "description", content: "Dashboard" },
    ];
}

export default function DashBoard() {
    return <h1>DashBoard</h1>;
}