import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../veda_frontend/src/pages/Login';

/**
 * MOCK GLOBAL FETCH
 * We simulate API responses so that the test doesn't actually call the server.
 */
global.fetch = vi.fn();

describe('Integration: Login Page', () => {
    it('should show an error message when login fails', async () => {
        // Setup failed mock response
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Invalid credentials' }),
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Simulate user input
        fireEvent.change(screen.getByLabelText(/University Email/i), {
            target: { value: 'test@univ.ac.id' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'wrongpassword' },
        });

        // Click login button
        fireEvent.click(screen.getByRole('button', { name: /LOGIN/i }));

        // Wait for error message to appear in the UI
        await waitFor(() => {
            expect(screen.getByText(/Invalid credentials/i)).toBeDefined();
        });
    });

    it('should call the correct API on submit', async () => {
        // Setup successful mock response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: 'fake_token', token_type: 'bearer' }),
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/University Email/i), {
            target: { value: 'admin@univ.ac.id' },
        });
        fireEvent.change(screen.getByLabelText(/Password/i), {
            target: { value: 'securepassword' },
        });

        fireEvent.click(screen.getByRole('button', { name: /LOGIN/i }));

        await waitFor(() => {
            // Ensure fetch is called to the issuer login URL
            expect(fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/issuer/login'),
                expect.any(Object)
            );
        });
    });
});
