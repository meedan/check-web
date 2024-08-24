/* eslint-disable react/sort-prop-types */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';

const CreateMediaButtonWrapper = ({ children, disabled }) => {
  if (disabled) {
    return (
      <Tooltip
        arrow
        key="create-article-button"
        placement="top"
        title={
          <FormattedMessage
            defaultMessage="You can't create a media item here."
            description="Tooltip message displayed on new media item button when it is disabled."
            id="createMediaButton.tooltip"
          />
        }
      >
        <div className="new-article-button__tooltip-children">
          {children}
        </div>
      </Tooltip>
    );
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

const CreateMediaButton = ({
  buttonMainProps,
  disabled,
}) => {

  return (
    <CreateMediaButtonWrapper disabled={disabled}>
      <ButtonMain
        buttonProps={{
          id: 'new-article-menu__open-button',
        }}
        disabled={disabled}
        iconLeft={<AddIcon />}
        label={
          <FormattedMessage
            defaultMessage="Create Media"
            description="Label of a button that opens a form to create a new media item."
            id="createMediaButton.newMediaItem"
          />
        }
        size="default"
        theme="lightBeige"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
        {...buttonMainProps}
      />
    </CreateMediaButtonWrapper>
  );
};

export default CreateMediaButton;
