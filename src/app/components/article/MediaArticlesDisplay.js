import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Alert from '../cds/alerts-and-prompts/Alert';
import MediaArticleCard from './MediaArticleCard';
import ClaimFactCheckForm from './ClaimFactCheckForm';
import ExplainerForm from './ExplainerForm';
import { getStatus } from '../../helpers';
import styles from './MediaArticlesDisplay.module.css';

const MediaArticlesDisplay = ({ projectMedia }) => {
  const [articleToEdit, setArticleToEdit] = React.useState(null);

  const explainerItems = projectMedia.explainer_items.edges.map(edge => edge.node);
  const hasExplainer = (explainerItems.length > 0);
  const factCheck = projectMedia.fact_check;
  const hasFactCheck = Boolean(factCheck);
  let publishedAt = null; // FIXME: It would be better if it came from the backend
  if (hasFactCheck && factCheck.report_status === 'published') {
    publishedAt = projectMedia.fact_check_published_on;
  }

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
          publishedAt={publishedAt}
          id={factCheck.claim_description.id}
          onClick={() => { setArticleToEdit(factCheck); }}
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
              defaultMessage="Claim & Fact-Check Added"
              description="Title of the alert message displayed on data points section of the edit feed page."
            />
          }
          content={
            <FormattedMessage
              id="mediaArticlesDisplay.readOnlyAlertContent"
              defaultMessage="When a claim & fact-check article is added, it will be prioritized as the only article to be delivered as a response to requests that match this item."
              description="Description of the alert message displayed on data points section of the edit feed page."
            />
          }
        />
        : null
      }
      { explainerItems.filter(explainerItem => explainerItem !== null).map((explainerItem) => {
        const { explainer } = explainerItem;

        return (
          <div
            style={{ opacity: ((hasFactCheck && hasExplainer) ? 0.15 : 1) }}
            className={styles.explainerCard}
            key={explainerItem.id}
          >
            <MediaArticleCard
              variant="explainer"
              title={explainer.title}
              url={explainer.url}
              id={explainerItem.id}
              languageCode={explainer.language !== 'und' ? explainer.language : null}
              date={explainer.updated_at}
              onClick={() => { setArticleToEdit(explainer); }}
            />
          </div>
        );
      })}

      { articleToEdit && articleToEdit.nodeType === 'FactCheck' && (
        <ClaimFactCheckForm
          team={projectMedia.team}
          article={articleToEdit}
          onClose={() => { setArticleToEdit(false); }}
        />
      )}

      { articleToEdit && articleToEdit.nodeType === 'Explainer' && (
        <ExplainerForm
          team={projectMedia.team}
          article={articleToEdit}
          onClose={() => { setArticleToEdit(false); }}
        />
      )}
    </div>
  );
};

MediaArticlesDisplay.propTypes = {
  projectMedia: PropTypes.shape({
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
      nodeType: PropTypes.oneOf(['Explainer', 'FactCheck']),
      claim_description: PropTypes.shape({
        id: PropTypes.number,
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
            nodeType: PropTypes.oneOf(['Explainer', 'FactCheck']),
          }),
        }),
      })),
    }).isRequired,
  }).isRequired,
};

export default createFragmentContainer(MediaArticlesDisplay, graphql`
  fragment MediaArticlesDisplay_projectMedia on ProjectMedia {
    fact_check_published_on
    team {
      verification_statuses
      ...ClaimFactCheckForm_team
      ...ExplainerForm_team
    }
    fact_check {
      id
      title
      language
      updated_at
      url
      report_status
      rating
      claim_description {
        id
        description
      }
      nodeType: __typename
      ...ClaimFactCheckForm_article
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
            nodeType: __typename
            ...ExplainerForm_article
          }
        }
      }
    }
  }
`);
