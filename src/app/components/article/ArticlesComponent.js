import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import styles from './../drawer/Projects/Projects.module.css';
import ArticleCoreListCounter from './ArticleCoreListCounter';
import NewArticleButton from './NewArticleButton';
import PublishedIcon from '../../icons/fact_check.svg';
import TrashIcon from '../../icons/delete.svg';
import FileDownloadIcon from '../../icons/file_download.svg';
import BookIcon from '../../icons/book.svg';

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
      <ul className={cx(styles.listWrapper, styles.listFooter)}>
        <Link
          className={styles.linkList}
          to={`/${team.slug}/articles/trash`}
          onClick={() => { handleSpecialLists('trash'); }}
        >
          <li
            className={cx(
              'projects-list__trash',
              styles.listItem,
              styles.listItem_containsCount,
              {
                [styles.listItem_active]: activeItem.type === 'trash',
              })
            }
          >
            <TrashIcon className={styles.listIcon} />
            <div className={styles.listLabel}>
              <FormattedMessage defaultMessage="Trash" description="Label for a list displayed on the left sidebar that includes items that have been marked as Trashed" id="projectsComponent.trash" tagName="span" />
            </div>
            <ArticleCoreListCounter defaultFilters={{ trashed: true }} teamSlug={team.slug} />
          </li>
        </Link>
      </ul>
    </React.Fragment>
  );
};

export default ArticlesComponent;
