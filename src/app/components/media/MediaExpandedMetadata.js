import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

function shouldDisplayMetrics(metrics) {
  return metrics &&
    (metrics.share_count !== 0 ||
     metrics.reaction_count !== 0 ||
     metrics.comment_count !== 0 ||
     metrics.comment_plugin_count !== 0
    );
}

const useStyles = makeStyles(theme => ({
  metric: {
    margin: theme.spacing(1),
  },
}));

const MediaExpandedMetadata = ({ projectMedia }) => {
  const classes = useStyles();
  const metrics = projectMedia.media.metadata.metrics ?
    projectMedia.media.metadata.metrics.facebook : null;
  const { published_at } = projectMedia.media.metadata;

  if (!shouldDisplayMetrics(metrics) && !published_at) { return null; }

  let publishedOn = null;
  if (published_at) {
    const { locale } = (new window.Intl.NumberFormat()).resolvedOptions();
    publishedOn = new Date(published_at).toLocaleString(locale, { timeZoneName: 'short' });
  }

  return (
    <Box marginTop={2} marginBottom={2}>
      <Grid container spacing={2}>
        { publishedOn ? (
          <Grid item xs={3}>
            <Typography variant="button" component="div">
              <FormattedMessage id="mediaExpandedMetadata.publishedOn" defaultMessage="Published on" />
            </Typography>
            <div>{publishedOn}</div>
          </Grid>
        ) : null }
        { shouldDisplayMetrics(metrics) ? (
          <Box display="flex" width="100%" margin={1}>
            <div className={classes.metric}>
              <Typography variant="button" component="div">
                <FormattedMessage id="mediaExpandedMetadata.shares" defaultMessage="FB Shares" />
              </Typography>
              <div><FormattedNumber value={metrics.share_count} /></div>
            </div>
            <div className={classes.metric}>
              <Typography variant="button" component="div">
                <FormattedMessage id="mediaExpandedMetadata.reactions" defaultMessage="FB Reactions" />
              </Typography>
              <div><FormattedNumber value={metrics.reaction_count} /></div>
            </div>
            <div className={classes.metric}>
              <Typography variant="button" component="div">
                <FormattedMessage id="mediaExpandedMetadata.comments" defaultMessage="FB Comments" />
              </Typography>
              <div>
                <FormattedNumber value={metrics.comment_count + metrics.comment_plugin_count} />
              </div>
            </div>
          </Box>
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
    }),
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
