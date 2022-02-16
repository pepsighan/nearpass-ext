import React from 'react';
import { render } from 'react-dom';
import App from './App';

const body = document.querySelector('body');
const app = document.createElement('div');
app.id = 'nearpass-app';

if (body) {
  body.append(app);
}

render(<App />, app);

if ((module as any).hot) {
  (module as any).hot.accept();
}
