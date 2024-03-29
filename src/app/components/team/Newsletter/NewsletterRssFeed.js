import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './NewsletterComponent.module.css';
import TextField from '../../cds/inputs/TextField';
import TextArea from '../../cds/inputs/TextArea';
import NewsletterNumberOfArticles from './NewsletterNumberOfArticles';
import LinkIcon from '../../../icons/link.svg';
import AutorenewIcon from '../../../icons/autorenew.svg';

const NewsletterRssFeed = ({
  disabled,
  parentErrors,
  helpContent,
  numberOfArticles,
  onUpdateNumberOfArticles,
  rssFeedUrl,
  onUpdateUrl,
}) => {
  const [localRssFeedUrl, setLocalRssFeedUrl] = React.useState(rssFeedUrl);
  const [loadCount, setLoadCount] = React.useState(0); // Forces a re-fetch

  React.useEffect(() => {
    setLocalRssFeedUrl(rssFeedUrl);
  }, [rssFeedUrl]);

  const handleLoad = () => {
    if (localRssFeedUrl !== rssFeedUrl) {
      onUpdateUrl(localRssFeedUrl);
    } else {
      setLoadCount(loadCount + 1);
    }
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query NewsletterRssFeedQuery($rssFeedUrl: String!, $numberOfArticles: Int!) {
          root {
            current_team {
              smooch_bot: team_bot_installation(bot_identifier: "smooch") {
                smooch_bot_preview_rss_feed(rss_feed_url: $rssFeedUrl, number_of_articles: $numberOfArticles)
              }
            }
          }
        }
      `}
      variables={{
        numberOfArticles,
        rssFeedUrl,
        loadCount,
      }}
      render={({ error, props }) => {
        const invalid = (!!parentErrors?.rss_feed_url || (!!error && localRssFeedUrl && localRssFeedUrl === rssFeedUrl));
        const loading = (!props && !invalid && !error);
        let articles = [];
        if (!loading && !error && props) {
          const rssFeedContent = props.root.current_team.smooch_bot?.smooch_bot_preview_rss_feed;
          if (rssFeedContent) {
            articles = rssFeedContent.split('\n\n');
          }
        }
        return (
          <div className="newsletter-rss">
            <div className={styles['rss-feed-url']}>
              <FormattedMessage
                id="newsletterRssFeed.urlPlaceholder"
                defaultMessage="https://example.com/rss.xml"
                description="Placeholder text for newsletter RSS field"
              >
                { placeholder => (
                  <TextField
                    placeholder={placeholder}
                    disabled={disabled}
                    className={styles['rss-feed-url-field']}
                    onChange={(e) => {
                      let { value } = e.target;
                      if (value && !/^https?:\/\//.test(value)) {
                        value = `https://${value}`;
                      }
                      setLocalRssFeedUrl(value);
                    }}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        onUpdateUrl(null);
                      } else {
                        handleLoad();
                      }
                    }}
                    value={localRssFeedUrl}
                    iconLeft={<LinkIcon />}
                    error={invalid}
                    helpContent={
                      helpContent ||
                      (invalid &&
                        <span>
                          <FormattedMessage
                            id="newsletterRssFeed.error"
                            defaultMessage="This URL is not a valid RSS URL."
                            description="Error message displayed under RSS feed URL field."
                          />
                          {' '}
                          <a href="https://help.checkmedia.org/en/articles/8722205-newsletter" target="_blank" rel="noopener noreferrer" className={styles['error-label']}>
                            <FormattedMessage
                              id="newsletterRssFeed.learnMore"
                              defaultMessage="Learn more."
                              description="This is the text of a link part of an error message related to tipline newsletter RSS. Example: 'This RSS URL is invalid. Learn more.'"
                            />
                          </a>
                        </span>
                      )
                    }
                  />
                )}
              </FormattedMessage>
              { (rssFeedUrl && loading) ?
                <ButtonMain
                  iconCenter={<AutorenewIcon />}
                  className={styles['loading-rss-feed-button']}
                  variant="contained"
                  size="large"
                  theme="alert"
                  disabled={disabled}
                /> :
                <ButtonMain
                  label={<FormattedMessage id="newsletterRssFeed.load" defaultMessage="Load" description="Label for a button to load RSS feed entries" />}
                  variant="contained"
                  size="large"
                  theme="brand"
                  onClick={handleLoad}
                  disabled={!localRssFeedUrl || disabled}
                  buttonProps={{
                    id: 'media-similarity__add-button',
                  }}
                />}
            </div>
            <NewsletterNumberOfArticles
              disabled={disabled}
              number={numberOfArticles}
              options={[1, 2, 3]}
              onChangeNumber={onUpdateNumberOfArticles}
            />
            { rssFeedUrl ?
              <div key={rssFeedUrl}>
                {[...Array(numberOfArticles)].map((_, i) => (
                  <TextArea
                    disabled
                    key={articles[i]}
                    value={articles[i]}
                    className={styles['two-spaced']}
                    rows={4}
                    error={!invalid && !articles[i] && !loading}
                    helpContent={!loading && !articles[i] && !invalid && <FormattedMessage id="newsletterRssFeed.noArticle" defaultMessage="No article retrieved from RSS at this time" description="Message displayed when RSS feed has less entries than requested" />}
                  />
                ))}
              </div> : null }
          </div>
        );
      }}
    />
  );
};

NewsletterRssFeed.defaultProps = {
  disabled: false,
  numberOfArticles: 3,
  rssFeedUrl: null,
  onUpdateUrl: () => {},
  parentErrors: {},
};

NewsletterRssFeed.propTypes = {
  disabled: PropTypes.bool,
  numberOfArticles: PropTypes.number,
  onUpdateNumberOfArticles: PropTypes.func.isRequired,
  parentErrors: PropTypes.object,
  rssFeedUrl: PropTypes.string,
  onUpdateUrl: PropTypes.func,
};

export default NewsletterRssFeed;
