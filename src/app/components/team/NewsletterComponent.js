import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Select from '../cds/inputs/Select';
import LimitedTextField from '../layout/inputs/LimitedTextField';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import styles from './NewsletterComponent.module.css';
import UploadFile from '../UploadFile';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';

const NewsletterComponent = ({ newsletters, language }) => {
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

  const [overlayText, setOverlayText] = React.useState(header_overlay_text || '');
  const [introductionText, setIntroductionText] = React.useState(introduction || '');
  const [footerText, setFooterText] = React.useState(footer || '');
  const [articleNum, setArticleNum] = React.useState(number_of_articles || 0);
  const [articles, setArticles] = React.useState([first_article || '', second_article || '', third_article || '']);

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

  return (
    <div className={styles.container}>
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
  );
};

NewsletterComponent.propTypes = {
  newsletters: PropTypes.array.isRequired,
  language: PropTypes.string.isRequired,
};

export default NewsletterComponent;
