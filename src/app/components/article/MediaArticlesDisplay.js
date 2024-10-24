import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import cx from 'classnames/bind';
import MediaArticleCard from './MediaArticleCard';
import ClaimFactCheckForm from './ClaimFactCheckForm';
import ExplainerForm from './ExplainerForm';
import { getStatus, isFactCheckValueBlank } from '../../helpers';
import Alert from '../cds/alerts-and-prompts/Alert';
import styles from './MediaArticlesDisplay.module.css';

const MediaArticlesDisplay = ({ onUpdate, projectMedia }) => {
  const [articleToEdit, setArticleToEdit] = React.useState(null);

  const explainerItems = projectMedia.explainer_items.edges.map(edge => edge.node);
  const hasExplainer = (explainerItems.length > 0);
  const factCheck = projectMedia.fact_check;
  const hasFactCheck = (factCheck && factCheck.id);
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
      <div className="typography-subtitle2">
        <FormattedMessage
          defaultMessage="Articles Delivered to Tipline Requests:"
          description="Title for the list of articles being delivered to users of the tipline for this cluster of media"
          id="mediaArticlesDisplay.listTitle"
        />
      </div>
      { hasFactCheck ?
        <MediaArticleCard
          claimSummary={factCheck.claim_description.context}
          claimTitle={factCheck.claim_description.description}
          date={new Date(factCheck.updated_at * 1000)}
          id={factCheck.claim_description.id}
          key={factCheck.id}
          languageCode={factCheck.language !== 'und' ? factCheck.language : null}
          publishedAt={publishedAt}
          removeDisabled={projectMedia.type === 'Blank'}
          statusColor={currentStatus ? currentStatus.style?.color : null}
          statusLabel={currentStatus ? currentStatus.label : null}
          summary={isFactCheckValueBlank(factCheck.summary) ? null : factCheck.summary}
          title={isFactCheckValueBlank(factCheck.title) ? null : factCheck.title}
          url={factCheck.url}
          variant="fact-check"
          onClick={() => { setArticleToEdit(factCheck); }}
          onRemove={onUpdate}
        />
        : null
      }
      { (hasFactCheck && hasExplainer) ?
        <Alert
          contained
          content={
            <FormattedMessage
              defaultMessage="When a claim & fact-check article is added, it will be prioritized as the only article to be delivered as a response to requests that match this item."
              description="Description of the alert message displayed on data points section of the edit feed page."
              id="mediaArticlesDisplay.readOnlyAlertContent"
            />
          }
          title={
            <FormattedMessage
              defaultMessage="Claim & Fact-Check Added"
              description="Title of the alert message displayed on data points section of the edit feed page."
              id="mediaArticlesDisplay.readOnlyAlertTitle"
            />
          }
          variant="info"
        />
        : null
      }
      { explainerItems.filter(explainerItem => explainerItem !== null).map((explainerItem) => {
        const { explainer } = explainerItem;

        return (
          <div
            className={cx(
              [styles.explainerCard],
              {
                [styles.explainerCardDimmed]: hasFactCheck && hasExplainer,
              })
            }
            key={explainerItem.id}
          >
            <MediaArticleCard
              date={new Date(explainer.updated_at * 1000)}
              id={explainerItem.id}
              languageCode={explainer.language !== 'und' ? explainer.language : null}
              removeDisabled={projectMedia.type === 'Blank'}
              summary={explainer.description}
              title={explainer.title}
              url={explainer.url}
              variant="explainer"
              onClick={() => { setArticleToEdit(explainer); }}
            />
          </div>
        );
      })}

      { articleToEdit && articleToEdit.nodeType === 'FactCheck' && (
        <ClaimFactCheckForm
          article={articleToEdit}
          team={projectMedia.team}
          onClose={() => { setArticleToEdit(false); }}
        />
      )}

      { articleToEdit && articleToEdit.nodeType === 'Explainer' && (
        <ExplainerForm
          article={articleToEdit}
          team={projectMedia.team}
          onClose={() => { setArticleToEdit(false); }}
        />
      )}
    </div>
  );
};

MediaArticlesDisplay.defaultProps = {
  onUpdate: () => {},
};

MediaArticlesDisplay.propTypes = {
  projectMedia: PropTypes.shape({
    type: PropTypes.string.isRequired,
    fact_check_published_on: PropTypes.number,
    team: PropTypes.shape({
      verification_statuses: PropTypes.object.isRequired,
    }).isRequired,
    fact_check: PropTypes.shape({
      title: PropTypes.string,
      summary: PropTypes.string,
      language: PropTypes.string,
      updated_at: PropTypes.string,
      url: PropTypes.string,
      report_status: PropTypes.string,
      rating: PropTypes.string,
      nodeType: PropTypes.oneOf(['Explainer', 'FactCheck']),
      claim_description: PropTypes.shape({
        id: PropTypes.string,
        description: PropTypes.string,
        context: PropTypes.string,
      }).isRequired,
    }).isRequired,
    explainer_items: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string,
          explainer: PropTypes.shape({
            language: PropTypes.string,
            title: PropTypes.string,
            description: PropTypes.string,
            url: PropTypes.string,
            updated_at: PropTypes.string,
            nodeType: PropTypes.oneOf(['Explainer', 'FactCheck']),
          }),
        }),
      })),
    }).isRequired,
  }).isRequired,
  onUpdate: PropTypes.func,
};

export default createFragmentContainer(MediaArticlesDisplay, graphql`
  fragment MediaArticlesDisplay_projectMedia on ProjectMedia {
    type
    fact_check_published_on
    team {
      verification_statuses
      ...ClaimFactCheckForm_team
      ...ExplainerForm_team
    }
    fact_check {
      id
      title
      summary
      language
      updated_at
      url
      report_status
      rating
      claim_description {
        id
        description
        context
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
            description
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
