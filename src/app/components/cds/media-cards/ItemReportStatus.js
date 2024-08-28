/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import FactCheckIcon from '../../../icons/fact_check.svg';

const ItemReportStatus = ({
  className,
  displayLabel,
  isPublished,
  projectMediaDbid,
  publishedAt,
  useTooltip,
}) => {
  const formatTooltip = () => {
    const tooltipLabel = isPublished ? (
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
        <span>{tooltipLabel}</span>
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
        disabled={!projectMediaDbid}
        iconCenter={!displayLabel && <FactCheckIcon />}
        iconLeft={displayLabel && <FactCheckIcon />}
        label={isPublished && displayLabel ?
          <FormattedMessage
            defaultMessage="Published"
            description="Label of a report status icon when the report is published"
            id="itemReportStatus.labelPublished"
          />
          :
          <FormattedMessage
            defaultMessage="Unpublished"
            description="Label of a report status icon when the report is not published"
            id="itemReportStatus.labelUnpublished"
          />
        }
        size="small"
        theme={isPublished ? 'lightValidation' : 'lightText'}
        variant={displayLabel ? 'text' : 'contained'}
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
  displayLabel: false,
  isPublished: false,
  publishedAt: null,
  useTooltip: true,
};

ItemReportStatus.propTypes = {
  className: PropTypes.string,
  displayLabel: PropTypes.bool,
  isPublished: PropTypes.bool,
  publishedAt: PropTypes.instanceOf(Date), // Timestamp
  useTooltip: PropTypes.bool,
};

export default ItemReportStatus;
