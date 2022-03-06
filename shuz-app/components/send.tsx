import React from 'react';

export function Send() {
    return <form>
    <label>
      Message:
      <input type="text" name="message" />
    </label>
    <input type="submit" value="Send" />
  </form>;
}