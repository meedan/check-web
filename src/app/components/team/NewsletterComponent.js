import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import {
  Button,
} from '@material-ui/core';
import Select from '../cds/inputs/Select';
import LimitedTextField from '../layout/inputs/LimitedTextField';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import styles from './NewsletterComponent.module.css';
import UploadFile from '../UploadFile';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import LanguageRegistry from '../../LanguageRegistry';

const NewsletterComponent = ({ newsletters }) => {
  const languages = newsletters.map(item => item.node?.language);
  const [language, setLanguage] = React.useState(languages[0] || '');
  const newsletter = newsletters.find(item => item.node?.language === language).node;
  const {
    id,
    header_overlay_text,
    first_article,
    second_article,
    third_article,
    introduction,
    number_of_articles,
    footer,
  } = newsletter;

  // eslint-disable-next-line
  console.log('~~~',newsletter, id);

  const [saving, setSaving] = React.useState(false);
  const [overlayText, setOverlayText] = React.useState(header_overlay_text || '');
  const [introductionText, setIntroductionText] = React.useState(introduction || '');
  const [footerText, setFooterText] = React.useState(footer || '');
  const [articleNum, setArticleNum] = React.useState(number_of_articles || 0);
  const [articles, setArticles] = React.useState([first_article || '', second_article || '', third_article || '']);

  React.useEffect(() => {
    setOverlayText(header_overlay_text || '');
    setIntroductionText(introduction || '');
    setFooterText(footer || '');
    setArticleNum(number_of_articles || 0);
    setArticles([first_article || '', second_article || '', third_article || '']);
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

  const handleLanguageChange = (e) => {
    // eslint-disable-next-line
    console.log('~~~',e.target.value);
    setLanguage(e.target.value);
  };

  // TODO: still need to check permissions and make error state
  const handleSave = () => {
    // setError(false);
    // if (hasPermission) {
    setSaving(true);
    // eslint-disable-next-line
    console.log('~~~ SAVING', id);
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation NewsletterComponentUpdateMutation($input: UpdateTiplineNewsletterInput!) {
          updateTiplineNewsletter(input: $input) {
            tipline_newsletter {
              id
              introduction
              language
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
      `,
      variables: {
        input: {
          id,
          introduction: introductionText,
          language,
          // header_type,
          header_overlay_text: overlayText,
          first_article: articles[0],
          second_article: articles[1],
          third_article: articles[2],
          number_of_articles: articleNum,
          footer: footerText,
          send_every: 'monday',
          timezone: 'America/Los_Angeles',
          time: '10:00',
        },
      },
      onCompleted: (response, err) => {
        setSaving(false);
        if (err) {
          // setError(true);
        } else {
          // setError(false);
        }
      },
      onError: () => {
        setSaving(false);
        // setError(true);
      },
    });
  };

  return (
    <div className={styles.content}>
      <div className={styles['header-container']}>
        <p className="typography-h6">Newsletter</p>
        <Select className={styles.select} variant="outlined" onChange={handleLanguageChange}>
          { languages.map(languageCode => (
            <option value={languageCode}>
              {LanguageRegistry[languageCode].name} / {LanguageRegistry[languageCode].nativeName} ({languageCode})
            </option>
          ))}
        </Select>
        <div>
          <Button className="save-button" variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            <FormattedMessage id="newsletterComponent.save" defaultMessage="Save" description="Label for a button to save settings for the newsletter" />
          </Button>
        </div>
      </div>
      <div className={styles.newsletter}>
        <div className={styles.settings}>
          <div className="typography-subtitle2">
            Content
          </div>
          <Select label="Header" className={styles.select}>
            <option value="image">Image</option>
            <option value="none">None</option>
          </Select>
          <UploadFile
            type="image+video+audio"
          />
          <FormattedMessage
            id="newsletterComponent.overlayPlaceholder"
            defaultMessage="Add text on top of the image"
            description="Placeholder text for a field where the user inputs text that is to be rendered on top of an image (i.e., an overlay)"
          >
            { placeholder => (
              <LimitedTextField
                maxChars={160}
                value={overlayText}
                placeholder={placeholder}
                setValue={setOverlayText}
                label={<FormattedMessage
                  id="newsletterComponent.overlay"
                  defaultMessage="Text overlay"
                  description="Label for a field where the user inputs text that is to be rendered on top of an image (i.e., an overlay)"
                />}
              />
            )}
          </FormattedMessage>
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
  newsletters: PropTypes.array.isRequired,
};

export default NewsletterComponent;
