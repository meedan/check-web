import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import FactCheckIcon from '../../../icons/fact_check.svg';

const ItemReportStatus = ({ publishedAt, className }) => {
  const formatTooltip = () => {
    const label = (publishedAt ? (
      <FormattedMessage
        id="itemReportStatus.tooltipPublished"
        description="Tooltip of a report status icon when the report is published"
        defaultMessage="Published Fact-Check"
      />
    ) : (
      <FormattedMessage
        id="itemReportStatus.tooltipUnpublished"
        description="Tooltip of a report status icon when the report is not published"
        defaultMessage="Unpublished Fact-Check"
      />
    ));

    return (
      <>
        <span>{label}</span>
        { publishedAt && (
          <ul>
            <li>{Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(publishedAt)}</li>
          </ul>
        )}
      </>
    );
  };

  return (
    <Tooltip
      arrow
      title={formatTooltip()}
      placement="top"
    >
      <div className={className}>
        <ButtonMain
          disabled
          variant="contained"
          size="default"
          theme="text"
          iconCenter={<FactCheckIcon />}
          customStyle={{
            color: (publishedAt ? 'var(--color-green-35)' : 'var(--color-gray-59)'),
          }}
        />
      </div>
    </Tooltip>
  );
};

ItemReportStatus.defaultProps = {
  className: null,
  publishedAt: null,
};

ItemReportStatus.propTypes = {
  className: PropTypes.string,
  publishedAt: PropTypes.instanceOf(Date), // Timestamp
};

export default ItemReportStatus;
