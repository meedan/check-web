/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../alerts-and-prompts/Tooltip';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import NextIcon from '../../../icons/chevron_right.svg';
import PrevIcon from '../../../icons/chevron_left.svg';
import styles from './Paginator.module.css';

const Paginator = ({
  numberOfPageResults,
  numberOfTotalResults,
  onChangePage,
  page,
  pageSize,
}) => {
  const startingIndex = (page - 1) * pageSize;
  const endingIndex = startingIndex + (numberOfPageResults - 1);

  const handleGoToPreviousPage = () => {
    if (page > 1) {
      onChangePage(page - 1);
    }
  };

  const handleGoToNextPage = () => {
    if (endingIndex + 1 < numberOfTotalResults) {
      onChangePage(page + 1);
    }
  };

  return (
    <div className={styles.paginator}>
      <Tooltip title={<FormattedMessage defaultMessage="Previous page" description="Pagination button to go to previous page." id="paginator.previousPage" />}>
        <span>
          <ButtonMain
            disabled={page === 1}
            iconCenter={<PrevIcon />}
            theme="text"
            variant="text"
            onClick={handleGoToPreviousPage}
          />
        </span>
      </Tooltip>
      <span className="typography-button">
        <FormattedMessage
          defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
          description="Pagination count of items returned"
          id="paginator.itemsCount"
          values={{
            from: startingIndex + 1,
            to: endingIndex + 1,
            count: numberOfTotalResults,
          }}
        />
      </span>
      <Tooltip title={<FormattedMessage defaultMessage="Next page" description="Pagination button to go to next page." id="paginator.nextPage" />}>
        <span>
          <ButtonMain
            disabled={endingIndex + 1 === numberOfTotalResults}
            iconCenter={<NextIcon />}
            theme="text"
            variant="text"
            onClick={handleGoToNextPage}
          />
        </span>
      </Tooltip>
    </div>
  );
};

Paginator.defaultProps = {};

Paginator.propTypes = {
  page: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  numberOfPageResults: PropTypes.number.isRequired,
  numberOfTotalResults: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
};

export default Paginator;
