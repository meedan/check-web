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
  label,
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
        iconCenter={!label && <FactCheckIcon />}
        iconLeft={label && <FactCheckIcon />}
        label={isPublished && label ?
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
        variant={label ? 'text' : 'contained'}
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
  useTooltip: true,
  label: false,
};

ItemReportStatus.propTypes = {
  className: PropTypes.string,
  isPublished: PropTypes.bool,
  publishedAt: PropTypes.instanceOf(Date), // Timestamp
  useTooltip: PropTypes.bool,
  label: PropTypes.bool,
};

export default ItemReportStatus;
