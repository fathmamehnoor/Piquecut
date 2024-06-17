import { render, screen } from '@testing-library/react';
import App from './components/App.js';
import React from 'react';


test('renders learn react link', () => {
  const { getByText } = render();
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
