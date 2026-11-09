export interface Axes {
  pitch: number;    // W / S or ↑ / ↓ (-1 down, +1 up)
  yaw: number;      // A / D or ← / → (-1 left, +1 right)
  roll: number;     // Q / E (-1 bank left, +1 bank right)
  forward: number;  // R / F (+1 forward, -1 retrograde)
  sway: number;     // J / L (-1 sway left, +1 sway right)
  heave: number;    // Space / C (+1 heave up, -1 heave down)
  boost: boolean;   // Shift (Hold)
  action: boolean;  // Space or Action button
}

const keys = new Set<string>();

export const touch = {
  forward: 0,   // Left Stick Vertical (R / F)
  sway: 0,      // Left Stick Horizontal (J / L)
  pitch: 0,     // Right Stick Vertical (W / S)
  yaw: 0,       // Right Stick Horizontal (A / D)
  roll: 0,      // Roll Touch Buttons (Q / E)
  heave: 0,     // Up / Down Buttons (Space / C)
  boost: false, // Boost Button
};

export type KeyHandler = (code: string, event: KeyboardEvent) => void;

export function attachKeyboard(onSpecial?: KeyHandler) {
  const down = (e: KeyboardEvent) => {
    // Allow developer tools and browser reload
    if (e.code === "F12" || (e.metaKey && e.code === "KeyR") || (e.ctrlKey && e.code === "KeyR")) {
      return;
    }

    // Prevent Alt key from unfocusing browser window on Windows
    if (e.code === "AltLeft" || e.code === "AltRight" || e.key === "Alt") {
      e.preventDefault();
    }

    // Prevent Space / Arrow keys from scrolling the webpage
    if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) {
      e.preventDefault();
    }

    keys.add(e.code);

    if (onSpecial) {
      onSpecial(e.code, e);
    }
  };

  const up = (e: KeyboardEvent) => {
    keys.delete(e.code);
  };

  window.addEventListener("keydown", down, { passive: false });
  window.addEventListener("keyup", up);

  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    keys.clear();
  };
}

export function readAxes(): Axes {
  let pitch = 0;
  let yaw = 0;
  let roll = 0;
  let forward = 0;
  let sway = 0;
  let heave = 0;
  let boost = false;
  let action = false;

  // 1. Pitch: W / S or ↑ / ↓
  if (keys.has("KeyW") || keys.has("ArrowUp")) pitch -= 1; // Pitch down / forward
  if (keys.has("KeyS") || keys.has("ArrowDown")) pitch += 1; // Pitch up

  // 2. Yaw: A / D or ← / →
  if (keys.has("KeyA") || keys.has("ArrowLeft")) yaw -= 1; // Yaw left
  if (keys.has("KeyD") || keys.has("ArrowRight")) yaw += 1; // Yaw right

  // 3. Roll: Q / E
  if (keys.has("KeyQ")) roll -= 1; // Roll left (counter-clockwise)
  if (keys.has("KeyE")) roll += 1; // Roll right (clockwise)

  // 4. Forward / Retrograde: R / F
  if (keys.has("KeyR")) forward += 1; // Forward thrust
  if (keys.has("KeyF")) forward -= 1; // Retrograde / brake

  // 5. Sway Left / Right: J / L
  if (keys.has("KeyJ")) sway -= 1; // Sway left
  if (keys.has("KeyL")) sway += 1; // Sway right

  // 6. Heave Up / Down: Space / C
  if (keys.has("Space")) heave += 1; // Heave up
  if (keys.has("KeyC")) heave -= 1; // Heave down

  // 7. Boost Surge: Shift (Hold)
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) boost = true;

  // Action / Undock / De-orbit
  if (keys.has("Space") || keys.has("Enter")) action = true;

  // Touch & Virtual Sticks overrides (Mobile)
  if (Math.abs(touch.pitch) > 0.05) pitch = touch.pitch;
  if (Math.abs(touch.yaw) > 0.05) yaw = touch.yaw;
  if (Math.abs(touch.roll) > 0.05) roll = touch.roll;
  if (Math.abs(touch.forward) > 0.05) forward = touch.forward;
  if (Math.abs(touch.sway) > 0.05) sway = touch.sway;
  if (Math.abs(touch.heave) > 0.05) heave = touch.heave;
  if (touch.boost) boost = true;

  return { pitch, yaw, roll, forward, sway, heave, boost, action };
}
