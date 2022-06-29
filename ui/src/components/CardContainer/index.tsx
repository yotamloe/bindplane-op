import { Paper } from '@mui/material';
import React from 'react';

import styles from './card-container.module.scss';

export const CardContainer: React.FC = ({ children }) => {
  return (
    <Paper classes={{ root: styles.root }} elevation={1}>
      {children}
    </Paper>
  );
};
