import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Alert from '../cds/alerts-and-prompts/Alert';
import MediaArticleCard from './MediaArticleCard';
import { getStatus } from '../../helpers';
import styles from './MediaArticlesDisplay.module.css';


const MediaArticlesDisplay = ({ projectMedia }) => {
  const explainerItems = projectMedia.explainer_items.edges.map(edge => edge.node);
  const hasExplainer = (explainerItems.length > 0);
  const factCheck = projectMedia.fact_check;
  const hasFactCheck = Boolean(factCheck);

  let currentStatus = null;
  if (hasFactCheck) {
    currentStatus = getStatus(projectMedia.team.verification_statuses, factCheck.rating);
  }

  return (
    <div className={styles.mediaArticlesDisplay}>
      { hasFactCheck ?
        <MediaArticleCard
          key={factCheck.id}
          variant="fact-check"
          title={factCheck.title || factCheck.claim_description.description}
          url={factCheck.url}
          languageCode={factCheck.language !== 'und' ? factCheck.language : null}
          date={factCheck.updated_at}
          statusColor={currentStatus ? currentStatus.style?.color : null}
          statusLabel={currentStatus ? currentStatus.label : null}
          publishedAt={factCheck.report_status === 'published' ? projectMedia.fact_check_published_on : null}
        />
        : null
      }
      { (hasFactCheck && hasExplainer) ?
        <Alert
          variant="info"
          contained
          title={
            <FormattedMessage
              id="mediaArticlesDisplay.readOnlyAlertTitle"
              defaultMessage="Fact-Check Added"
              description="Title of the alert message displayed on data points section of the edit feed page."
            />
          }
          content={
            <FormattedMessage
              id="mediaArticlesDisplay.readOnlyAlertContent"
              defaultMessage="When a fact-check article is added it will be prioritized to be sent to all media and requests that match this item."
              description="Description of the alert message displayed on data points section of the edit feed page."
            />
          }
        />
        : null
      }
      { explainerItems.filter(explainerItem => explainerItem !== null).map((explainerItem) => {
        // FIXME: Use explainerItem.id for removal

        const { explainer } = explainerItem;

        return (
          <div style={{ opacity: ((hasFactCheck && hasExplainer) ? 0.15 : 1) }} className={styles.explainerCard}>
            <MediaArticleCard
              key={explainerItem.id}
              variant="explainer"
              title={explainer.title || explainer.claim_description.description}
              url={explainer.url}
              languageCode={explainer.language !== 'und' ? explainer.language : null}
              date={explainer.updated_at}
            />
          </div>
        );
      })}
    </div>
  );
};

MediaArticlesDisplay.defaultProps = {
  fact_check_published_on: null,
};

MediaArticlesDisplay.propTypes = {
  fact_check_published_on: PropTypes.number,
  team: PropTypes.shape({
    verification_statuses: PropTypes.object.isRequired,
  }).isRequired,
  fact_check: PropTypes.shape({
    title: PropTypes.string,
    language: PropTypes.string,
    updated_at: PropTypes.number,
    url: PropTypes.string,
    report_status: PropTypes.string,
    rating: PropTypes.string,
    claim_description: PropTypes.shape({
      description: PropTypes.string,
    }).isRequired,
  }).isRequired,
  explainer_items: PropTypes.shape({
    edges: PropTypes.arrayOf(PropTypes.exact({
      node: PropTypes.shape({
        id: PropTypes.string,
        explainer: PropTypes.shape({
          language: PropTypes.string,
          title: PropTypes.string,
          url: PropTypes.string,
          updated_at: PropTypes.number,
        }),
      }),
    })),
  }).isRequired,
};

export default createFragmentContainer(MediaArticlesDisplay, graphql`
  fragment MediaArticlesDisplay_projectMedia on ProjectMedia {
    fact_check_published_on
    team {
      verification_statuses
    }
    fact_check {
      title
      language
      updated_at
      url
      report_status
      rating
      claim_description {
        description
      }
    }
    explainer_items(first: 100) {
      edges {
        node {
          id
          explainer {
            language
            title
            url
            updated_at
          }
        }
      }
    }
  }
`);
