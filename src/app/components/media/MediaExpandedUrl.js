import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ExternalLink from '../ExternalLink';
import { checkBlue } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    '& a': {
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

export default MediaExpandedUrl;
