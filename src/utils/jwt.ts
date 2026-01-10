export function decodeJwtPayload(token: string) {
    const payload = token.split(".")[1];
    if (!payload) {
      throw new Error("Invalid token");
    }
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload) as {
      name?: string;
      email?: string;
      picture?: string;
    };
  }