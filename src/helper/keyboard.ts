export function keyboard(value: string) {
    let key = {
        value: value,
        isDown: false,
        isUp: true,
        press: undefined,
        release: undefined,
        // The `downHandler`
        downHandler: event => {
            if (event.key === key.value) {
              if (key.isUp && key.press) key.press(event);
              key.isDown = true;
              key.isUp = false;
              event.preventDefault();
            }
        },
        // The `upHandler`
        upHandler: event => {
            if (event.key === key.value) {
                if (key.isDown && key.release) key.release(event);
                key.isDown = false;
                key.isUp = true;
                event.preventDefault();
            }
        },
        // Detach event listeners
        unsubscribe: () => {
            window.removeEventListener("keydown", downListener);
            window.removeEventListener("keyup", upListener);
        },
    };
  
    // Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);
    
    window.addEventListener(
      "keydown", downListener, false
    );
    window.addEventListener(
      "keyup", upListener, false
    );
    
    return key;
}
