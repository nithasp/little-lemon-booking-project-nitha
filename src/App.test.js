import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the portfolio app', () => {
  render(<App />);
  // Check if the greeting text from LandingSection is present
  const greetingElement = screen.getByText(/Hello, I am Pete!/i);
  expect(greetingElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<App />);
  // Check if navigation links are present using getAllByText since there might be multiple instances
  const projectsLinks = screen.getAllByText(/Projects/i);
  const contactLinks = screen.getAllByText(/Contact Me/i);
  expect(projectsLinks.length).toBeGreaterThan(0);
  expect(contactLinks.length).toBeGreaterThan(0);
});
