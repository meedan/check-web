import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import {
  Button,
} from '@material-ui/core';
import NewsletterHeader from './NewsletterHeader';
import LimitedTextField from '../../layout/inputs/LimitedTextField';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import styles from './NewsletterComponent.module.css';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import LanguagePickerSelect from '../../cds/forms/LanguagePickerSelect';
import SettingsHeader from '../SettingsHeader';
import { safelyParseJSON } from '../../../helpers';
import { can } from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';

const NewsletterComponent = ({
  team,
  newsletters,
  setFlashMessage,
}) => {
  const { defaultLanguage } = team;
  const languages = safelyParseJSON(team.languages);
  const [language, setLanguage] = React.useState(defaultLanguage || languages[0] || 'en');
  const newsletter = newsletters.find(item => item.language === language) || {};
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
    // send_every,
    // rss_feed_url,
    // timezone,
    // time,
    // enabled,
  } = newsletter;

  const [saving, setSaving] = React.useState(false);
  const [overlayText, setOverlayText] = React.useState(header_overlay_text || '');
  const [introductionText, setIntroductionText] = React.useState(introduction || '');
  const [footerText, setFooterText] = React.useState(footer || '');
  const [articleNum, setArticleNum] = React.useState(number_of_articles || 0);
  const [articles, setArticles] = React.useState([first_article || '', second_article || '', third_article || '']);
  const [headerType, setHeaderType] = React.useState(header_type || 'none');

  React.useEffect(() => {
    setOverlayText(header_overlay_text || '');
    setIntroductionText(introduction || '');
    setFooterText(footer || '');
    setArticleNum(number_of_articles || 0);
    setArticles([first_article || '', second_article || '', third_article || '']);
    setHeaderType(header_type || 'none');
  }, [language]);


  const getMaxChars = () => {
    let maxChars = 694;
    if (articleNum === 2) {
      maxChars = 345;
    } else if (articleNum === 3) {
      maxChars = 230;
    }
    return maxChars;
  };

  const handleArticleNumChange = (e, newValue) => {
    setArticleNum(newValue);
  };

  const handleArticleUpdate = (newValue, index) => {
    setArticles(prev => prev.map((el, i) => (i !== index ? el : newValue)));
  };

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
          number_of_articles
          footer
          send_every
          timezone
          time
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
          number_of_articles
          footer
          send_every
          timezone
          time
        }
      }
    }
  `;

  const handleSave = () => {
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
      number_of_articles: articleNum,
      footer: footerText,
      send_every: 'monday', // FIXME: Read this value from the scheduler component
      timezone: 'America/Los_Angeles', // FIXME: Read this value from the scheduler component
      time: '10:00', // FIXME: Read this value from the scheduler component
    };
    if (id) {
      input.id = id;
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

  return (
    <div className={styles.content}>
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
            <Button className="save-button" variant="contained" color="primary" onClick={handleSave} disabled={saving || !can(team.permissions, 'create TiplineNewsletter')}>
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
            key={`newsletter-header-${language}`}
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
            value={introductionText}
            setValue={setIntroductionText}
            label={<FormattedMessage
              id="newsletterComponent.introduction"
              defaultMessage="Introduction"
              description="Label for a field where the user inputs text for an introduction to a newsletter"
            />}
          />
          <div className={styles['newsletter-body']}>
            <div>(RSS Switch goes here)</div>
            <div className={`typography-body2 ${styles['text-secondary']}`}>
              Use an RSS feed to automatically load new content and send your newsletter on a recurring schedule. The newsletter will only be sent if new content is retrieved from the RSS.
            </div>
            <ToggleButtonGroup
              label={
                <FormattedMessage
                  id="newsletterComponent.numberOfArticles"
                  defaultMessage="Number of articles"
                  description="Label on an input where the user selects the number of articles to display in their newsletter"
                />
              }
              variant="contained"
              value={articleNum}
              onChange={handleArticleNumChange}
              exclusive
            >
              <ToggleButton value={0}>
                0
              </ToggleButton>
              <ToggleButton value={1}>
                1
              </ToggleButton>
              <ToggleButton value={2}>
                2
              </ToggleButton>
              <ToggleButton value={3}>
                3
              </ToggleButton>
            </ToggleButtonGroup>
            {[...Array(articleNum)].map((x, i) => (
              <FormattedMessage
                id="newsletterComponent.articlePlaceholder"
                defaultMessage="Add text or link"
                description="Placeholder text for a field where the user is supposed to enter text for an article, or a link to an article"
              >
                { placeholder => (
                  <LimitedTextArea
                    key={x}
                    maxChars={getMaxChars()}
                    value={articles[i]}
                    onChange={e => handleArticleUpdate(e.target.value, i)}
                    placeholder={placeholder}
                  />
                )}
              </FormattedMessage>
            ))}
          </div>
          <LimitedTextField maxChars={60} value={footerText} setValue={setFooterText} />
        </div>
      </div>
    </div>
  );
};

NewsletterComponent.propTypes = {
  team: PropTypes.shape({
    defaultLanguage: PropTypes.string.isRequired,
    languages: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
    permissions: PropTypes.string.isRequired,
  }).isRequired,
  newsletters: PropTypes.array.isRequired, // TODO: Declare the expected structure for each newsletter
};

export default withSetFlashMessage(NewsletterComponent);
