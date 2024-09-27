import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ArticleCoreListCounter from '../../article/ArticleCoreListCounter';
import NewArticleButton from '../../article/NewArticleButton';
import PublishedIcon from '../../../icons/fact_check.svg';
import FileDownloadIcon from '../../../icons/file_download.svg';
import BookIcon from '../../../icons/book.svg';
import styles from './Projects.module.css';

const DrawerArticlesComponent = ({ team }) => {
  // Get/set which list item should be highlighted
  const pathParts = window.location.pathname.split('/');
  const [activeItem, setActiveItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });

  React.useEffect(() => {
    const path = window.location.pathname.split('/');
    if (activeItem.type !== path[3] || activeItem.id !== path[3]) {
      setActiveItem({ type: path[3], id: parseInt(path[3], 10) });
    }
  }, [window.location.pathname]);

  const handleSpecialLists = listId => setActiveItem({ type: listId, id: null });

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        <FormattedMessage
          defaultMessage="Articles"
          description="The navigation name of the articles section"
          id="articlesComponent.articles"
        />
      </div>
      <div className={styles.listMainAction}>
        <NewArticleButton team={team} />
      </div>
      <div className={styles.listWrapperScrollWrapper}>
        <ul className={cx(styles.listWrapper)}>
          <Link
            className={styles.linkList}
            to={`/${team.slug}/articles/fact-checks`}
            onClick={() => { handleSpecialLists('fact-checks'); }}
          >
            <li
              className={cx(
                'projects-list__fact-checks',
                styles.listItem,
                styles.listItem_containsCount,
                {
                  [styles.listItem_active]: activeItem.type === 'fact-checks',
                })
              }
            >
              <PublishedIcon className={styles.listIcon} />
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="Claim & Fact-Checks" description="Label for a list displayed on the left sidebar that includes items that have claim & fact-checks" id="articlesComponent.claimAndFactChecks" tagName="span" />
              </div>
              <ArticleCoreListCounter teamSlug={team.slug} type="fact-check" />
            </li>
          </Link>
          <Link
            className={styles.linkList}
            to={`/${team.slug}/articles/explainers`}
            onClick={() => { handleSpecialLists('explainers'); }}
          >
            <li
              className={cx(
                'projects-list__explainers',
                styles.listItem,
                styles.listItem_containsCount,
                {
                  [styles.listItem_active]: activeItem.type === 'explainers',
                })
              }
            >
              <BookIcon className={styles.listIcon} />
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="Explainers" description="Label for a list displayed on the left sidebar that includes items that have explainers" id="articlesComponent.explainers" tagName="span" />
              </div>
              <ArticleCoreListCounter teamSlug={team.slug} type="explainer" />
            </li>
          </Link>
          <Link
            className={styles.linkList}
            to={`/${team.slug}/articles/imported-fact-checks`}
            onClick={() => { handleSpecialLists('imported-fact-checks'); }}
          >
            <li
              className={cx(
                'projects-list__imported-fact-checks',
                styles.listItem,
                styles.listItem_containsCount,
                {
                  [styles.listItem_active]: activeItem.type === 'imported-fact-checks',
                })
              }
            >
              <FileDownloadIcon className={styles.listIcon} />
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="Imported" description="Label for a list displayed on the left sidebar that includes items from the 'Imported fact-checks' channel" id="projectsComponent.importedReports" tagName="span" />
              </div>
              <ArticleCoreListCounter defaultFilters={{ imported: true }} teamSlug={team.slug} type="fact-check" />
            </li>
          </Link>
          <Link
            className={styles.linkList}
            to={`/${team.slug}/articles/published`}
            onClick={() => { handleSpecialLists('published'); }}
          >
            <li
              className={cx(
                'projects-list__published',
                styles.listItem,
                styles.listItem_containsCount,
                {
                  [styles.listItem_active]: activeItem.type === 'published',
                })
              }
            >
              <PublishedIcon className={styles.listIcon} />
              <div className={styles.listLabel}>
                <FormattedMessage defaultMessage="Published" description="Label for a list displayed on the left sidebar that includes items that have published reports" id="projectsComponent.published" tagName="span" />
              </div>
              <ArticleCoreListCounter defaultFilters={{ report_status: 'published' }} teamSlug={team.slug} type="fact-check" />
            </li>
          </Link>
        </ul>
      </div>
    </React.Fragment>
  );
};

const DrawerArticles = () => {
  const teamRegex = window.location.pathname.match(/^\/([^/]+)/);
  const teamSlug = teamRegex ? teamRegex[1] : null;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query DrawerArticlesQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            slug
            ...NewArticleButton_team
          }
        }
      `}
      render={({ error, props }) => {
        if (!props || error) return null;

        return <DrawerArticlesComponent team={props.team} />;
      }}
      variables={{ teamSlug }}
    />
  );
};

export default DrawerArticles;
