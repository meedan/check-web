import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage, FormattedNumber } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';


const MediaExpandedMetadata = ({ projectMedia }) => {
  const metrics = projectMedia.metrics ?
    projectMedia.metrics.data.fields[0].value_json.facebook : null;

  const { published_at } = projectMedia.media.metadata;

  if (!metrics && !published_at) { return null; }

  return (
    <Box marginTop={2} marginBottom={2}>
      <Grid container spacing={2}>
        { published_at ? (
          <Grid item xs={3}>
            <Typography variant="button" component="div">
              <FormattedMessage id="mediaExpandedMetadata.publishedOn" defaultMessage="Published on" />
            </Typography>
            <div><FormattedDate value={published_at} day="numeric" month="long" year="numeric" /></div>
          </Grid>
        ) : null }
        { metrics ? (
          <React.Fragment>
            <Grid item xs={2}>
              <Typography variant="button" component="div">
                <FormattedMessage id="mediaExpandedMetadata.shares" defaultMessage="FB Shares" />
              </Typography>
              <div><FormattedNumber value={metrics.share_count} /></div>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="button" component="div">
                <FormattedMessage id="mediaExpandedMetadata.reactions" defaultMessage="FB Reactions" />
              </Typography>
              <div><FormattedNumber value={metrics.reaction_count} /></div>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="button" component="div">
                <FormattedMessage id="mediaExpandedMetadata.comments" defaultMessage="FB Comments" />
              </Typography>
              <div>
                <FormattedNumber value={metrics.comment_count + metrics.comment_plugin_count} />
              </div>
            </Grid>
          </React.Fragment>
        ) : null }
      </Grid>
    </Box>
  );
};

MediaExpandedMetadata.propTypes = {
  projectMedia: PropTypes.shape({
    metrics: PropTypes.shape({
      data: PropTypes.shape({
        fields: PropTypes.arrayOf(PropTypes.shape({
          value_json: PropTypes.shape({
            facebook: PropTypes.shape({
              share_count: PropTypes.number.isRequired,
              reaction_count: PropTypes.number.isRequired,
              comment_count: PropTypes.number.isRequired,
              comment_plugin_count: PropTypes.number.isRequired,
            }).isRequired,
          }).isRequired,
        })).isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
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
