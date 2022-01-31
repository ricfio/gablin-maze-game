export function contain(sprite, container) {
    let collision = {
        top: false,
        right: false,
        bottom: false,
        left: false,
    }
    //Left
    if (sprite.x < container.x) {
      sprite.x = container.x;
      collision.left = true;
    }
    //Top
    if (sprite.y < container.y) {
      sprite.y = container.y;
      collision.top = true;
    }
    //Right
    if (sprite.x + sprite.width > container.width) {
      sprite.x = container.width - sprite.width;
      collision.right = true;
    }
    //Bottom
    if (sprite.y + sprite.height > container.height) {
      sprite.y = container.height - sprite.height;
      collision.bottom = true;
    }
    // Return the `collision` value
    return collision;
}
