import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../alerts-and-prompts/Tooltip';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import NextIcon from '../../../icons/chevron_right.svg';
import PrevIcon from '../../../icons/chevron_left.svg';
import styles from './Paginator.module.css';

const Paginator = ({
  page,
  pageSize,
  numberOfPageResults,
  numberOfTotalResults,
  onChangePage,
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
      <Tooltip title={<FormattedMessage id="paginator.previousPage" defaultMessage="Previous page" description="Pagination button to go to previous page." />}>
        <ButtonMain
          onClick={handleGoToPreviousPage}
          iconCenter={<PrevIcon />}
          disabled={page === 1}
          theme="text"
          variant="text"
        />
      </Tooltip>
      <span className="typography-button">
        <FormattedMessage
          id="paginator.itemsCount"
          defaultMessage="{count, plural, one {1 / 1} other {{from} - {to} / #}}"
          description="Pagination count of items returned"
          values={{
            from: startingIndex + 1,
            to: endingIndex + 1,
            count: numberOfTotalResults,
          }}
        />
      </span>
      <Tooltip title={<FormattedMessage id="paginator.nextPage" defaultMessage="Next page" description="Pagination button to go to next page." />}>
        <ButtonMain
          onClick={handleGoToNextPage}
          iconCenter={<NextIcon />}
          disabled={endingIndex + 1 === numberOfTotalResults}
          theme="text"
          variant="text"
        />
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
