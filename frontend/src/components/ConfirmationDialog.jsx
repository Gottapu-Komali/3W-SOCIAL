import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

/**
 * ConfirmationDialog: A standardized, premium dialog for destructive actions.
 */
const ConfirmationDialog = ({ open, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel", loading = false }) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    bgcolor: '#1E293B',
                    color: '#fff',
                    borderRadius: '24px',
                    p: 1,
                    minWidth: 320,
                    backgroundImage: 'none'
                }
            }}
        >
            <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem' }}>{title}</DialogTitle>
            <DialogContent>
                <Typography sx={{ color: '#94A3B8', fontWeight: 500 }}>
                    {message}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={onCancel} sx={{ color: '#94A3B8', fontWeight: 700 }}>
                    {cancelText}
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    disabled={loading}
                    sx={{
                        borderRadius: '12px',
                        px: 3,
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)',
                        boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)'
                    }}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmationDialog;
