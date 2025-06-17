// frontend/src/components/AlertDialog.js
import React from 'react';
import './alertDialog.css'; // Import component-specific CSS

const AlertDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    return (
        <div className="alert-overlay">
            <div className="alert-dialog">
                <h3 className="alert-title">{title}</h3>
                <p className="alert-message">{message}</p>
                <div className="alert-actions">
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="alert-cancel-button"
                        >
                            {cancelText}
                        </button>
                    )}
                    {onConfirm && (
                        <button
                            onClick={onConfirm}
                            className="alert-confirm-button"
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlertDialog;
