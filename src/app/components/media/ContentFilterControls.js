import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import ShieldCheckIcon from '../../icons/visibility_off.svg';
import ShieldOffIcon from '../../icons/visibility.svg';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import styles from './ContentFilterControls.module.css';

const ContentFilterControls = () => {
  const [maskContent, setMaskContent] = React.useState(window.storage.getValue('contentMask') ? window.storage.getValue('contentMask') === 'true' : false);

  const updateStoredValue = (value) => {
    window.storage.set('contentMask', value);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'contentMask',
      newValue: value,
    }));
  };

  useEffect(() => {
    // this will be later updated to pull a stored value in local storage
    // but at the moment, just reset the local storage value to the default mask value
    updateStoredValue(maskContent);
  }, []);


  const handleMaskToggle = (newValue) => {
    if (newValue) {
      setMaskContent(newValue === 'true');
      updateStoredValue(newValue === 'true');
    }
  };

  return (
    <React.Fragment>
      <ToggleButtonGroup
        exclusive
        iconCenter
        orientation="vertical"
        theme="setting"
        value={maskContent.toString()}
        variant="containedLight"
        onChange={(e, newValue) => handleMaskToggle(newValue)}
      >
        <ToggleButton
          selected={!maskContent}
          value="false"
        >
          <Tooltip
            arrow
            placement="left"
            title={
              <FormattedMessage
                defaultMessage="Show visual media previews"
                description="Tooltip for off state of the content filter toggle"
                id="contentFilterControls.tooltipOff"
              />
            }
          >
            <span className={styles.toolTipWrapper}>
              <ShieldOffIcon />
            </span>
          </Tooltip>
        </ToggleButton>
        <ToggleButton
          selected={maskContent}
          value="true"
        >
          <Tooltip
            arrow
            placement="left"
            title={
              <FormattedMessage
                defaultMessage="Hide visual media previews"
                description="Tooltip for on state of the content filter toggle"
                id="contentFilterControls.tooltipOn"
              />
            }
          >
            <span className={styles.toolTipWrapper}>
              <ShieldCheckIcon />
            </span>
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
    </React.Fragment>
  );
};

export default ContentFilterControls;
