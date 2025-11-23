import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContactMeSection from './ContactMeSection';
import useSubmit from '../hooks/useSubmit';
import { useAlertContext } from '../context/alertContext';

// Mock the hooks
jest.mock('../hooks/useSubmit');
jest.mock('../context/alertContext');

describe('ContactMeSection', () => {
  let mockSubmit;
  let mockOnOpen;

  beforeEach(() => {
    // Reset mocks before each test
    mockSubmit = jest.fn();
    mockOnOpen = jest.fn();

    useSubmit.mockReturnValue({
      isLoading: false,
      response: null,
      submit: mockSubmit,
    });

    useAlertContext.mockReturnValue({
      onOpen: mockOnOpen,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('Required field validations', () => {
    test('should show error message when firstName is empty and field is touched', async () => {
      render(<ContactMeSection />);
      
      const firstNameInput = screen.getByLabelText(/name/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Touch the field and leave it empty
      fireEvent.focus(firstNameInput);
      fireEvent.blur(firstNameInput);

      // Try to submit
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Required');
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      // onSubmit should not be called
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should show error message when email is empty and field is touched', async () => {
      render(<ContactMeSection />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Touch the field and leave it empty
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);

      // Try to submit
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Required');
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      // onSubmit should not be called
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should show error message when comment is empty and field is touched', async () => {
      render(<ContactMeSection />);
      
      const commentInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Touch the field and leave it empty
      fireEvent.focus(commentInput);
      fireEvent.blur(commentInput);

      // Try to submit
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Required');
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      // onSubmit should not be called
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Email validation', () => {
    test('should show error message when email is invalid', async () => {
      render(<ContactMeSection />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Enter invalid email
      await userEvent.type(emailInput, 'invalidemail');
      fireEvent.blur(emailInput);

      // Try to submit
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });

      // onSubmit should not be called
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should not show error when email is valid', async () => {
      render(<ContactMeSection />);
      
      const emailInput = screen.getByLabelText(/email address/i);

      // Enter valid email
      await userEvent.type(emailInput, 'test@example.com');
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
      });
    });
  });

  describe('Comment length validation', () => {
    test('should show error message when comment is less than 25 characters', async () => {
      render(<ContactMeSection />);
      
      const commentInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Enter short comment (less than 25 characters)
      await userEvent.type(commentInput, 'Short message');
      fireEvent.blur(commentInput);

      // Try to submit
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Must be at least 25 characters')).toBeInTheDocument();
      });

      // onSubmit should not be called
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should not show error when comment is at least 25 characters', async () => {
      render(<ContactMeSection />);
      
      const commentInput = screen.getByLabelText(/your message/i);

      // Enter comment with exactly 25 characters
      await userEvent.type(commentInput, 'This is a valid message!');
      fireEvent.blur(commentInput);

      await waitFor(() => {
        expect(screen.queryByText('Must be at least 25 characters')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form submission with validation failures', () => {
    test('should not call onSubmit when all required fields are empty', async () => {
      render(<ContactMeSection />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Try to submit without filling any fields
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorMessages = screen.getAllByText('Required');
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      // onSubmit should not be called
      expect(mockSubmit).not.toHaveBeenCalled();
    });

    test('should not call onSubmit when validation fails', async () => {
      render(<ContactMeSection />);
      
      const firstNameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const commentInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Fill form with invalid data
      await userEvent.type(firstNameInput, 'John');
      await userEvent.type(emailInput, 'invalidemail');
      await userEvent.type(commentInput, 'Too short');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        expect(screen.getByText('Must be at least 25 characters')).toBeInTheDocument();
      });

      // onSubmit should not be called
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Form submission with valid data', () => {
    test('should call onSubmit when all validations pass', async () => {
      render(<ContactMeSection />);
      
      const firstNameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const typeSelect = screen.getByLabelText(/type of enquiry/i);
      const commentInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Fill form with valid data
      await userEvent.type(firstNameInput, 'John Doe');
      await userEvent.type(emailInput, 'john.doe@example.com');
      await userEvent.selectOptions(typeSelect, 'hireMe');
      await userEvent.type(commentInput, 'This is a valid comment with more than 25 characters.');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(mockSubmit).toHaveBeenCalledWith(
          'https://john.com/contactme',
          {
            firstName: 'John Doe',
            email: 'john.doe@example.com',
            type: 'hireMe',
            comment: 'This is a valid comment with more than 25 characters.',
          }
        );
      });
    });

    test('should show loading state during submission', async () => {
      // Mock isLoading as true
      useSubmit.mockReturnValue({
        isLoading: true,
        response: null,
        submit: mockSubmit,
      });

      render(<ContactMeSection />);
      
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Button should be in loading state
      expect(submitButton).toHaveAttribute('data-loading');
    });

    test('should reset form after successful submission', async () => {
      const { rerender } = render(<ContactMeSection />);
      
      const firstNameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const commentInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Fill form with valid data
      await userEvent.type(firstNameInput, 'John Doe');
      await userEvent.type(emailInput, 'john.doe@example.com');
      await userEvent.type(commentInput, 'This is a valid comment with more than 25 characters.');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });

      // Simulate successful response
      useSubmit.mockReturnValue({
        isLoading: false,
        response: {
          type: 'success',
          message: 'Thanks for your submission John Doe, we will get back to you shortly!',
        },
        submit: mockSubmit,
      });

      rerender(<ContactMeSection />);

      await waitFor(() => {
        // Form should be reset
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email address/i)).toHaveValue('');
        expect(screen.getByLabelText(/your message/i)).toHaveValue('');
      });

      // Alert should be opened
      expect(mockOnOpen).toHaveBeenCalledWith(
        'success',
        'Thanks for your submission John Doe, we will get back to you shortly!'
      );
    });

    test('should not reset form after failed submission', async () => {
      const { rerender } = render(<ContactMeSection />);
      
      const firstNameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const commentInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Fill form with valid data
      await userEvent.type(firstNameInput, 'John Doe');
      await userEvent.type(emailInput, 'john.doe@example.com');
      await userEvent.type(commentInput, 'This is a valid comment with more than 25 characters.');

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledTimes(1);
      });

      // Simulate error response
      useSubmit.mockReturnValue({
        isLoading: false,
        response: {
          type: 'error',
          message: 'Something went wrong, please try again later!',
        },
        submit: mockSubmit,
      });

      rerender(<ContactMeSection />);

      await waitFor(() => {
        // Form should NOT be reset
        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/email address/i)).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText(/your message/i)).toHaveValue('This is a valid comment with more than 25 characters.');
      });

      // Alert should still be opened with error
      expect(mockOnOpen).toHaveBeenCalledWith(
        'error',
        'Something went wrong, please try again later!'
      );
    });
  });

  describe('Loading state transitions', () => {
    test('should transition from not loading to loading to not loading', async () => {
      let loadingState = false;
      const mockSubmitWithDelay = jest.fn();

      useSubmit.mockReturnValue({
        isLoading: loadingState,
        response: null,
        submit: mockSubmitWithDelay,
      });

      const { rerender } = render(<ContactMeSection />);
      
      const firstNameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const commentInput = screen.getByLabelText(/your message/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      // Initial state: not loading
      expect(submitButton).not.toHaveAttribute('data-loading');

      // Fill form with valid data
      await userEvent.type(firstNameInput, 'John Doe');
      await userEvent.type(emailInput, 'john.doe@example.com');
      await userEvent.type(commentInput, 'This is a valid comment with more than 25 characters.');

      fireEvent.click(submitButton);

      // Set loading to true
      loadingState = true;
      useSubmit.mockReturnValue({
        isLoading: loadingState,
        response: null,
        submit: mockSubmitWithDelay,
      });

      rerender(<ContactMeSection />);

      // Loading state: button should be disabled/loading
      expect(screen.getByRole('button', { name: /submit/i })).toHaveAttribute('data-loading');

      // Set loading to false after submission
      loadingState = false;
      useSubmit.mockReturnValue({
        isLoading: loadingState,
        response: {
          type: 'success',
          message: 'Thanks for your submission John Doe, we will get back to you shortly!',
        },
        submit: mockSubmitWithDelay,
      });

      rerender(<ContactMeSection />);

      // Final state: not loading
      expect(screen.getByRole('button', { name: /submit/i })).not.toHaveAttribute('data-loading');
    });
  });
});

