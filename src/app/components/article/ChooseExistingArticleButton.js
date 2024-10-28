import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import MediaArticlesTeamArticles from './MediaArticlesTeamArticles';
import SearchIcon from '../../icons/search.svg';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Slideout from '../cds/slideout/Slideout';
import TextField from '../cds/inputs/TextField';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import styles from './ChooseExistingArticleButton.module.css';

let lastTypedValue = '';

const ChooseExistingArticleButton = ({
  disabled,
  onAdd,
  projectMediaDbid,
  teamSlug,
}) => {
  const [openSlideout, setOpenSlideout] = React.useState(false);
  const [search, setSearch] = React.useState('');

  const title = (
    <FormattedMessage
      defaultMessage="Choose an existing article"
      description="Label for the button to find an article."
      id="chooseExistingArticleButton.title"
    />
  );

  const handleCloseSlideout = () => {
    setSearch('');
    setOpenSlideout(false);
  };

  const handleType = (value) => {
    lastTypedValue = value;
    setTimeout(() => {
      if (value === lastTypedValue) {
        setSearch(value);
      }
    }, 1500);
  };

  return (
    <>
      <Tooltip
        arrow
        placement="top"
        title={disabled ? (
          <FormattedMessage
            defaultMessage="You can't add an article here."
            description="Tooltip message displayed on new article button when it is disabled."
            id="newArticleButton.tooltip"
          />
        ) : null}
      >
        <span>
          <ButtonMain
            className="choose-existing-article-button__open-slideout"
            disabled={disabled}
            iconLeft={<SearchIcon />}
            label={title}
            size="small"
            theme="text"
            variant="contained"
            onClick={() => setOpenSlideout(true)}
          />
        </span>
      </Tooltip>
      { openSlideout && (
        <Slideout
          content={
            <div className={styles.contentWrapper}>
              <div className={styles.seachHeader}>
                <FormattedMessage
                  defaultMessage="Search by article title or summary"
                  description="Label for the search field to find an article."
                  id="chooseExistingArticleButton.search"
                >
                  {placeholder => (
                    <TextField
                      iconLeft={<SearchIcon />}
                      id="search-articles"
                      placeholder={placeholder}
                      onChange={e => handleType(e.target.value)}
                    />
                  )}
                </FormattedMessage>
              </div>
              <div className={styles.seachResults}>
                { !search && (
                  <div className={cx('typography-subtitle2', styles.heading)}>
                    <FormattedMessage
                      defaultMessage="Choose a recent article to add to this media:"
                      description="Message displayed on articles sidebar when an item has no articles."
                      id="mediaArticles.chooseRecentArticle"
                    />
                  </div>
                )}
                <MediaArticlesTeamArticles targetId={projectMediaDbid} teamSlug={teamSlug} textSearch={search} onAdd={onAdd} />
              </div>
            </div>
          }
          contentScrollable={false}
          footer
          showCancel
          title={title}
          onClose={handleCloseSlideout}
        />
      )}
    </>
  );
};

ChooseExistingArticleButton.defaultProps = {
  disabled: false,
};

ChooseExistingArticleButton.propTypes = {
  disabled: PropTypes.bool,
  projectMediaDbid: PropTypes.number.isRequired,
  teamSlug: PropTypes.string.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default ChooseExistingArticleButton;
