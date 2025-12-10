import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="relative rounded-lg shadow-xl max-w-md w-full mx-4 z-10" style={{
                background: 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4">{children}</div>
                {footer && <div className="flex gap-2 justify-end p-4 border-t">{footer}</div>}
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
                <Button variant="outline" onClick={onClose}>{cancelText}</Button>
                <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
            </>
        }
    >
        <p className="text-gray-600">{message}</p>
    </Modal>
);

export const InputModal = ({ isOpen, onClose, onSubmit, title, label, placeholder, value, onChange, submitText = 'Submit' }) => (
    <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        footer={
            <>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={onSubmit}>{submitText}</Button>
            </>
        }
    >
        <div className="space-y-2">
            <label className="text-sm font-medium">{label}</label>
            <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    </Modal>
);
