import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Popover from '@material-ui/core/Popover';
// FIXME: Extract SmoochIcon to its own component
import { SmoochIcon } from '../annotations/TiplineRequest';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ExpandMoreIcon from '../../icons/expand_more.svg';
import styles from './PlatformSelect.module.css';

const PlatformSelect = ({
  className,
  onChange,
  smoochIntegrations,
  value,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleOptionClick = (key) => {
    setAnchorEl(null);
    onChange(key);
  };

  return (
    <div className={cx(styles['bot-preview-select'], className)}>
      <ButtonMain
        className={styles['bot-preview-select-button']}
        iconLeft={<SmoochIcon name={value} />}
        iconRight={<ExpandMoreIcon />}
        label={smoochIntegrations[value].displayName || value}
        theme="text"
        variant="text"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <div className={styles.flyout}>
          <span className={styles['flyout-title']}>Select Platform to Preview Bot Responses</span>
          <ul>
            {Object.keys(smoochIntegrations).map(key => (
              <li className={cx({ [styles.active]: key === value })} key={key}>
                <button
                  className={styles.option}
                  onClick={() => handleOptionClick(key)}
                >
                  <SmoochIcon name={key} />
                  {smoochIntegrations[key].displayName || key}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Popover>
    </div>
  );
};

PlatformSelect.defaultProps = {
  className: '',
};

PlatformSelect.propTypes = {
  className: PropTypes.string,
  smoochIntegrations: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PlatformSelect;
