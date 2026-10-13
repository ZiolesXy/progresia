export async function hashPin(pin: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(pin)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
}

export function generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const segment = () =>
        Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
    return `${segment()}-${segment}}-${segment}`
}

export function generatePin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}