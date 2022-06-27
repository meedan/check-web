/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';
import EventIcon from '@material-ui/icons/Event';
import ScheduleIcon from '@material-ui/icons/Schedule';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { getTimeZones } from '@vvo/tzdb';
import SmoochBotPreviewFeed from './SmoochBotPreviewFeed';
import { placeholders } from './localizables';
import { inProgressYellow, completedGreen, opaqueBlack38, opaqueBlack23 } from '../../../styles/js/shared';
import ParsedText from '../../ParsedText';

const timezones = getTimeZones({ includeUtc: true }).map((option) => {
  const offset = option.currentTimeOffsetInMinutes / 60;
  const fullOffset = option.currentTimeFormat.split(' ')[0];
  const sign = offset < 0 ? '' : '+';
  const newOption = {
    code: option.name,
    label: `${option.name} (GMT${sign}${offset})`,
    value: `${option.name} (GMT${fullOffset})`,
  };
  return newOption;
});

const useStyles = makeStyles(theme => ({
  title: {
    margin: theme.spacing(1.25),
  },
  rssSettings: {
    gap: `${theme.spacing(1)}px`,
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
  language,
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
  const [introduction, setIntroduction] = React.useState(newsletter.smooch_newsletter_introduction);

  const maxCharacters = 1024;
  let charactersCount = 0;
  if (introduction) {
    charactersCount += introduction.length;
  }
  if (rssPreview) {
    charactersCount += rssPreview.length;
  } else {
    charactersCount += body.length;
  }

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

  const handleChangeNumberOfBulletPoints = (value) => {
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

  const handleAddArticle = () => {
    handleChangeNumberOfBulletPoints(numberOfBulletPoints + 1);
  };

  return (
    <React.Fragment>
      <Box>
        { newsletterInformation ?
          <Box p={1} mt={1} mb={2} className={newsletterInformation.paused ? classes.paused : classes.active}>
            <Typography component="div" variant="body2">
              { newsletterInformation.paused ?
                <FormattedMessage
                  id="smoochBotNewsletterEditor.paused"
                  defaultMessage="To send your next newsletter, please add new content"
                /> :
                <FormattedMessage
                  id="smoochBotNewsletterEditor.active"
                  defaultMessage="The newsletter will be sent to {count} users on {dateTime}"
                  values={{
                    count: newsletterInformation.subscribers_count,
                    dateTime: newsletterInformation.next_date_and_time,
                  }}
                /> }
            </Typography>
          </Box> :
          <Box p={1} mt={1} mb={2} className={classes.none}>
            <Typography component="div" variant="body2">
              <FormattedMessage
                id="smoochBotNewsletterEditor.none"
                defaultMessage="Please complete the steps below to send a weekly newsletter"
              />
            </Typography>
          </Box> }
        <Typography>
          <strong>
            <FormattedMessage id="smoochBotNewsletterEditor.firstStepTitle" defaultMessage="Schedule" description="Tipline newsletter schedule (how often it should be sent)" />
          </strong>
        </Typography>
        <Typography>
          <FormattedMessage id="smoochBotNewsletterEditor.firstStepDescription" defaultMessage="Send the newsletter to all subscribed user every:" description="Explanation about tipline newsletter schedule... after that, there is a drop-down where the user can choose periodicity, day of week and time" />
        </Typography>
      </Box>
      <Box display="flex" justifyContent="flex-start" alignItems="center" mt={1} mb={1} className={classes.schedule}>
        <Select
          id="day-select"
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
          <MenuItem value="everyday"><FormattedMessage id="smoochBotNewsletterEditor.everyday" defaultMessage="Day" /></MenuItem>
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
          id="time-select"
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
          id="timezone-select"
          value={newsletter.smooch_newsletter_timezone || 'none'}
          variant="outlined"
          onChange={(event) => { onChange('smooch_newsletter_timezone', event.target.value); }}
        >
          <MenuItem value="none" disabled>
            <FormattedMessage
              id="smoochBotNewsletterEditor.timezone"
              defaultMessage="Time zone"
              description="Label for time zone selection"
            />
          </MenuItem>
          { timezones.map(timezone => <MenuItem key={timezone.code} value={timezone.value}>{timezone.label}</MenuItem>) }
        </Select>
      </Box>
      <Box mt={2}>
        <Typography>
          <strong>
            <FormattedMessage id="smoochBotNewsletterEditor.secondStep" defaultMessage="Content" description="Refers to tipline newsletter content" />
          </strong>
        </Typography>
        <Typography paragraph>
          <FormattedMessage id="smoochBotNewsletterEditor.secondStep2" defaultMessage="If the content is not changed between two scheduled sendouts, the newsletter will not be sent." description="Explanation about tipline newsletter delivery, in tipline newsletter settings page" />
        </Typography>
        <Typography variant="caption" paragraph style={charactersCount > maxCharacters ? { color: 'red' } : {}}>
          <FormattedMessage
            id="smoochBotNewsletterEditor.charsCounter"
            defaultMessage="{count}/{max} characters available"
            description="Counter that shows how many characters can still be input for the tipline content"
            values={{
              count: maxCharacters - charactersCount,
              max: maxCharacters,
            }}
          />
        </Typography>
      </Box>
      <Box>
        <TextField
          key={`newsletter-introduction-${installationId}-${language}`}
          label={
            <FormattedMessage
              id="smoochBotNewsletterEditor.introduction"
              defaultMessage="Introduction"
              description="Tipline newsletter introduction field label"
            />
          }
          defaultValue={introduction}
          placeholder={intl.formatMessage(placeholders.smooch_newsletter_introduction)}
          onBlur={(e) => { onChange('smooch_newsletter_introduction', e.target.value); }}
          onChange={(e) => { setIntroduction(e.target.value); }}
          variant="outlined"
          rows={3}
          rowsMax={Infinity}
          error={!introduction}
          multiline
          fullWidth
        />
        <Typography variant="caption">
          <FormattedMessage id="smoochBotNewsletterEditor.introPlaceholder1" description="Explanation about a placeholder that can be used in the tipline newsletter introduction, so {channel} here must not be translated." defaultMessage="Use the placeholder {channel} to insert the name of the messaging service automatically." />
          <br />
          <FormattedMessage id="smoochBotNewsletterEditor.introPlaceholder2" description="Explanation about a placeholder that can be used in the tipline newsletter introduction, so {date} here must not be translated." defaultMessage="Use the placeholder {date} to insert the date the newsletter is sent automatically." />
        </Typography>
      </Box>
      <Box mb={3} mt={2}>
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
              defaultMessage="Load content from RSS feed"
            />
          }
        />
      </Box>

      { !rssEnabled ?
        <Box>
          { [...Array(numberOfBulletPoints).keys()].map((value, i) => (
            <Box mb={1}>
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
          <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddArticle} color="primary">
            <FormattedMessage
              id="smoochBotNewsletterEditor.addArticle"
              defaultMessage="Add article"
              description="Button label to add a new article URL to the tipline newsletter content"
            />
          </Button>
        </Box> : null }

      { rssEnabled ?
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems={error ? 'baseline' : 'center'} className={classes.rssSettings}>
            <TextField
              key={Math.random().toString().substring(2, 10)}
              label={
                <FormattedMessage
                  id="smoochBotNewsletterEditor.url"
                  defaultMessage="URL"
                />
              }
              placeholder={intl.formatMessage(messages.rssPlaceholder)}
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
              defaultValue={newsletter.smooch_newsletter_number_of_articles || 0}
              onBlur={(event) => {
                onChange('smooch_newsletter_number_of_articles', parseInt(event.target.value, 10));
              }}
              inputProps={{ step: 1, min: 1, max: 50 }}
              variant="outlined"
              fullWidth
            />

            <Button variant="contained" color="primary" onClick={handleLoad} disabled={loading || !newsletter.smooch_newsletter_feed_url}>
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
                <Box display="flex" className={classes.bulletPoints} width={1}>
                  { rssPreview.split('\n\n').map(entry => (
                    <Box display="flex" alignItems="start" width={1} key={entry}>
                      <Typography className={classes.rssEntry}>
                        <ParsedText text={entry} />
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box> : null }
            { url && count && !error ?
              <SmoochBotPreviewFeed
                key={url}
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
  language: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  newsletterInformation: PropTypes.object,
};

export default injectIntl(SmoochBotNewsletterEditor);
