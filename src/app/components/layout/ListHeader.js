import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  bold: {
    fontWeight: 500,
    color: 'var(--textSecondary)',
  },
});

const ListHeader = ({ listName, icon }) => {
  const classes = useStyles();
  return (
    <Box p={2} height="102px">
      <Box
        className="list-header__top-header"
        color="var(--textSecondary)"
        display="flex"
        alignItems="center"
      >
        <Box mr={2}>{icon}</Box>
        <Typography variant="h5" className={classes.bold}>{listName}</Typography>
      </Box>
    </Box>
  );
};

export default ListHeader;
