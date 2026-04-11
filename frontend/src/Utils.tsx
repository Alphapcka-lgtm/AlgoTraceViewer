export function getRandomId(): string {
    return "i" + Math.floor(Date.now() * Math.random()).toString();
}