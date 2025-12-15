import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="modal-content">
                <div className="modal-header">
                    <h2 className="modal-title">{title}</h2>
                    <button onClick={onClose} className="modal-close-btn">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
};

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'default' }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        footer={
            <>
                <button className="btn-secondary" onClick={onClose}>{cancelText}</button>
                <button className={variant === 'destructive' ? 'action-btn delete' : 'btn-primary'} onClick={onConfirm}>{confirmText}</button>
            </>
        }
    >
        <p>{message}</p>
    </Modal>
);

export const InputModal = ({ isOpen, onClose, onSubmit, title, label, placeholder, value, onChange, submitText = 'Submit' }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        footer={
            <>
                <button className="btn-secondary" onClick={onClose}>Cancel</button>
                <button className="btn-primary" onClick={onSubmit}>{submitText}</button>
            </>
        }
    >
        <div>
            <label className="form-label">{label}</label>
            <input
                type="text"
                className="form-input"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </Modal>
);
