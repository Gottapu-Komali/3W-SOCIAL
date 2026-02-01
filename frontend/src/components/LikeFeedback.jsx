import React from 'react';
import { FavoriteRounded } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LikeFeedback: A specialized heart animation for interactions.
 * Used for double-taps and satisfying feedbacks.
 */
const LikeFeedback = ({ show }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 20 }}
                    animate={{ scale: 1.5, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 200,
                        pointerEvents: 'none'
                    }}
                >
                    <FavoriteRounded
                        sx={{
                            fontSize: 120,
                            color: '#fff',
                            filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8)) drop-shadow(0 4px 12px rgba(0,0,0,0.4))'
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LikeFeedback;
