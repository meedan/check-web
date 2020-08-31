import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExternalLink from '../ExternalLink';
import { checkBlue } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& a': {
      /*
        TODO define with Pierre if all links are to be blue
        and style accordingly on the app theme instead of locally
      */
      color: checkBlue,
      textDecoration: 'underline',
    },
  },
}));

const MediaExpandedUrl = ({ url }) => {
  const classes = useStyles();

  if (!url) return null;

  return (
    <div className={classes.root}>
      <Typography variant="body2">
        <ExternalLink url={url}>
          {url}
        </ExternalLink>
      </Typography>
    </div>
  );
};

MediaExpandedUrl.propTypes = {
  url: PropTypes.string.isRequired,
};

export default MediaExpandedUrl;
