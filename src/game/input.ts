export interface Axes {
  // Regular movement (Arrow keys)
  forward: number; // ArrowUp (+1 forward) / ArrowDown (-1 back/brake)
  steer: number;   // ArrowRight (+1 turn right) / ArrowLeft (-1 turn left) (also D / A)

  // 3D Rotational attitude (W, A, S, D)
  pitch: number;   // W (-1 nose down) / S (+1 nose up)
  roll: number;    // Q (-1) / E (+1)

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

    // Prevent browser shortcuts for Save (Cmd/Ctrl+S), Bookmark (Cmd/Ctrl+D), Print (Cmd/Ctrl+P)
    if ((e.metaKey || e.ctrlKey || e.altKey) && (e.code === "KeyS" || e.code === "KeyD" || e.code === "KeyP")) {
      e.preventDefault();
    }

    // Prevent Alt key from unfocusing browser window on Windows or triggering menu shortcuts
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

  const preventAltClick = (e: MouseEvent) => {
    if (e.altKey) {
      // Prevents browser from treating Alt+Click as a file download shortcut
      e.stopPropagation();
    }
  };

  window.addEventListener("keydown", down, { passive: false });
  window.addEventListener("keyup", up);
  window.addEventListener("click", preventAltClick, { capture: true });

  return () => {
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("click", preventAltClick, { capture: true });
    keys.clear();
  };
}

export function readAxes(): Axes {
  let forward = 0;
  let steer = 0;
  let pitch = 0;
  let roll = 0;
  let nitro = false;
  let action = false;

  // 1. REGULAR MOVEMENT: Arrow keys
  // ArrowUp: Front (forward thrust) / ArrowDown: Back (reverse/brake)
  if (keys.has("ArrowUp")) forward += 1;
  if (keys.has("ArrowDown")) forward -= 1;

  // ArrowLeft: Turn Left (-1) / ArrowRight: Turn Right (+1)
  if (keys.has("ArrowLeft")) steer -= 1;
  if (keys.has("ArrowRight")) steer += 1;

  // 2. 3D FLIGHT ATTITUDE: W, A, S, D
  // W: Pitch down / nose forward (-1)
  // S: Pitch up / nose up (+1)
  if (keys.has("KeyW")) pitch -= 1;
  if (keys.has("KeyS")) pitch += 1;

  // A: Turn Left (-1) / D: Turn Right (+1)
  if (keys.has("KeyA")) steer -= 1;
  if (keys.has("KeyD")) steer += 1;

  // Dedicated Roll keys: Q / E
  if (keys.has("KeyQ")) roll -= 1;
  if (keys.has("KeyE")) roll += 1;

  // 3. NITRO TURBO BOOST: Shift (Hold)
  if (keys.has("ShiftLeft") || keys.has("ShiftRight")) nitro = true;

  // 4. ACTION: Space or Enter (Launch / Undock / De-orbit)
  if (keys.has("Space") || keys.has("Enter")) action = true;

  // 5. Touch / Virtual Stick overrides (Mobile)
  if (Math.abs(touch.thrust) > 0.05) forward = touch.thrust;
  if (Math.abs(touch.steer) > 0.05) steer = touch.steer;
  if (Math.abs(touch.pitch) > 0.05) pitch = touch.pitch;
  if (touch.boost) nitro = true;

  forward = Math.max(-1, Math.min(1, forward));
  steer = Math.max(-1, Math.min(1, steer));
  pitch = Math.max(-1, Math.min(1, pitch));
  roll = Math.max(-1, Math.min(1, roll));

  return { forward, steer, pitch, roll, nitro, action };
}
