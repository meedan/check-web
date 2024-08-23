/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import NewsletterNumberOfArticles from './NewsletterNumberOfArticles';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../../cds/inputs/TextField';
import TextArea from '../../cds/inputs/TextArea';
import LinkIcon from '../../../icons/link.svg';
import AutorenewIcon from '../../../icons/autorenew.svg';
import styles from './NewsletterComponent.module.css';

const NewsletterRssFeed = ({
  disabled,
  helpContent,
  numberOfArticles,
  onUpdateNumberOfArticles,
  onUpdateUrl,
  parentErrors,
  rssFeedUrl,
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
                defaultMessage="https://example.com/rss.xml"
                description="Placeholder text for newsletter RSS field"
                id="newsletterRssFeed.urlPlaceholder"
              >
                { placeholder => (
                  <TextField
                    className={styles['rss-feed-url-field']}
                    disabled={disabled}
                    error={invalid}
                    helpContent={
                      helpContent ||
                      (invalid &&
                        <span>
                          <FormattedMessage
                            defaultMessage="This URL is not a valid RSS URL."
                            description="Error message displayed under RSS feed URL field."
                            id="newsletterRssFeed.error"
                          />
                          {' '}
                          <a className={styles['error-label']} href="https://help.checkmedia.org/en/articles/8722205-newsletter" rel="noopener noreferrer" target="_blank">
                            <FormattedMessage
                              defaultMessage="Learn more."
                              description="This is the text of a link part of an error message related to tipline newsletter RSS. Example: 'This RSS URL is invalid. Learn more.'"
                              id="newsletterRssFeed.learnMore"
                            />
                          </a>
                        </span>
                      )
                    }
                    iconLeft={<LinkIcon />}
                    placeholder={placeholder}
                    value={localRssFeedUrl}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        onUpdateUrl(null);
                      } else {
                        handleLoad();
                      }
                    }}
                    onChange={(e) => {
                      let { value } = e.target;
                      if (value && !/^https?:\/\//.test(value)) {
                        value = `https://${value}`;
                      }
                      setLocalRssFeedUrl(value);
                    }}
                  />
                )}
              </FormattedMessage>
              { (rssFeedUrl && loading) ?
                <ButtonMain
                  className={styles['loading-rss-feed-button']}
                  disabled={disabled}
                  iconCenter={<AutorenewIcon />}
                  size="large"
                  theme="alert"
                  variant="contained"
                /> :
                <ButtonMain
                  buttonProps={{
                    id: 'media-similarity__add-button',
                  }}
                  disabled={!localRssFeedUrl || disabled}
                  label={<FormattedMessage defaultMessage="Load" description="Label for a button to load RSS feed entries" id="newsletterRssFeed.load" />}
                  size="large"
                  theme="info"
                  variant="contained"
                  onClick={handleLoad}
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
                    className={styles['two-spaced']}
                    disabled
                    error={!invalid && !articles[i] && !loading}
                    helpContent={!loading && !articles[i] && !invalid && <FormattedMessage defaultMessage="No article retrieved from RSS at this time" description="Message displayed when RSS feed has less entries than requested" id="newsletterRssFeed.noArticle" />}
                    key={articles[i]}
                    rows={4}
                    value={articles[i]}
                  />
                ))}
              </div> : null }
          </div>
        );
      }}
      variables={{
        numberOfArticles,
        rssFeedUrl,
        loadCount,
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
