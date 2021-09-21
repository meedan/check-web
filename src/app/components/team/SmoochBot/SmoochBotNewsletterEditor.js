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
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import SmoochBotPreviewFeed from './SmoochBotPreviewFeed';
import { placeholders } from './localizables';
import { inProgressYellow, completedGreen, opaqueBlack38, opaqueBlack23 } from '../../../styles/js/shared';
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
  none: {
    background: '#F6F6F6',
    color: 'black',
  },
  bullet: {
    color: opaqueBlack38,
    fontSize: theme.spacing(2),
    marginRight: theme.spacing(1),
    height: theme.spacing(7),
    alignItems: 'center',
    display: 'flex',
  },
  bulletRss: {
    color: opaqueBlack38,
    fontSize: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  textField: {
    border: `1px solid ${opaqueBlack23}`,
    borderRadius: theme.spacing(0.5),
  },
  bulletPoints: {
    gap: `${theme.spacing(1)}px`,
    padding: theme.spacing(1),
    flexWrap: 'wrap',
  },
  rssEntry: {
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    wordBreak: 'break-word',
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
  onChange,
}) => {
  const classes = useStyles();
  const [error, setError] = React.useState(null);
  const [url, setUrl] = React.useState(newsletter.smooch_newsletter_feed_url);
  const [count, setCount] = React.useState(newsletter.smooch_newsletter_number_of_articles);
  const [refetch, setRefetch] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [rssPreview, setRssPreview] = React.useState(null);
  const [rssEnabled, setRssEnabled] = React.useState(Boolean(url));
  const body = newsletter.smooch_newsletter_body || '';
  const bulletPoints = body.split(/\n+/);
  const [numberOfBulletPoints, setNumberOfBulletPoints] = React.useState(bulletPoints.length || 1);

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

  const handleChangeBulletPoint = (i, text) => {
    if (!bulletPoints[i] || bulletPoints[i] !== text) {
      const newBulletPoints = bulletPoints.slice();
      newBulletPoints[i] = text.replaceAll('\n', ' ');
      const newBody = newBulletPoints.join('\n\n');
      onChange('smooch_newsletter_body', newBody);
    }
  };

  const handleChangeNumberOfBulletPoints = (event) => {
    const value = parseInt(event.target.value, 10);
    const newBody = [];
    [...Array(3).keys()].forEach((i) => {
      if (i < value) {
        newBody.push(bulletPoints[i]);
      }
    });
    onChange('smooch_newsletter_body', newBody.join('\n\n'));
    setNumberOfBulletPoints(value);
  };

  const handleToggleRss = (event) => {
    const enabled = event.target.checked;
    setRssEnabled(enabled);
    if (enabled) {
      onChange('smooch_newsletter_body', '');
    } else {
      handleReset();
    }
  };

  return (
    <React.Fragment>
      <Box>
        <Typography variant="subtitle2" component="div">
          <FormattedMessage
            id="smoochBotNewsletterEditor.title"
            defaultMessage="Compose your newsletter"
          />
        </Typography>
        { newsletterInformation ?
          <Box p={1} mt={1} mb={1} className={newsletterInformation.paused ? classes.paused : classes.active}>
            <Typography component="div" variant="body2">
              { newsletterInformation.paused ?
                <FormattedMessage
                  id="smoochBotNewsletterEditor.paused"
                  defaultMessage="To send your next newsletter, please add new content"
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
          </Box> :
          <Box p={1} mt={1} mb={1} className={classes.none}>
            <Typography component="div" variant="body2">
              <FormattedMessage
                id="smoochBotNewsletterEditor.none"
                defaultMessage="Please complete the steps below to send a weekly newsletter"
              />
            </Typography>
          </Box> }
        <Typography component="div" paragraph>
          <strong>
            <FormattedMessage id="smoochBotNewsletterEditor.firstStep" defaultMessage="1. Select a day and time of the week" description="This is an item in a bullet list of steps, this is the first step" />
          </strong>
        </Typography>
      </Box>
      <Box display="flex" justifyContent="flex-start" alignItems="center" mt={1} mb={1} className={classes.schedule}>
        <Typography>
          <FormattedMessage
            id="smoochBotNewsletterEditor.sendEvery"
            defaultMessage="Send every"
            description="After this string, there is a drop-down where the user can choose a day of the week"
          />
        </Typography>
        <Select
          value={newsletter.smooch_newsletter_day || 'none'}
          variant="outlined"
          onChange={(event) => { onChange('smooch_newsletter_day', event.target.value); }}
          startAdornment={
            <InputAdornment position="start">
              <EventIcon />
            </InputAdornment>
          }
        >
          <MenuItem value="none" disabled><FormattedMessage id="smoochBotNewsletterEditor.day" defaultMessage="Day of week" /></MenuItem>
          <MenuItem value="monday"><FormattedMessage id="smoochBotNewsletterEditor.monday" defaultMessage="Monday" /></MenuItem>
          <MenuItem value="tuesday"><FormattedMessage id="smoochBotNewsletterEditor.tuesday" defaultMessage="Tuesday" /></MenuItem>
          <MenuItem value="wednesday"><FormattedMessage id="smoochBotNewsletterEditor.wednesday" defaultMessage="Wednesday" /></MenuItem>
          <MenuItem value="thursday"><FormattedMessage id="smoochBotNewsletterEditor.thursday" defaultMessage="Thursday" /></MenuItem>
          <MenuItem value="friday"><FormattedMessage id="smoochBotNewsletterEditor.friday" defaultMessage="Friday" /></MenuItem>
          <MenuItem value="saturday"><FormattedMessage id="smoochBotNewsletterEditor.saturday" defaultMessage="Saturday" /></MenuItem>
          <MenuItem value="sunday"><FormattedMessage id="smoochBotNewsletterEditor.sunday" defaultMessage="Sunday" /></MenuItem>
        </Select>
        <Typography>
          <FormattedMessage
            id="smoochBotNewsletterAt"
            defaultMessage="at"
            description="The context here is a time... for example, at 10am"
          />
        </Typography>
        <Select
          value={newsletter.smooch_newsletter_time || 'none'}
          variant="outlined"
          onChange={(event) => { onChange('smooch_newsletter_time', event.target.value); }}
          startAdornment={
            <InputAdornment position="start">
              <ScheduleIcon />
            </InputAdornment>
          }
        >
          <MenuItem value="none" disabled><FormattedMessage id="smoochBotNewsletterEditor.time" defaultMessage="Time" /></MenuItem>
          { [...Array(24).keys()].map(hour => <MenuItem key={hour} value={`${hour}`}>{`${hour}:00`}</MenuItem>) }
        </Select>
        <Select
          value={newsletter.smooch_newsletter_timezone || 'none'}
          variant="outlined"
          onChange={(event) => { onChange('smooch_newsletter_timezone', event.target.value); }}
        >
          <MenuItem value="none" disabled><FormattedMessage id="smoochBotNewsletterEditor.timezone" defaultMessage="Time zone" /></MenuItem>
          { Object.keys(timezones).sort().map(timezone => <MenuItem key={timezone} value={timezone}>{timezone}</MenuItem>) }
        </Select>
      </Box>
      <Box>
        <Typography component="div" paragraph>
          <strong>
            <FormattedMessage id="smoochBotNewsletterEditor.secondStep" defaultMessage="2. Add content manually, or via RSS Feed." description="This is an item in a bullet list of steps, this is the second step" />
          </strong>
          {' '}
          <FormattedMessage id="smoochBotNewsletterEditor.secondStep2" defaultMessage="If the content is not changed between two scheduled sendouts, it will not be sent." />
        </Typography>
      </Box>
      <Box mb={3}>
        <FormControlLabel
          control={
            <Switch
              checked={rssEnabled}
              onChange={handleToggleRss}
            />
          }
          label={
            <FormattedMessage
              id="smoochBotNewsletterEditor.toggleRss"
              defaultMessage="Automatically update content using an RSS feed"
            />
          }
        />
      </Box>

      { !rssEnabled ?
        <Box>
          <TextField
            key={Math.random().toString().substring(2, 10)}
            type="number"
            label={
              <FormattedMessage
                id="smoochBotNewsletterEditor.numberOfBulletPoints"
                defaultMessage="Number of bullet points"
              />
            }
            defaultValue={numberOfBulletPoints}
            onChange={handleChangeNumberOfBulletPoints}
            inputProps={{ step: 1, min: 1, max: 3 }}
            variant="outlined"
            fullWidth
          />
          <Box mt={1} mb={1} className={classes.textField}>
            <Box p={1}>
              <Typography>
                <FormattedMessage
                  id="smoochBotNewsletterEditor.templateHeaderNoRss"
                  defaultMessage="You are receiving this message because you opted to receive our 'Weekly COVID-19 Facts' Newsletter. Here is the most important information for the week of {date}: "
                  values={{
                    date: new Date().toLocaleString(intl.locale, { month: 'short', day: '2-digit' }),
                  }}
                />
              </Typography>
            </Box>
            <Divider />
            <Box display="flex" className={classes.bulletPoints} width={1}>
              { [...Array(numberOfBulletPoints).keys()].map((value, i) => (
                <Box display="flex" alignItems="start" width={1} key={value}>
                  { numberOfBulletPoints > 1 ?
                    <Box className={classes.bullet}>
                      <span>●</span>
                    </Box> : null }
                  <TextField
                    key={Math.random().toString().substring(2, 10)}
                    placeholder={intl.formatMessage(placeholders.smooch_newsletter_bullet_point)}
                    variant="outlined"
                    defaultValue={bulletPoints[i]}
                    onBlur={(event) => { handleChangeBulletPoint(i, event.target.value); }}
                    rows="1"
                    rowsMax={Infinity}
                    multiline
                    fullWidth
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box> : null }

      { rssEnabled ?
        <Box>
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
                let feedUrl = event.target.value.trim();
                if (feedUrl !== '' && !/^https?:\/\//.test(feedUrl)) {
                  feedUrl = `https://${feedUrl}`;
                }
                onChange('smooch_newsletter_feed_url', feedUrl);
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
              inputProps={{ step: 1, min: 1, max: 3 }}
              variant="outlined"
              fullWidth
            />

            <Button variant="contained" color="primary" className={classes.spaced} onClick={handleLoad} disabled={loading || !newsletter.smooch_newsletter_feed_url}>
              <FormattedMessage
                id="smoochBotNewsletterEditor.load"
                defaultMessage="Load"
              />
            </Button>

            <IconButton onClick={handleReset}>
              <CancelOutlinedIcon className={classes.icon} />
            </IconButton>
          </Box>
          <Box display="flex" flexWrap="wrap">
            { rssPreview ?
              <Box mt={1} mb={1} className={classes.textField}>
                <Box p={1}>
                  <Typography>
                    <FormattedMessage
                      id="smoochBotNewsletterEditor.templateHeaderNoRss"
                      defaultMessage="You are receiving this message because you opted to receive our 'Weekly COVID-19 Facts' Newsletter. Here is the most important information for the week of {date}: "
                      values={{
                        date: new Date().toLocaleString(intl.locale, { month: 'short', day: '2-digit' }),
                      }}
                    />
                  </Typography>
                </Box>
                <Divider />
                <Box display="flex" className={classes.bulletPoints} width={1}>
                  { rssPreview.split('\n\n').map(entry => (
                    <Box display="flex" alignItems="start" width={1} key={entry}>
                      { rssPreview.split('\n\n').length > 1 ?
                        <Box className={classes.bulletRss}>
                          <span>●</span>
                        </Box> : null }
                      <Typography className={classes.rssEntry}>
                        <ParsedText text={entry} />
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box> : null }
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
        </Box> : null }
    </React.Fragment>
  );
};

SmoochBotNewsletterEditor.defaultProps = {
  newsletterInformation: null,
};

SmoochBotNewsletterEditor.propTypes = {
  installationId: PropTypes.string.isRequired,
  newsletter: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  newsletterInformation: PropTypes.object,
};

export default injectIntl(SmoochBotNewsletterEditor);
