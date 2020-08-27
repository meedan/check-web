import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import ExternalLink from '../ExternalLink';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    '& a': {
      textDecoration: 'underline',
    },
  },
}));

const MediaExpandedUrl = ({ url }) => {
  const classes = useStyles();

  if (!url) return null;

  return (
    <div className={classes.root}>
      <ExternalLink url={url}>
        {url}
      </ExternalLink>
    </div>
  );
};

export default MediaExpandedUrl;
