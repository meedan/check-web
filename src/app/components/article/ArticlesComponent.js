import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import PublishedIcon from '../../icons/fact_check.svg';
import FileDownloadIcon from '../../icons/file_download.svg';
import BookIcon from '../../icons/book.svg';
import styles from './../drawer/Projects/Projects.module.css';
import { publishedDefaultQuery } from '../team/Published';
import ProjectsCoreListCounter from '../drawer/Projects/ProjectsCoreListCounter';
import ArticleCoreListCounter from './ArticleCoreListCounter';
import NewArticleButton from './NewArticleButton';
import { importedReportsDefaultQuery } from '../team/ImportedReports';

const ArticlesComponent = ({ team }) => {
  // Get/set which list item should be highlighted
  const pathParts = window.location.pathname.split('/');
  const [activeItem, setActiveItem] = React.useState({ type: pathParts[2], id: parseInt(pathParts[3], 10) });

  React.useEffect(() => {
    const path = window.location.pathname.split('/');
    if (activeItem.type !== path[3] || activeItem.id !== path[3]) {
      setActiveItem({ type: path[3], id: parseInt(path[3], 10) });
    }
  }, [window.location.pathname]);

  const handleSpecialLists = (listId) => {
    setActiveItem({ type: listId, id: null });
  };

  return (
    <React.Fragment>
      <div className={styles.listTitle}>
        <FormattedMessage
          id="articlesComponent.articles"
          defaultMessage="Articles"
          description="The navigation name of the articles section"
        />
      </div>
      <div className={styles.listMainAction}>
        <NewArticleButton team={team} />
      </div>
      <div className={styles.listWrapperScrollWrapper}>
        <ul className={cx(styles.listWrapper)}>
          <Link
            onClick={() => { handleSpecialLists('fact-checks'); }}
            to={`/${team.slug}/articles/fact-checks`}
            className={styles.linkList}
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
                <FormattedMessage tagName="span" id="articlesComponent.claimAndFactChecks" defaultMessage="Claim & Fact-Checks" description="Label for a list displayed on the left sidebar that includes items that have claim and fact-checks" />
              </div>
              <ArticleCoreListCounter teamSlug={team.slug} type="fact-check" />
            </li>
          </Link>
          <Link
            onClick={() => { handleSpecialLists('explainers'); }}
            to={`/${team.slug}/articles/explainers`}
            className={styles.linkList}
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
                <FormattedMessage tagName="span" id="articlesComponent.explainers" defaultMessage="Explainers" description="Label for a list displayed on the left sidebar that includes items that have explainers" />
              </div>
              <ArticleCoreListCounter teamSlug={team.slug} type="explainer" />
            </li>
          </Link>
          <Link
            onClick={() => { handleSpecialLists('imported-fact-checks'); }}
            to={`/${team.slug}/articles/imported-fact-checks`}
            className={styles.linkList}
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
                <FormattedMessage tagName="span" id="projectsComponent.importedReports" defaultMessage="Imported" description="Label for a list displayed on the left sidebar that includes items from the 'Imported fact-checks' channel" />
              </div>
              <ProjectsCoreListCounter query={importedReportsDefaultQuery} />
            </li>
          </Link>
          <Link
            onClick={() => { handleSpecialLists('published'); }}
            to={`/${team.slug}/articles/published`}
            className={styles.linkList}
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
                <FormattedMessage tagName="span" id="projectsComponent.published" defaultMessage="Published" description="Label for a list displayed on the left sidebar that includes items that have published reports" />
              </div>
              <ProjectsCoreListCounter query={publishedDefaultQuery} />
            </li>
          </Link>
        </ul>
      </div>
    </React.Fragment>
  );
};

export default ArticlesComponent;
