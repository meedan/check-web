/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import FactCheckIcon from '../../../icons/fact_check.svg';

const ItemReportStatus = ({
  className,
  isPublished,
  projectMediaDbid,
  publishedAt,
  theme,
  useTooltip,
  variant,
}) => {
  const formatTooltip = () => {
    const label = isPublished ? (
      <FormattedMessage
        defaultMessage="Published Fact-Check"
        description="Tooltip of a report status icon when the report is published"
        id="itemReportStatus.tooltipPublished"
      />
    ) : (
      <FormattedMessage
        defaultMessage="Unpublished Fact-Check"
        description="Tooltip of a report status icon when the report is not published"
        id="itemReportStatus.tooltipUnpublished"
      />
    );

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

  const handleGoToReport = () => {
    if (projectMediaDbid) {
      const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
      // FIXME: use browserHistory.push instead of window.location.assign
      window.location.assign(`/${teamSlug}/media/${projectMediaDbid}/report`);
    }
  };

  const button = (
    <div className={className}>
      <ButtonMain
        buttonProps={{
          type: null,
        }}
        customStyle={{ color: isPublished ? 'var(--color-green-35)' : 'var(--color-gray-59)' }}
        disabled={!projectMediaDbid}
        iconCenter={<FactCheckIcon />}
        size="small"
        theme={theme}
        variant={variant}
        onClick={handleGoToReport}
      />
    </div>
  );

  return useTooltip ? (
    <Tooltip
      arrow
      placement="top"
      title={formatTooltip()}
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
  useTooltip: true,
};

ItemReportStatus.propTypes = {
  className: PropTypes.string,
  isPublished: PropTypes.bool,
  publishedAt: PropTypes.instanceOf(Date), // Timestamp
  theme: PropTypes.string,
  variant: PropTypes.string,
  useTooltip: PropTypes.bool,
};

export default ItemReportStatus;
