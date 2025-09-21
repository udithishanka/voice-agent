import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

export function setupCounter(element: HTMLButtonElement, stopButton?: HTMLButtonElement) {
  element.innerHTML = 'Start Realtime Session';
  let session: RealtimeSession | null = null;

  async function fetchEphemeralKey(): Promise<string> {
    const res = await fetch('/api/get-realtime-key');
    if (!res.ok) throw new Error('Failed to fetch ephemeral key');
    const data = await res.json();
    if (!data.key) throw new Error('No key returned');
    return data.key;
  }

  async function connectWithFreshKey() {
    const agent = new RealtimeAgent({
      name: 'Assistant',
      instructions: 'You are a helpful English assistant.',
    });
    session = new RealtimeSession(agent);
    try {
      const apiKey = await fetchEphemeralKey();
      await session.connect({ apiKey });
      console.log('You are connected!');
      element.innerHTML = 'Connected!';
    } catch (e: any) {
      console.error(e);
      element.innerHTML = 'Connection Failed';
      // If error is due to key expiry, try again
      if (e?.message?.includes('expired') || e?.message?.includes('401')) {
        try {
          const apiKey = await fetchEphemeralKey();
          await session.connect({ apiKey });
          console.log('You are connected (after refresh)!');
          element.innerHTML = 'Connected!';
        } catch (err) {
          console.error('Retry failed:', err);
        }
      }
    }
  }

  element.addEventListener('click', connectWithFreshKey);

  if (stopButton) {
    stopButton.addEventListener('click', () => {
      if (session) {
        session.close();
        console.log('Session stopped.');
        element.innerHTML = 'Start Realtime Session';
        session = null;
      }
    });
  }
}
