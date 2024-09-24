import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ChevronDownIcon from '../../icons/chevron_down.svg';
import ChevronRightIcon from '../../icons/chevron_right.svg';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import styles from './SaveFeed.module.css';

const FeedDataPointsSection = ({
  content,
  enabled,
  onToggle,
  readOnly,
  title,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={styles.dataPointsSection}>
      <div className={styles.dataPointsSectionHeader}>
        <ButtonMain
          iconCenter={expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
          size="small"
          theme="lightText"
          variant="contained"
          onClick={() => { setExpanded(!expanded); }}
        />
        <SwitchComponent
          checked={enabled}
          className="typography-body2"
          disabled={readOnly}
          label={title}
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
  content: PropTypes.node.isRequired,
  enabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  title: PropTypes.node.isRequired, // <FormattedMessage />, <FormattedHTMLMessage />, <Element>String</Element>, etc.
  onToggle: PropTypes.func,
};

export default FeedDataPointsSection;
