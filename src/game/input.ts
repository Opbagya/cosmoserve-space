export interface Axes {
  thrust: number; // +1 forward, -1 reverse/brake
  steer: number;  // -1 left, +1 right (yaw & bank)
  pitch: number;  // -1 down, +1 up
  boost: boolean; // turbo boost
  action: boolean; // space / launch / deorbit
}

const keys = new Set<string>();

export const touch = {
  thrust: 0,
  steer: 0,
  pitch: 0,
  boost: false,
};

export type KeyHandler = (code: string, event: KeyboardEvent) => void;

export function attachKeyboard(onSpecial?: KeyHandler) {
  const down = (e: KeyboardEvent) => {
    // Allow developer tools and browser reload
    if (e.code === "F12" || (e.metaKey && e.code === "KeyR") || (e.ctrlKey && e.code === "KeyR")) {
      return;
    }

    // Prevent Alt key from unfocusing browser window / opening browser menubar on Windows
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
  let thrust = 0;
  let steer = 0;
  let pitch = 0;
  let boost = false;
  let action = false;

  // 1. Forward / Reverse: W / S or Arrow Up / Down
  if (keys.has("KeyW") || keys.has("ArrowUp")) thrust += 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) thrust -= 1;

  // 2. Turn Left / Right: A / D or Arrow Left / Right (Yaw & banking roll)
  if (keys.has("KeyA") || keys.has("ArrowLeft")) steer -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) steer += 1;

  // 3. Optional Pitch: R (nose down) / F (nose up)
  if (keys.has("KeyR")) pitch -= 1;
  if (keys.has("KeyF")) pitch += 1;

  // 4. Boost: Shift or Space
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) boost = true;
  if (keys.has("Space") || keys.has("Enter")) action = true;

  // 5. Touch / Virtual Stick overrides (Mobile)
  if (Math.abs(touch.thrust) > 0.05) thrust = touch.thrust;
  if (Math.abs(touch.steer) > 0.05) steer = touch.steer;
  if (Math.abs(touch.pitch) > 0.05) pitch = touch.pitch;
  if (touch.boost) boost = true;

  return { thrust, steer, pitch, boost, action };
}
