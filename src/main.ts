import './style.css'
import { setupCounter } from './counter.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1><i class="fas fa-microphone"></i> Realtime Chat App</h1>
    <div class="card">
      <div id="status" class="status">Disconnected</div>
      <div class="button-group">
        <button id="counter" type="button"><i class="fas fa-play"></i> Start Session</button>
        <button id="stop-session" type="button"><i class="fas fa-stop"></i> Stop</button>
      </div>
    </div>
  </div>
`

const counterButton = document.querySelector<HTMLButtonElement>('#counter')!
const stopButton = document.querySelector<HTMLButtonElement>('#stop-session')!
setupCounter(counterButton, stopButton)
