import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import SmoochBotPreviewFeed from './SmoochBotPreviewFeed';
import { labels, descriptions, placeholders } from './localizables';
import { inProgressYellow, completedGreen } from '../../../styles/js/shared';
import ParsedText from '../../ParsedText';
import timezones from '../../../timezones';

const useStyles = makeStyles(theme => ({
  spaced: {
    margin: theme.spacing(1),
    minWidth: 100,
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
    width: '100%',
  },
  content: {
    flexWrap: 'wrap',
  },
  icon: {
    color: '#979797',
  },
  load: {
    height: theme.spacing(4),
  },
  divider: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  schedule: {
    gap: '8px',
  },
  active: {
    background: completedGreen,
    color: 'white',
  },
  paused: {
    background: inProgressYellow,
    color: 'white',
  },
}));

const messages = defineMessages({
  rssPlaceholder: {
    id: 'smoochBotNewsletterEditor.rssPlaceholder',
    defaultMessage: 'Public URL that returns N articles in RSS format',
  },
});

const SmoochBotNewsletterEditor = ({
  intl,
  installationId,
  newsletter,
  newsletterInformation,
  onDelete,
  onChange,
}) => {
  const classes = useStyles();
  const [error, setError] = React.useState(null);
  const [url, setUrl] = React.useState(newsletter.smooch_newsletter_feed_url);
  const [count, setCount] = React.useState(newsletter.smooch_newsletter_number_of_articles);
  const [refetch, setRefetch] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [rssPreview, setRssPreview] = React.useState(null);

  const handleError = () => {
    setLoading(false);
    setError(<FormattedMessage id="smoochBotNewsletterEditor.error" defaultMessage="This URL does not seem to be a valid RSS feed" />);
  };

  const handleSuccess = (preview) => {
    setRssPreview(preview);
    setLoading(false);
  };

  const handleLoad = () => {
    if (newsletter.smooch_newsletter_feed_url) {
      setRefetch(refetch + 1);
      setError(null);
      setLoading(true);
      setUrl(newsletter.smooch_newsletter_feed_url.trim());
      setCount(newsletter.smooch_newsletter_number_of_articles);
    } else {
      handleError();
    }
  };

  const handleReset = () => {
    setRssPreview(null);
    setUrl('');
    onChange('smooch_newsletter_feed_url', '');
  };

  const handleDelete = () => {
    onDelete();
    handleReset();
  };

  return (
    <React.Fragment>
      <Box>
        <Typography variant="subtitle2" component="div">{labels.smooch_newsletter}</Typography>
        <Box p={1} mt={1} mb={1} className={newsletterInformation.paused ? classes.paused : classes.active}>
          <Typography component="div" variant="body2">
            { newsletterInformation.paused ?
              <FormattedMessage
                id="smoochBotNewsletterEditor.paused"
                defaultMessage="The newsletter is paused because the content has not been modified since the previous send-out"
              /> :
              <FormattedMessage
                id="smoochBotNewsletterEditor.active"
                defaultMessage="The newsletter will be sent to {count} users on {date}, {time}"
                values={{
                  count: newsletterInformation.subscribers_count,
                  date: newsletterInformation.next_date,
                  time: newsletterInformation.next_time,
                }}
              /> }
          </Typography>
        </Box>
        <Typography component="div" paragraph>{descriptions.smooch_newsletter}</Typography>
        <Typography variant="subtitle2" component="div" paragraph>
          <FormattedMessage
            id="smoochBotNewsletterEditor.note"
            defaultMessage="Please note: if the content is not changed between two scheduled sendouts, it will not be sent."
          />
        </Typography>
      </Box>
      <Box display="flex" justifyContent="flex-start" alignItems="center" mt={1} mb={1} className={classes.schedule}>
        <Typography>
          <FormattedMessage
            id="smoochBotNewsletterSendEvery"
            defaultMessage="Send every"
            description="After this string, there is a drop-down where the user can choose a day of the week"
          />
        </Typography>
        <Select
          value={newsletter.smooch_newsletter_day || 'monday'}
          variant="outlined"
          onChange={(event) => { onChange('smooch_newsletter_day', event.target.value); }}
          startAdornment={
            <InputAdornment position="start">
              <EventIcon />
            </InputAdornment>
          }
        >
          <MenuItem value="monday"><FormattedMessage id="smoochBotNewsletterMonday" defaultMessage="Monday" /></MenuItem>
          <MenuItem value="tuesday"><FormattedMessage id="smoochBotNewsletterTuesday" defaultMessage="Tuesday" /></MenuItem>
          <MenuItem value="wednesday"><FormattedMessage id="smoochBotNewsletterWednesday" defaultMessage="Wednesday" /></MenuItem>
          <MenuItem value="thursday"><FormattedMessage id="smoochBotNewsletterThursday" defaultMessage="Thursday" /></MenuItem>
          <MenuItem value="friday"><FormattedMessage id="smoochBotNewsletterFriday" defaultMessage="Friday" /></MenuItem>
          <MenuItem value="saturday"><FormattedMessage id="smoochBotNewsletterSaturday" defaultMessage="Saturday" /></MenuItem>
          <MenuItem value="sunday"><FormattedMessage id="smoochBotNewsletterSunday" defaultMessage="Sunday" /></MenuItem>
        </Select>
        <Typography>
          <FormattedMessage
            id="smoochBotNewsletterAt"
            defaultMessage="at"
            description="The context here is a time... for example, at 10am"
          />
        </Typography>
        <Select
          value={newsletter.smooch_newsletter_time || '10'}
          variant="outlined"
          onChange={(event) => { onChange('smooch_newsletter_time', event.target.value); }}
          startAdornment={
            <InputAdornment position="start">
              <ScheduleIcon />
            </InputAdornment>
          }
        >
          { [...Array(24).keys()].map(hour => <MenuItem value={`${hour}`}>{`${hour}:00`}</MenuItem>) }
        </Select>
        <Select
          value={newsletter.smooch_newsletter_timezone || 'UTC'}
          variant="outlined"
          onChange={(event) => { onChange('smooch_newsletter_timezone', event.target.value); }}
        >
          { Object.keys(timezones).sort().map(timezone => <MenuItem value={timezone}>{timezone}</MenuItem>) }
        </Select>
      </Box>
      <Box display="flex" flexWrap="wrap">
        <TextField
          key={Math.random().toString().substring(2, 10)}
          placeholder={intl.formatMessage(placeholders.smooch_newsletter)}
          defaultValue={newsletter.smooch_newsletter_body}
          onBlur={(event) => {
            onChange('smooch_newsletter_body', event.target.value);
          }}
          variant="outlined"
          rows={5}
          rowsMax={Infinity}
          multiline
          fullWidth
          InputProps={{
            className: classes.content,
            startAdornment: (
              <InputAdornment position="start" className={classes.rssPreview}>
                <Typography>
                  <FormattedMessage
                    id="smoochBotNewsletterEditor.templateHeader"
                    defaultMessage="You are receiving this message because you opted to receive our 'Weekly COVID-19 Facts' newsletter. Here is the most important information for the week of {date}:"
                  />
                </Typography>
                <Divider className={classes.divider} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end" className={classes.rssPreview}>
                { rssPreview ?
                  <React.Fragment>
                    <Divider className={classes.divider} />
                    <ParsedText text={rssPreview} block />
                  </React.Fragment> : null }
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
          id="smoochBotNewsletterEditor.rss"
          defaultMessage="Add content from RSS feed"
        />
      </Typography>
      <Box display="flex" justifyContent="space-between" alignItems={error ? 'baseline' : 'center'}>
        <TextField
          key={Math.random().toString().substring(2, 10)}
          label={
            <FormattedMessage
              id="smoochBotNewsletterEditor.url"
              defaultMessage="URL"
            />
          }
          placeholder={intl.formatMessage(messages.rssPlaceholder)}
          className={classes.spaced}
          defaultValue={newsletter.smooch_newsletter_feed_url}
          onBlur={(event) => {
            onChange('smooch_newsletter_feed_url', event.target.value.trim());
          }}
          error={Boolean(error)}
          helperText={error}
          variant="outlined"
          fullWidth
        />

        <TextField
          key={Math.random().toString().substring(2, 10)}
          type="number"
          label={
            <FormattedMessage
              id="smoochBotNewsletterEditor.numberOfArticles"
              defaultMessage="Number of articles to return"
            />
          }
          className={classes.spaced}
          defaultValue={newsletter.smooch_newsletter_number_of_articles || 0}
          onBlur={(event) => {
            onChange('smooch_newsletter_number_of_articles', parseInt(event.target.value, 10));
          }}
          inputProps={{ step: 1, min: 1, max: 50 }}
          variant="outlined"
          fullWidth
        />

        <Button variant="contained" color="primary" className={classes.spaced} onClick={handleLoad} disabled={loading}>
          <FormattedMessage
            id="smoochBotNewsletterEditor.load"
            defaultMessage="Load"
          />
        </Button>

        <IconButton onClick={handleReset}>
          <CancelOutlinedIcon className={classes.icon} />
        </IconButton>
      </Box>

      { onDelete ?
        <Box display="flex">
          <Button variant="outlined" onClick={handleDelete} className={classes.spaced}>
            <FormattedMessage
              id="smoochBotNewsletterEditor.delete"
              defaultMessage="Delete"
            />
          </Button>
        </Box> : null }
    </React.Fragment>
  );
};

SmoochBotNewsletterEditor.defaultProps = {
  onDelete: null,
};

SmoochBotNewsletterEditor.propTypes = {
  installationId: PropTypes.string.isRequired,
  newsletter: PropTypes.object.isRequired,
  newsletterInformation: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotNewsletterEditor);
