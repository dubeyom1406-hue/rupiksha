/**
 * emailService.js
 * Automatic email system using RUPIKSHA Python Backend.
 * Uses the pre-configured SMTP settings in backend/.env
 */

import { BACKEND_URL } from './dataService';

/**
 * Sends a real approval email via the Python Backend SMTP.
 */
export const sendApprovalEmail = async (params) => {
    try {
        const response = await fetch(`${BACKEND_URL}/send-approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: params.to,
                name: params.name,
                login_id: params.loginId,
                password: params.password,
                id_label: params.idLabel,
                id_value: params.idValue,
                portal_type: params.portalType
            })
        });

        const result = await response.json();
        return result;
    } catch (err) {
        console.error('❌ [Approval Email] Failed:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Sends OTP to a given email address.
 */
export const sendOTPEmail = async (email, otp, name) => {
    try {
        const response = await fetch(`${BACKEND_URL}/send-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: email, otp, name })
        });
        return await response.json();
    } catch (err) {
        console.error('❌ [OTP Email] Failed:', err);
        return { success: false, message: err.message };
    }
};

/**
 * Sends credentials to a newly added user, mentioning who added them.
 */
export const sendCredentialsEmail = async (params) => {
    try {
        const response = await fetch(`${BACKEND_URL}/send-credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: params.to,
                name: params.name,
                login_id: params.loginId,
                password: params.password,
                added_by: params.addedBy,
                portal_type: params.portalType
            })
        });
        return await response.json();
    } catch (err) {
        console.error('❌ [Credentials Email] Failed:', err);
        return { success: false, message: err.message };
    }
};
