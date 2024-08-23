import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { labelsV2 } from './localizables';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import styles from '../Settings.module.css';

const SmoochBotSidebar = ({
  currentOption,
  onClick,
  resources,
}) => {
  const handleClick = (option) => {
    onClick(option);
  };

  const Option = ({ id, label }) => (
    <li>
      <ButtonMain
        key={id}
        label={label}
        size="default"
        theme={currentOption === id ? 'lightBrand' : 'lightText'}
        variant={currentOption === id ? 'contained' : 'text'}
        onClick={() => { handleClick(id); }}
      />
    </li>
  );

  return (
    <ul className={styles.smoochBotMenu}>
      <li className={cx('typography-overline', styles.smoochBotMenuSection)}>Menu Options</li>
      {/* Menu options */}
      { Object.keys(labelsV2).map((key) => {
        const label = labelsV2[key];
        return <Option id={key} key={key} label={label} />;
      })}
      <li className={cx('typography-overline', styles.smoochBotMenuSection)}>Resources</li>
      {/* Resources */}
      { resources.sort((a, b) => a.title.localeCompare(b.title)).map((resource) => {
        const label = resource.title;
        return (
          <Option
            id={`resource_${resource.dbid}`}
            key={resource.uuid}
            label={label}
          />
        );
      })}
    </ul>
  );
};

SmoochBotSidebar.defaultProps = {
  resources: [],
};

SmoochBotSidebar.propTypes = {
  currentOption: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  onClick: PropTypes.func.isRequired,
};

export default SmoochBotSidebar;
