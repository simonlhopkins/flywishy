type KeyHandler = (event: KeyboardEvent) => void;

/**
 * Adds a keydown listener for a specific key.
 * Returns a cleanup function to remove the listener.
 *
 * @param key - The key to listen for (e.g. 'Enter', 'Escape', 'a', etc.)
 * @param handler - The function to run when the key is pressed
 */
export function onKeyDown(key: string, handler: KeyHandler): () => void {
  const listener = (event: KeyboardEvent) => {
    if (event.key === key) {
      handler(event);
    }
  };

  window.addEventListener("keydown", listener);
  return () => window.removeEventListener("keydown", listener);
}
