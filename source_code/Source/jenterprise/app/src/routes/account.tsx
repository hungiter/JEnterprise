export function meta({ }: Route.MetaArgs) {
    return [
        { title: "Account's Info" },
        { name: "description", content: "Account's Info" },
    ];
}

export default function AccountInfo() {
    return <h1>Account Info</h1>;
}