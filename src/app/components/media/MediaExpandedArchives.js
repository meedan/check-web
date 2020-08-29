import React from 'react';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ExternalLink from '../ExternalLink';
import { checkBlue } from '../../styles/js/shared';

const useStyles = makeStyles({
  url: {
    '& a': {
      /*
        TODO define with Pierre if all links are to be blue
        and style accordingly on the app theme instead of locally
      */
      color: checkBlue,
      textDecoration: 'underline',
    },
  },
});

// TODO Replace with Pender-supplied names.
const archivers = {
  archive_is_response: 'Archive.is',
  archive_org_response: 'Archive.org',
  perma_cc_response: 'Perma.cc',
  video_archiver_response: 'Video Archiver',
};

const MediaExpandedArchives = ({ projectMedia }) => {
  const classes = useStyles();
  const activeArchivers = projectMedia.archiver ?
    projectMedia.archiver.data.fields
      .filter(a => !a.value_json.error && a.value_json.location) : [];

  if (!activeArchivers.length) { return null; }

  return (
    <div className="media__archives">
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <Typography variant="subtitle2">
            <FormattedMessage id="mediaExpandedArchives.archives" defaultMessage="Archives:" />
          </Typography>
        </Grid>
        { activeArchivers.map(f => (
          <Grid item xs={2}>
            <Typography className={classes.url} variant="body2">
              <ExternalLink url={f.value_json.location}>
                {archivers[f.field_name]}
              </ExternalLink>
            </Typography>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default createFragmentContainer(MediaExpandedArchives, {
  projectMedia: graphql`
    fragment MediaExpandedArchives_projectMedia on ProjectMedia {
      id
      dbid
      archiver: annotation(annotation_type: "archiver") {
        data
      }
    }
  `,
});
