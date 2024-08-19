/* eslint-disable react/sort-prop-types */
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
      id="chooseExistingArticleButton.title"
      defaultMessage="Choose an existing article"
      description="Label for the button to find an article."
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
        placement="top"
        title={disabled ? (
          <FormattedMessage
            id="newArticleButton.tooltip"
            defaultMessage="You can't add an article here."
            description="Tooltip message displayed on new article button when it is disabled."
          />
        ) : null}
        arrow
      >
        <span>
          <ButtonMain
            className="choose-existing-article-button__open-slideout"
            disabled={disabled}
            variant="contained"
            size="small"
            theme="text"
            iconLeft={<SearchIcon />}
            onClick={() => setOpenSlideout(true)}
            label={title}
          />
        </span>
      </Tooltip>
      { openSlideout && (
        <Slideout
          title={title}
          showCancel
          footer
          content={
            <div className={styles.contentWrapper}>
              <FormattedMessage
                id="chooseExistingArticleButton.search"
                defaultMessage="Search by article title or summary"
                description="Label for the search field to find an article."
              >
                {placeholder => (
                  <TextField
                    id="search-articles"
                    iconLeft={<SearchIcon />}
                    placeholder={placeholder}
                    onChange={e => handleType(e.target.value)}
                  />
                )}
              </FormattedMessage>
              <div>
                { !search && (
                  <div className={cx('typography-body2', styles.heading)}>
                    <FormattedMessage
                      id="chooseExistingArticleButton.recentArticles"
                      defaultMessage="Recent Articles"
                      description="Label for the list of articles."
                    />
                  </div>
                )}
                <MediaArticlesTeamArticles textSearch={search} teamSlug={teamSlug} targetId={projectMediaDbid} onAdd={onAdd} />
              </div>
            </div>
          }
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
  teamSlug: PropTypes.string.isRequired,
  projectMediaDbid: PropTypes.number.isRequired,
  onAdd: PropTypes.func.isRequired,
};

export default ChooseExistingArticleButton;
