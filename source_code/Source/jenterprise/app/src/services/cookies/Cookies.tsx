export const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
    return null;
};

export const clearCookie = (name: string): void => {
    document.cookie = `${name}=; path=/; max-age=0`;
};

export const saveListToCookies = (name: string, list: any[], maxAgeSeconds = 86400) => {
    const json = JSON.stringify(list);
    document.cookie = `${name}=${encodeURIComponent(json)}; path=/; max-age=${maxAgeSeconds}`;
}

export const getListFromCookie = (name: string): any[] => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
        try {
            return JSON.parse(decodeURIComponent(match[2]));
        } catch (err) {
            console.error("Lỗi khi parse JSON từ cookie:", err);
        }
    }
    return [];
};
