export interface Axes {
  pitch: number;
  yaw: number;
  roll: number;
  surge: number; // forward (+1) / back (-1)
  sway: number; // right (+1) / left (-1)
  heave: number; // up (+1) / down (-1)
  boost: boolean;
}

const keys = new Set<string>();

export const touch = {
  tx: 0,
  ty: 0,
  rx: 0,
  ry: 0,
  roll: 0,
  heave: 0,
  surge: 0,
  boost: false,
};

export function attachKeyboard(onSpecial?: (code: string) => void) {
  const down = (e: KeyboardEvent) => {
    // Avoid interfering with browser shortcuts like F5 or DevTools
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
  let pitch = 0;
  let yaw = 0;
  let roll = 0;
  let surge = 0;
  let sway = 0;
  let heave = 0;
  let boost = false;

  // Rotation: W/S (Pitch), A/D (Yaw), Q/E (Roll)
  if (keys.has("KeyW") || keys.has("ArrowUp")) pitch -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) pitch += 1;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) yaw += 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) yaw -= 1;
  if (keys.has("KeyQ")) roll += 1;
  if (keys.has("KeyE")) roll -= 1;

  // Translation:
  // Forward / Retrograde: R / F
  if (keys.has("KeyR")) surge += 1;
  if (keys.has("KeyF") || keys.has("ControlLeft") || keys.has("ControlRight")) surge -= 1;

  // Sway Left / Right: J / L or mapped keys
  if (keys.has("KeyJ")) sway -= 1;
  if (keys.has("KeyL")) sway += 1;

  // Heave Up / Down: Space / C
  if (keys.has("Space")) heave += 1;
  if (keys.has("KeyC")) heave -= 1;

  // Boost: Shift
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) boost = true;

  // Touch overrides
  if (Math.abs(touch.rx) > 0.05) yaw -= touch.rx;
  if (Math.abs(touch.ry) > 0.05) pitch -= touch.ry;
  if (touch.roll !== 0) roll += touch.roll;

  if (Math.abs(touch.tx) > 0.05) sway += touch.tx;
  if (Math.abs(touch.ty) > 0.05) surge += touch.ty;
  if (touch.heave !== 0) heave += touch.heave;
  if (touch.boost) boost = true;

  return { pitch, yaw, roll, surge, sway, heave, boost };
}
