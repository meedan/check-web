import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import SuggestionsIcon from '../../../icons/lightbulb.svg';
import { getCompactNumber, getSeparatedNumber } from '../../../helpers';
import styles from './SuggestionsCount.module.css';

const SuggestionsCount = ({
  intl,
  suggestionsCount,
}) => (
  <div className={styles.suggestionsCount}>
    <FormattedMessage id="suggestionsCount.suggestions" defaultMessage="Suggestions" description="This appears as a label next to a number, like '1,234 Suggestions'. It should indicate to the user that whatever number they are viewing represents the number of medias attached to an item .">
      { mediasLabel => (
        <Tooltip
          arrow
          title={`${getSeparatedNumber(intl.locale, suggestionsCount)} ${mediasLabel}`}
          placement="top"
        >
          <span>
            <ButtonMain
              disabled
              size="small"
              theme="brand"
              iconLeft={<SuggestionsIcon />}
              variant="contained"
              label={getCompactNumber(intl.locale, suggestionsCount)}
            />
          </span>
        </Tooltip>
      )}
    </FormattedMessage>
  </div>
);

SuggestionsCount.propTypes = {
  intl: intlShape.isRequired,
  suggestionsCount: PropTypes.number.isRequired,
};

export default injectIntl(SuggestionsCount);
