import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import SmoochBotPreviewFeed from './SmoochBotPreviewFeed';
import ParsedText from '../../ParsedText';

const useStyles = makeStyles(theme => ({
  spaced: {
    margin: theme.spacing(1),
  },
  title: {
    margin: theme.spacing(1.25),
  },
  rssPreview: {
    height: 'initial',
    display: 'initial',
    maxHeight: 'initial',
    alignItems: 'initial',
    whiteSpace: 'initial',
    margin: 0,
  },
  content: {
    flexWrap: 'wrap',
  },
}));

const messages = defineMessages({
  rssPlaceholder: {
    id: 'smoochBotResourceEditor.rssPlaceholder',
    defaultMessage: 'Public URL that returns N articles in RSS format',
  },
});

const SmoochBotResourceEditor = ({
  intl,
  installationId,
  resource,
  onDelete,
  onChange,
}) => {
  const classes = useStyles();
  const [error, setError] = React.useState(null);
  const [url, setUrl] = React.useState(resource.smooch_custom_resource_feed_url);
  const [count, setCount] = React.useState(resource.smooch_custom_resource_number_of_articles);
  const [refetch, setRefetch] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [rssPreview, setRssPreview] = React.useState(null);

  // Clear state when coming from another resource
  React.useEffect(() => {
    setError(null);
    setRssPreview(null);
    setLoading(false);
    setUrl(resource.smooch_custom_resource_feed_url);
    setCount(resource.smooch_custom_resource_number_of_articles);
  }, [resource.smooch_custom_resource_id]);

  const handleError = () => {
    setLoading(false);
    setError(<FormattedMessage id="smoochBotResourceEditor.error" defaultMessage="This URL does not seem to be a valid RSS feed" />);
  };

  const handleSuccess = (preview) => {
    setRssPreview(preview);
    setLoading(false);
  };

  const handleLoad = () => {
    if (resource.smooch_custom_resource_feed_url) {
      setRefetch(refetch + 1);
      setError(null);
      setLoading(true);
      setUrl(resource.smooch_custom_resource_feed_url);
      setCount(resource.smooch_custom_resource_number_of_articles);
    } else {
      handleError();
    }
  };

  let loadingMessage = null;
  if (loading) {
    loadingMessage = <FormattedMessage id="smoochBotResourceEditor.loading" defaultMessage="Loading articles from RSS feed..." />;
  }

  return (
    <React.Fragment>
      <Box display="flex" flexWrap="wrap">
        <TextField
          key={Math.random().toString().substring(2, 10)}
          label={
            <FormattedMessage
              id="smoochBotResourceEditor.title"
              defaultMessage="Bot resource title"
            />
          }
          className={classes.spaced}
          defaultValue={resource.smooch_custom_resource_title}
          onBlur={(event) => {
            onChange('smooch_custom_resource_title', event.target.value);
          }}
          variant="outlined"
          fullWidth
        />

        <TextField
          key={Math.random().toString().substring(2, 10)}
          label={
            <FormattedMessage
              id="smoochBotResourceEditor.content"
              defaultMessage="Bot resource content"
            />
          }
          className={classes.spaced}
          defaultValue={resource.smooch_custom_resource_body}
          onBlur={(event) => {
            onChange('smooch_custom_resource_body', event.target.value);
          }}
          variant="outlined"
          rows={3}
          multiline
          fullWidth
          InputProps={{
            className: classes.content,
            endAdornment: (
              <InputAdornment position="end" className={classes.rssPreview}>
                { rssPreview ? <ParsedText text={rssPreview} block /> : null }
              </InputAdornment>
            ),
          }}
        />
        { url && count && !error ?
          <SmoochBotPreviewFeed
            installationId={installationId}
            feedUrl={url}
            count={count}
            refetch={refetch}
            onError={handleError}
            onSuccess={handleSuccess}
          /> : null }
      </Box>

      <Typography variant="subtitle2" component="div" className={classes.title}>
        <FormattedMessage
          id="smoochBotResourceEditor.rss"
          defaultMessage="Add content from RSS feed"
        />
      </Typography>
      <Box display="flex" justifyContent="space-between">
        <TextField
          key={Math.random().toString().substring(2, 10)}
          label={
            <FormattedMessage
              id="smoochBotResourceEditor.url"
              defaultMessage="URL"
            />
          }
          placeholder={intl.formatMessage(messages.rssPlaceholder)}
          className={classes.spaced}
          defaultValue={resource.smooch_custom_resource_feed_url}
          onBlur={(event) => {
            onChange('smooch_custom_resource_feed_url', event.target.value);
          }}
          error={Boolean(error)}
          helperText={error || loadingMessage}
          variant="outlined"
          fullWidth
        />

        <TextField
          key={Math.random().toString().substring(2, 10)}
          type="number"
          label={
            <FormattedMessage
              id="smoochBotResourceEditor.numberOfArticles"
              defaultMessage="Number of articles to return"
            />
          }
          className={classes.spaced}
          defaultValue={resource.smooch_custom_resource_number_of_articles}
          onBlur={(event) => {
            onChange('smooch_custom_resource_number_of_articles', parseInt(event.target.value, 10));
          }}
          inputProps={{ step: 1, min: 1, max: 50 }}
          variant="outlined"
          fullWidth
        />
      </Box>

      <Box display="flex" flexDirection="row-reverse">
        <Button variant="contained" color="primary" className={classes.spaced} onClick={handleLoad} disabled={loading}>
          <FormattedMessage
            id="smoochBotResourceEditor.load"
            defaultMessage="Load"
          />
        </Button>

        <Button variant="outlined" onClick={onDelete} className={classes.spaced}>
          <FormattedMessage
            id="smoochBotResourceEditor.delete"
            defaultMessage="Delete"
          />
        </Button>
      </Box>
    </React.Fragment>
  );
};

SmoochBotResourceEditor.propTypes = {
  installationId: PropTypes.string.isRequired,
  resource: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotResourceEditor);
