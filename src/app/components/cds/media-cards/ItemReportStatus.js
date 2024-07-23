import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import FactCheckIcon from '../../../icons/fact_check.svg';

const ItemReportStatus = ({
  className,
  isPublished,
  publishedAt,
  projectMediaDbid,
  theme,
  useTooltip,
  variant,
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
        disabled={!projectMediaDbid}
        buttonProps={{
          type: null,
        }}
        variant={variant}
        size="small"
        theme={theme}
        iconCenter={<FactCheckIcon />}
        customStyle={{ color: isPublished ? 'var(--color-green-35)' : 'var(--color-gray-59)' }}
        onClick={handleGoToReport}
      />
    </div>
  );

  return useTooltip ? (
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
