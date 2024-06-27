import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import FactCheckIcon from '../../../icons/fact_check.svg';

const ItemReportStatus = ({ isPublished, publishedAt, className }) => {
  const formatTooltip = () => {
    const label = (isPublished || publishedAt ? (
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
          buttonProps={{
            type: null,
          }}
          variant="contained"
          size="small"
          theme="text"
          iconCenter={<FactCheckIcon />}
          customStyle={{
            color: (isPublished || publishedAt ? 'var(--color-green-35)' : 'var(--color-gray-59)'),
          }}
        />
      </div>
    </Tooltip>
  );
};

ItemReportStatus.defaultProps = {
  className: null,
  isPublished: false,
  publishedAt: null,
};

ItemReportStatus.propTypes = {
  className: PropTypes.string,
  isPublished: PropTypes.bool,
  publishedAt: PropTypes.instanceOf(Date), // Timestamp
};

export default ItemReportStatus;
