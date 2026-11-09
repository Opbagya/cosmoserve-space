export interface Axes {
  // Regular movement (Arrow keys)
  forward: number; // ArrowUp (+1 forward) / ArrowDown (-1 back/brake)
  strafe: number;  // ArrowRight (+1 right) / ArrowLeft (-1 left)

  // 3D Rotational attitude (W, A, S, D)
  pitch: number;   // W (-1 nose down) / S (+1 nose up)
  yaw: number;     // D (+1 yaw right) / A (-1 yaw left)
  roll: number;    // D (+1 bank right) / A (-1 bank left) (plus Q/E)

  nitro: boolean;  // Shift (Nitro turbo boost)
  action: boolean; // Space / Enter (Launch / Undock / De-orbit)
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

    // Prevent Alt key from unfocusing browser window on Windows
    if (e.code === "AltLeft" || e.code === "AltRight" || e.key === "Alt") {
      e.preventDefault();
    }

    // Prevent Command key from triggering browser shortcuts like Cmd+D or Cmd+S
    if (e.code === "MetaLeft" || e.code === "MetaRight") {
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
  let forward = 0;
  let strafe = 0;
  let pitch = 0;
  let yaw = 0;
  let roll = 0;
  let nitro = false;
  let action = false;

  // 1. REGULAR MOVEMENT: Arrow keys
  // ArrowUp: Front (forward thrust) / ArrowDown: Back (reverse/brake)
  if (keys.has("ArrowUp")) forward += 1;
  if (keys.has("ArrowDown")) forward -= 1;

  // ArrowLeft / ArrowRight: Lateral strafe / steer
  if (keys.has("ArrowLeft")) strafe -= 1;
  if (keys.has("ArrowRight")) strafe += 1;

  // 2. 3D FLIGHT ATTITUDE: W, A, S, D
  // W: Pitch down / nose forward (-1)
  // S: Pitch up / nose up (+1)
  if (keys.has("KeyW")) pitch -= 1;
  if (keys.has("KeyS")) pitch += 1;

  // A: Yaw left (-1) & bank roll left (-1)
  // D: Yaw right (+1) & bank roll right (+1)
  if (keys.has("KeyA")) {
    yaw -= 1;
    roll -= 1;
  }
  if (keys.has("KeyD")) {
    yaw += 1;
    roll += 1;
  }

  // Pure Roll support with Q / E
  if (keys.has("KeyQ")) roll -= 1;
  if (keys.has("KeyE")) roll += 1;

  // 3. NITRO TURBO BOOST: Shift (Hold)
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) nitro = true;

  // 4. ACTION: Space or Enter (Launch / Undock / De-orbit)
  if (keys.has("Space") || keys.has("Enter")) action = true;

  // 5. Touch / Virtual Stick overrides (Mobile)
  if (Math.abs(touch.thrust) > 0.05) forward = touch.thrust;
  if (Math.abs(touch.steer) > 0.05) {
    yaw = touch.steer;
    strafe = touch.steer;
    roll = touch.steer;
  }
  if (Math.abs(touch.pitch) > 0.05) pitch = touch.pitch;
  if (touch.boost) nitro = true;

  forward = Math.max(-1, Math.min(1, forward));
  strafe = Math.max(-1, Math.min(1, strafe));
  pitch = Math.max(-1, Math.min(1, pitch));
  yaw = Math.max(-1, Math.min(1, yaw));
  roll = Math.max(-1, Math.min(1, roll));

  return { forward, strafe, pitch, yaw, roll, nitro, action };
}
