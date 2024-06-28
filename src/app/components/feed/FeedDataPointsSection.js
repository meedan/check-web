import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChevronUpIcon from '../../icons/chevron_up.svg';
import ChevronRightIcon from '../../icons/chevron_right.svg';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import styles from './SaveFeed.module.css';

const FeedDataPointsSection = ({
  readOnly,
  enabled,
  title,
  content,
  onToggle,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={styles.dataPointsSection}>
      <div className={styles.dataPointsSectionHeader}>
        <ButtonMain
          variant="contained"
          size="small"
          theme="lightText"
          onClick={() => { setExpanded(!expanded); }}
          iconCenter={expanded ? <ChevronUpIcon /> : <ChevronRightIcon />}
        />
        <SwitchComponent
          label={title}
          className="typography-body2"
          checked={enabled}
          disabled={readOnly}
          onChange={onToggle}
        />
      </div>
      <div className={cx(styles.dataPointsSectionBody, expanded ? styles.dataPointsSectionExpanded : styles.dataPointsSectionCollapsed)}>
        <div className={cx(styles.dataPointsSectionBodyContent, 'typography-body2')}>
          {content}
        </div>
      </div>
    </div>
  );
};

FeedDataPointsSection.defaultProps = {
  readOnly: false,
  enabled: false,
  onToggle: () => {},
};

FeedDataPointsSection.propTypes = {
  readOnly: PropTypes.bool,
  enabled: PropTypes.bool,
  title: PropTypes.node.isRequired, // <FormattedMessage />, <FormattedHTMLMessage />, <Element>String</Element>, etc.
  content: PropTypes.node.isRequired,
  onToggle: PropTypes.func,
};

export default FeedDataPointsSection;
