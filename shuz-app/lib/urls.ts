// Cross-cutting URL functions.
// Kept here togther because a change in one likely needs a change in the other.
// Try to keep short for QR-friendliness ('s' is for 'send to').

import { GetServerSidePropsContext } from "next";

// Client-side
// -----------
/**
 * Create QR code-friendly 'Send To' url of something like 'https://my.app/?s={receiverId}'
 */
export function makeSendToUrl(receiverId: string): string {
    const url = new URL(window.location.origin);
    url.search = new URLSearchParams({s: receiverId}).toString();
    return url.toString();
}
export function parseReceiverId(url: string): string | null {
    // handle null upstream
    return new URL(url).searchParams.get('s');
}

// Server-side
// -----------
/**
 * Get receiver ID at page generation time.
 * Be careful around caching with this. Would be VERY problematic if cache key is not configured correctly. 
 */
export function getReceiverIdFromUrl(context: GetServerSidePropsContext) {
    const receiverId = (typeof context.query.s === 'string' && context.query.s) || null;
    return receiverId;
}