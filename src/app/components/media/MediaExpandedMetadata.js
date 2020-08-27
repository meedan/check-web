import React from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';


const MediaExpandedMetadata = ({ projectMedia }) => {
  const metrics = projectMedia.metrics ?
    projectMedia.metrics.data.fields[0].value_json.facebook : null;

  const { published_at } = projectMedia.media.metadata;

  if (!metrics) { return null; }

  return (
    <Box marginTop={2} marginBottom={2}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Typography variant="button" component="div">
            <FormattedMessage id="mediaExpandedMetadata.publishedOn" defaultMessage="Published on" />
          </Typography>
          <div><FormattedDate value={published_at} day="numeric" month="long" year="numeric" /></div>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="button" component="div">
            <FormattedMessage id="mediaExpandedMetadata.shares" defaultMessage="Shares" />
          </Typography>
          <div>{metrics.share_count}</div>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="button" component="div">
            <FormattedMessage id="mediaExpandedMetadata.reactions" defaultMessage="Reactions" />
          </Typography>
          <div>{metrics.reaction_count}</div>
        </Grid>
        <Grid item xs={2}>
          <Typography variant="button" component="div">
            <FormattedMessage id="mediaExpandedMetadata.comments" defaultMessage="Comments" />
          </Typography>
          <div>{metrics.comment_count}</div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default createFragmentContainer(MediaExpandedMetadata, {
  projectMedia: graphql`
    fragment MediaExpandedMetadata_projectMedia on ProjectMedia {
      id
      dbid
      metrics: annotation(annotation_type: "metrics") {
        data
      }
      media {
        metadata
      }
    }
  `,
});
