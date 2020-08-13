import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { opaqueBlack38 } from '../../styles/js/shared.js';


const useStyles = makeStyles({
  container: {
    width: '100%',
    height: 0,
    paddingBottom: '56.25%',
    position: 'relative',
    backgroundColor: opaqueBlack38,
  },
  innerWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    '& div.aspect-ratio__overlay': {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      zIndex: 10,
    },
  },
});

const AspectRatioComponent = ({ children }) => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.innerWrapper}>
        {children}
      </div>
    </div>
  );
};

AspectRatioComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AspectRatioComponent;
