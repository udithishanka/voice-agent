import { RealtimeAgent, RealtimeSession } from '@openai/agents/realtime';

export function setupCounter(element: HTMLButtonElement, stopButton?: HTMLButtonElement) {
  element.innerHTML = '<i class="fas fa-play"></i> Start Session';
  let session: RealtimeSession | null = null;
  const statusEl = document.getElementById('status') as HTMLElement;

  async function fetchEphemeralKey(): Promise<string> {
    const res = await fetch('/api/get-realtime-key');
    if (!res.ok) throw new Error('Failed to fetch ephemeral key');
    const data = await res.json();
    if (!data.key) throw new Error('No key returned');
    return data.key;
  }

  async function connectWithFreshKey() {
    statusEl.textContent = 'Connecting...';
    statusEl.className = 'status connecting';
    const agent = new RealtimeAgent({
      name: 'Assistant',
      instructions: 'You are a helpful English assistant.',
    });
    session = new RealtimeSession(agent);
    try {
      const apiKey = await fetchEphemeralKey();
      await session.connect({ apiKey });
      console.log('You are connected!');
      element.innerHTML = '<i class="fas fa-pause"></i> Connected';
      statusEl.textContent = 'Connected';
      statusEl.className = 'status connected';
    } catch (e: any) {
      console.error(e);
      element.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Connection Failed';
      statusEl.textContent = 'Connection Failed';
      statusEl.className = 'status error';
      // If error is due to key expiry, try again
      if (e?.message?.includes('expired') || e?.message?.includes('401')) {
        try {
          const apiKey = await fetchEphemeralKey();
          await session.connect({ apiKey });
          console.log('You are connected (after refresh)!');
          element.innerHTML = '<i class="fas fa-pause"></i> Connected';
          statusEl.textContent = 'Connected';
          statusEl.className = 'status connected';
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
        element.innerHTML = '<i class="fas fa-play"></i> Start Session';
        statusEl.textContent = 'Disconnected';
        statusEl.className = 'status';
        session = null;
      }
    });
  }
}
