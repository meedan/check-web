import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import Button from '@material-ui/core/Button';
import NewsletterHeader from './NewsletterHeader';
import NewsletterStatic from './NewsletterStatic';
import NewsletterRssFeed from './NewsletterRssFeed';
import NewsletterScheduler from './NewsletterScheduler';
import LimitedTextField from '../../layout/inputs/LimitedTextField';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import styles from './NewsletterComponent.module.css';
import LanguagePickerSelect from '../../cds/forms/LanguagePickerSelect';
import SettingsHeader from '../SettingsHeader';
import { safelyParseJSON } from '../../../helpers';
import { can } from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';

const NewsletterComponent = ({
  team,
  setFlashMessage,
}) => {
  const newsletters = team.tipline_newsletters?.edges;
  const { defaultLanguage } = team;
  const languages = safelyParseJSON(team.languages);
  const [language, setLanguage] = React.useState(defaultLanguage || languages[0] || 'en');
  const newsletter = newsletters.find(item => item.node.language === language)?.node || {};
  const {
    id,
    number_of_articles,
    introduction,
    header_type,
    header_overlay_text,
    first_article,
    second_article,
    third_article,
    footer,
    rss_feed_url,
    send_every,
    timezone: send_timezone,
    time: send_time,
    enabled: scheduled,
    subscribers_count,
    last_scheduled_at,
    last_scheduled_by,
  } = newsletter;

  const [saving, setSaving] = React.useState(false);
  const [overlayText, setOverlayText] = React.useState(header_overlay_text || '');
  const [introductionText, setIntroductionText] = React.useState(introduction || '');
  const [footerText, setFooterText] = React.useState(footer || '');
  const [articleNum, setArticleNum] = React.useState(number_of_articles || 0);
  const [articles, setArticles] = React.useState([first_article || '', second_article || '', third_article || '']);
  const [headerType, setHeaderType] = React.useState(header_type || 'none');
  const [rssFeedUrl, setRssFeedUrl] = React.useState(rss_feed_url || '');
  const [rssFeedEnabled, setRssFeedEnabled] = React.useState(Boolean(rssFeedUrl));
  const [sendEvery, setSendEvery] = React.useState(send_every || ['wednesday']);
  const [timezone, setTimezone] = React.useState(send_timezone || '');
  const [time, setTime] = React.useState(send_time || '9:00');

  const numberOfArticles = (rssFeedEnabled && articleNum === 0) ? 1 : articleNum;

  React.useEffect(() => {
    setOverlayText(header_overlay_text || '');
    setIntroductionText(introduction || '');
    setFooterText(footer || '');
    setArticleNum(number_of_articles || 0);
    setArticles([first_article || '', second_article || '', third_article || '']);
    setHeaderType(header_type || 'none');
    setRssFeedEnabled(Boolean(rss_feed_url));
    setRssFeedUrl(rss_feed_url || '');
    setSendEvery(send_every || ['wednesday']);
    setTimezone(send_timezone || '');
    setTime(send_time || '9:00');
  }, [language]);


  const handleLanguageChange = (value) => {
    const { languageCode } = value;
    setLanguage(languageCode);
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="newsletterComponent.error"
        defaultMessage="Could not save newsletter, please try again."
        description="Error message displayed when it's not possible to save a newsletter."
      />
    ), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="newsletterComponent.success"
        defaultMessage="Newsletter saved successfully."
        description="Success message displayed when a newsletter is saved."
      />
    ), 'success');
  };

  // FIXME: Is there a way to write the tipline_newsletter as a fragment and reuse it in the two mutation queries below?

  const updateMutation = graphql`
    mutation NewsletterComponentUpdateMutation($input: UpdateTiplineNewsletterInput!) {
      updateTiplineNewsletter(input: $input) {
        tipline_newsletter {
          id
          introduction
          language
          header_type
          header_overlay_text
          first_article
          second_article
          third_article
          rss_feed_url
          number_of_articles
          footer
          send_every
          timezone
          time
          enabled
          last_scheduled_at
          last_scheduled_by {
            name
          }
        }
      }
    }
  `;

  const createMutation = graphql`
    mutation NewsletterComponentCreateMutation($input: CreateTiplineNewsletterInput!) {
      createTiplineNewsletter(input: $input) {
        tipline_newsletter {
          id
          introduction
          language
          header_type
          header_overlay_text
          first_article
          second_article
          third_article
          rss_feed_url
          number_of_articles
          footer
          send_every
          timezone
          time
          enabled
          last_scheduled_at
          last_scheduled_by {
            name
          }
        }
      }
    }
  `;

  const handleSave = (scheduledOrPaused) => {
    setSaving(true);
    const mutation = (id ? updateMutation : createMutation);
    const input = {
      introduction: introductionText,
      language,
      header_type: headerType,
      header_overlay_text: overlayText,
      first_article: articles[0],
      second_article: articles[1],
      third_article: articles[2],
      rss_feed_url: rssFeedEnabled ? rssFeedUrl : null,
      number_of_articles: numberOfArticles,
      footer: footerText,
      send_every: sendEvery,
      timezone,
      time,
    };
    if (id) {
      input.id = id;
    }
    if (scheduledOrPaused === 'paused' || scheduledOrPaused === 'scheduled') {
      input.enabled = (scheduledOrPaused === 'scheduled');
    }
    commitMutation(Relay.Store, {
      mutation,
      variables: {
        input,
      },
      onCompleted: (response, err) => {
        if (err) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleUpdateSchedule = (field, value) => {
    switch (field) {
    case 'sendEvery':
      setSendEvery(value);
      break;
    case 'timezone':
      setTimezone(value);
      break;
    case 'time':
      setTime(value);
      break;
    case 'scheduled':
      if (value) {
        handleSave('scheduled');
      } else {
        handleSave('paused');
      }
      break;
    default:
      break;
    }
  };

  return (
    <div className={`newsletter-component ${styles.content}`}>
      <SettingsHeader
        title={
          <FormattedMessage
            id="newsletterComponent.title"
            defaultMessage="Newsletter"
            description="Title for newsletter settings page."
          />
        }
        extra={
          languages.length > 1 ?
            <LanguagePickerSelect
              selectedLanguage={language}
              onSubmit={handleLanguageChange}
              languages={languages}
              isDisabled={saving}
            /> : null
        }
        actionButton={
          <div>
            <Button className="save-button" variant="contained" color="primary" onClick={handleSave} disabled={scheduled || saving || !can(team.permissions, 'create TiplineNewsletter')}>
              <FormattedMessage id="newsletterComponent.save" defaultMessage="Save" description="Label for a button to save settings for the newsletter" />
            </Button>
          </div>
        }
        helpUrl="https://help.checkmedia.org/en/articles/123456" // FIXME: Add the real KB article URL here
      />
      <div className={styles.newsletter}>
        <div className={styles.settings}>
          <div className="typography-subtitle2">
            <FormattedMessage id="newsletterComponent.content" defaultMessage="Content" description="Title for newsletter content section on newsletter settings page" />
          </div>
          <NewsletterHeader
            className="newsletter-component-header"
            key={`newsletter-header-${language}`}
            disabled={scheduled}
            headerType={headerType}
            overlayText={overlayText}
            onUpdateField={(fieldName, value) => {
              if (fieldName === 'headerType') {
                setHeaderType(value);
              } else if (fieldName === 'overlayText') {
                setOverlayText(value);
              }
            }}
          />
          <LimitedTextArea
            maxChars={180}
            disabled={scheduled}
            value={introductionText}
            setValue={setIntroductionText}
            label={<FormattedMessage
              id="newsletterComponent.introduction"
              defaultMessage="Introduction"
              description="Label for a field where the user inputs text for an introduction to a newsletter"
            />}
          />
          <div className={styles['newsletter-body']}>
            <div className={styles.switcher}>
              <SwitchComponent
                key={`newsletter-rss-feed-enabled-${language}`}
                label={<FormattedMessage
                  id="newsletterComponent.rss"
                  defaultMessage="RSS"
                  description="Label for a switch where the user turns on RSS (Really Simple Syndication) capability - should not be translated unless there is a local idiom for 'RSS'"
                />}
                checked={rssFeedEnabled}
                disabled={scheduled}
                onChange={setRssFeedEnabled}
              />
            </div>
            <div className={`typography-body2 ${styles['text-secondary']}`}>
              <p>
                <FormattedMessage
                  id="newsletterComponent.rssFeed"
                  defaultMessage="Use an RSS feed to automatically load new content and send your newsletter on a recurring schedule. The newsletter will only be sent if new content is retrieved from the RSS."
                  description="Message on tipline newsletter settings page that explains how RSS feeds work there."
                />
              </p>
            </div>
            { rssFeedEnabled ?
              <NewsletterRssFeed
                disabled={scheduled}
                numberOfArticles={numberOfArticles}
                onUpdateNumberOfArticles={setArticleNum}
                rssFeedUrl={rssFeedUrl}
                onUpdateUrl={setRssFeedUrl}
              /> :
              <NewsletterStatic
                disabled={scheduled}
                numberOfArticles={numberOfArticles}
                onUpdateNumberOfArticles={setArticleNum}
                articles={articles}
                onUpdateArticles={setArticles}
              />
            }
            <LimitedTextField className="newsletter-component-footer" maxChars={60} value={footerText} setValue={setFooterText} disabled={scheduled} />
          </div>
          <NewsletterScheduler
            type={rssFeedEnabled ? 'rss' : 'static'}
            sendEvery={sendEvery}
            timezone={timezone}
            time={time}
            scheduled={scheduled}
            disabled={saving}
            subscribersCount={subscribers_count}
            lastScheduledAt={last_scheduled_at}
            lastScheduledBy={last_scheduled_by?.name}
            onUpdate={handleUpdateSchedule}
          />
        </div>
      </div>
    </div>
  );
};

NewsletterComponent.propTypes = {
  team: PropTypes.shape({
    defaultLanguage: PropTypes.string.isRequired,
    languages: PropTypes.string.isRequired,
    permissions: PropTypes.string.isRequired,
    tipline_newsletters: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          language: PropTypes.string.isRequired,
          number_of_articles: PropTypes.number.isRequired,
          introduction: PropTypes.string,
          header_type: PropTypes.string,
          header_overlay_text: PropTypes.string,
          first_article: PropTypes.string,
          second_article: PropTypes.string,
          third_article: PropTypes.string,
          rss_feed_url: PropTypes.string,
          footer: PropTypes.string,
        }),
      }).isRequired,
      ),
    }),
  }).isRequired,
};

// eslint-disable-next-line import/no-unused-modules
export { NewsletterComponent as NewsletterComponentTest };

export default createFragmentContainer(withSetFlashMessage(NewsletterComponent), graphql`
  fragment NewsletterComponent_team on Team {
    permissions
    id
    defaultLanguage: get_language
    languages: get_languages
    tipline_newsletters(first: 1000) {
      edges {
        node {
          id
          number_of_articles
          introduction
          header_type
          header_overlay_text
          first_article
          second_article
          third_article
          rss_feed_url
          send_every
          time
          timezone
          subscribers_count
          last_scheduled_at
          last_scheduled_by {
            name
          }
          enabled
          language
          footer
        }
      }
    }
  }
`);
