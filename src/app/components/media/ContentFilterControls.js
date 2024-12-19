import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import ShieldCheckIcon from '../../icons/shield_check.svg';
import ShieldOffIcon from '../../icons/shield_off.svg';
import { ToggleButton, ToggleButtonGroup } from '../cds/inputs/ToggleButtonGroup';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';

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
          <ToggleButton
            selected={!maskContent}
            value="false"
          >
            <ShieldOffIcon />
          </ToggleButton>
        </Tooltip>
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
          <ToggleButton
            selected={maskContent}
            value="true"
          >
            <ShieldCheckIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </React.Fragment>
  );
};

export default ContentFilterControls;
