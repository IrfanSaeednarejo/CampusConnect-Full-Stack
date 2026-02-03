import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Button from './Button';

/**
 * Advanced Dialog Component built on top of Modal
 */
const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  type = 'default',
  loading = false,
  className = '',
  ...props
}) => {
  const getFooterContent = () => {
    switch (type) {
      case 'confirm':
        return (
          <>
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              {cancelText}
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </>
        );
      case 'alert':
        return (
          <Button variant="primary" onClick={onClose}>
            OK
          </Button>
        );
      default:
        return children;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={getFooterContent()}
      size="md"
      className={className}
      {...props}
    >
      {type === 'default' ? null : children}
    </Modal>
  );
};

Dialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func,
  type: PropTypes.oneOf(['default', 'confirm', 'alert']),
  loading: PropTypes.bool,
  className: PropTypes.string
};

export default Dialog;