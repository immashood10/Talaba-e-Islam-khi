// Sends push notifications to the mobile app via Expo's push service.
// This does NOT require a separate Firebase/APNs setup on our side - Expo
// routes to FCM/APNs for us using the push tokens registered by the app.
// Server-only.

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

export async function sendPushNotification(tokens: string[], message: PushMessage): Promise<void> {
  const validTokens = tokens.filter((t) => t.startsWith('ExponentPushToken['));
  if (validTokens.length === 0) return;

  for (const batch of chunk(validTokens, CHUNK_SIZE)) {
    try {
      await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(
          batch.map((to) => ({
            to,
            title: message.title,
            body: message.body,
            data: message.data ?? {},
            sound: 'default',
          })),
        ),
      });
    } catch {
      // Best-effort - a failed push shouldn't break the calling request.
    }
  }
}
