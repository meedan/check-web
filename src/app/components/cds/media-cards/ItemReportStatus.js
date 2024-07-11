import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import FactCheckIcon from '../../../icons/fact_check.svg';

const ItemReportStatus = ({
  isPublished, publishedAt, className, theme, variant, tooltip,
}) => {
  const formatTooltip = () => {
    const label = isPublished ? (
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
    );

    // eslint-disable-next-line
    console.log("publishedA ",publishedAt, isPublished, label)

    return (
      <>
        <span>{label}</span>
        { isPublished && publishedAt && (
          <ul>
            <li>{Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(publishedAt)}</li>
          </ul>
        )}
      </>
    );
  };

  const button = (
    <div className={className}>
      <ButtonMain
        disabled
        buttonProps={{
          type: null,
        }}
        variant={variant}
        size="small"
        theme={theme}
        iconCenter={<FactCheckIcon />}
        customStyle={{
          color: (isPublished || publishedAt ? 'var(--color-green-35)' : 'var(--color-gray-59)'),
        }}
      />
    </div>
  );

  return tooltip ? (
    <Tooltip
      arrow
      title={formatTooltip()}
      placement="top"
    >
      {button}
    </Tooltip>
  ) : button;
};

ItemReportStatus.defaultProps = {
  className: null,
  isPublished: false,
  publishedAt: null,
  variant: 'contained',
  theme: 'text',
  tooltip: true,
};

ItemReportStatus.propTypes = {
  className: PropTypes.string,
  isPublished: PropTypes.bool,
  publishedAt: PropTypes.instanceOf(Date), // Timestamp
  theme: PropTypes.string,
  variant: PropTypes.string,
  tooltip: PropTypes.bool,
};

export default ItemReportStatus;
