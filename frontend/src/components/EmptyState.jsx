import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { AutoAwesomeOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';

const EmptyState = ({ title, message, actionText, onAction, icon }) => {
    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 12,
                px: 4,
                textAlign: 'center',
                bgcolor: 'rgba(255,255,255,0.02)',
                borderRadius: '32px',
                border: '1px dashed rgba(255,255,255,0.1)',
                mt: 4
            }}
        >
            <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '24px',
                bgcolor: 'rgba(129, 140, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                color: 'primary.main'
            }}>
                {icon || <AutoAwesomeOutlined sx={{ fontSize: 40 }} />}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: '#F8FAFC' }}>
                {title}
            </Typography>

            <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4, maxWidth: 400 }}>
                {message}
            </Typography>

            {actionText && onAction && (
                <Button
                    variant="contained"
                    onClick={onAction}
                    sx={{
                        borderRadius: '100px',
                        px: 4,
                        py: 1.5,
                        fontWeight: 800,
                        textTransform: 'none'
                    }}
                >
                    {actionText}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState;
