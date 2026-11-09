export interface Axes {
  thrust: number; // +1 forward, -1 reverse/brake
  steer: number;  // -1 left, +1 right (yaw & bank)
  pitch: number;  // -1 down, +1 up
  boost: boolean; // turbo boost
  action: boolean; // space / action
}

const keys = new Set<string>();

export const touch = {
  thrust: 0,
  steer: 0,
  pitch: 0,
  boost: false,
};

export function attachKeyboard(onSpecial?: (code: string) => void) {
  const down = (e: KeyboardEvent) => {
    if (e.code === "F12" || (e.metaKey && e.code === "KeyR")) return;
    keys.add(e.code);
    if (onSpecial) onSpecial(e.code);
  };
  const up = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };

  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);

  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    keys.clear();
  };
}

export function readAxes(): Axes {
  let thrust = 0;
  let steer = 0;
  let pitch = 0;
  let boost = false;
  let action = false;

  // Simple intuitive controls:
  // Forward / Reverse: W / S or Arrow Up / Down
  if (keys.has("KeyW") || keys.has("ArrowUp")) thrust += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) thrust -= 1;

  // Turn Left / Right: A / D or Arrow Left / Right
  if (keys.has("KeyA") || keys.has("ArrowLeft")) steer -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) steer += 1;

  // Pitch Nose Up / Down: Q / E or R / F
  if (keys.has("KeyQ") || keys.has("KeyR")) pitch -= 1; // pitch down
  if (keys.has("KeyE") || keys.has("KeyF")) pitch += 1; // pitch up

  // Boost: Shift or Space
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) boost = true;
  if (keys.has("Space") || keys.has("Enter")) action = true;

  // Touch overrides
  if (Math.abs(touch.thrust) > 0.05) thrust = touch.thrust;
  if (Math.abs(touch.steer) > 0.05) steer = touch.steer;
  if (Math.abs(touch.pitch) > 0.05) pitch = touch.pitch;
  if (touch.boost) boost = true;

  return { thrust, steer, pitch, boost, action };
}
