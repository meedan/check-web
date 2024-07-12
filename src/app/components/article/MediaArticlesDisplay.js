import React from 'react';
import { FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Alert from '../cds/alerts-and-prompts/Alert';
import MediaArticleCard from './MediaArticleCard';

const MediaArticlesDisplay = ({ factCheck, explainers, currentStatus }) => {
  // eslint-disable-next-line
  console.log('Explainers:', explainers); 

  return (
    <>
      {factCheck ?
        <MediaArticleCard
          key={factCheck.id}
          variant="fact-check"
          title={factCheck.title || factCheck.claim_description?.description}
          url={factCheck.url}
          languageCode={factCheck.language !== 'und' ? factCheck?.language : null}
          date={factCheck.updated_at}
          statusColor={currentStatus ? currentStatus.style?.color : null}
          statusLabel={currentStatus ? currentStatus.label : null}
          publishedAt={factCheck?.claim_description?.project_media?.report_status === 'published' && factCheck?.claim_description?.project_media?.published ? parseInt(factCheck?.claim_description?.project_media?.published, 10) : null}
        />
        : null}
      <br />
      {factCheck && explainers?.length > 0 ?
        <>
          <Alert
            variant="info"
            contained
            title={
              <FormattedMessage
                id="article.readOnlyAlertTitle"
                defaultMessage="Fact-Check Added"
                description="Title of the alert message displayed on data points section of the edit feed page."
              />
            }
            content={
              <FormattedMessage
                id="article.readOnlyAlertContent"
                defaultMessage="When a fact-check article is added it will be prioritized to be sent to all media and requests that match this item."
                description="Description of the alert message displayed on data points section of the edit feed page."
              />
            }
          />
          <br />
        </>
        : null}
      {explainers?.filter(explainer => explainer !== null).map(explainer => (
        <>
          <MediaArticleCard
            key={explainer?.id}
            variant="explainer"
            title={explainer?.title || explainer?.claim_description?.description}
            url={explainer?.url}
            languageCode={explainer?.language !== 'und' ? explainer?.language : null}
            date={explainer?.updated_at}
          />
          <br />
        </>
      ))}
    </>
  );
};
export default createFragmentContainer(MediaArticlesDisplay, graphql`
  fragment MediaArticlesDisplay_factCheck on FactCheck {
    title
    language
    updated_at
    url
    claim_description {
      description
      project_media {
        published
        report_status
      }
    }
  }

  # fragment MediaArticlesDisplay_explainer on Explainer {
  #   language
  #   title
  #   url
  #   updated_at
  # }
`);
