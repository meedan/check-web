import React from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Box from '@material-ui/core/Box';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import AddIcon from '@material-ui/icons/Add';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles } from '@material-ui/core/styles';
import styled from 'styled-components';
import { checkBlue } from '../../styles/js/shared';

const messages = defineMessages({
  select: {
    id: 'customAutocomplete.select',
    defaultMessage: 'Select',
    description: 'Verb. Label for generic dropdown component',
  },
});

// FIXME: Get rid of styled-components
// Based on example from material-ui doc: https://material-ui.com/components/autocomplete/#useautocomplete
const InputWrapper = styled('div')`
  height: 36px;
  background-color: #eee;
  border-radius: 4px;
  padding: 1px;
  margin-right: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  &:hover {
    border-color: black;
  }

  &.focused {
    background-color: #ccc;
  }

  & input {
    font-size: 14px;
    background-color: transparent;
    box-sizing: border-box;
    padding: 4px 6px;
    width: 0;
    min-width: 30px;
    flex-grow: 1;
    border: 0;
    margin: 0;
    outline: 0;
  }
`;

const useTagStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: '24px',
    margin: '2px',
    lineHeight: '22px',
    color: 'white',
    backgroundColor: checkBlue,
    borderRadius: '2px',
    boxSizing: 'content-box',
    padding: '0 4px 0 10px',
    outline: 0,
    overflow: 'hidden',
    '& :focus': {
      borderColor: '#40a9ff',
      backgroundColor: '#e6f7ff',
    },
    '& span': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    '& svg': {
      fontSize: '12px',
      cursor: 'pointer',
      padding: '4px',
      width: '24px',
      height: '24px',
    },
  },
});

const Tag = ({
  label,
  onDelete,
  className,
  readOnly,
  ...props
}) => {
  const classes = useTagStyles();
  return (
    <div className={`custom-ac__tag ${className} ${classes.root}`} {...props}>
      <span>{label}</span>
      { readOnly ? null : (
        <CloseIcon className="custom-ac__tag-remove" onClick={onDelete} />
      )}
    </div>
  );
};

const usePlusButtonStyles = makeStyles({
  root: {
    height: '36px',
    borderLeft: '2px solid white',
    alignItems: 'center',
    display: 'flex',
    cursor: 'pointer',
  },
});

const PlusButton = ({ children }) => {
  const classes = usePlusButtonStyles();
  return (
    <div className={classes.root}>
      {children}
    </div>
  );
};

const Listbox = styled('ul')`
  width: 300px;
  margin: 2px 0 0;
  padding: 0;
  position: absolute;
  list-style: none;
  background-color: #fff;
  overflow: auto;
  max-height: 250px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10000;

  & li {
    padding: 5px 12px;
    display: flex;

    & span {
      flex-grow: 1;
    }

    & svg {
      color: transparent;
    }
  }

  & li[aria-selected='true'] {
    background-color: #fafafa;
    font-weight: 600;

    & svg {
      color: ${checkBlue};
    }
  }

  & li[data-focus='true'] {
    background-color: #eee;
    cursor: pointer;

    & svg {
      color: #000;
    }
  }
`;

const CustomAutocomplete = ({
  value,
  icon,
  intl,
  getOptionLabel,
  getOptionSelected,
  label,
  options,
  onChange,
  switchAndOr,
  readOnly,
}) => {
  const {
    getRootProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    value,
    multiple: true,
    options: options || [],
    onChange,
    getOptionLabel,
    getOptionSelected,
  });

  const otherInputProps = value.length ? {} : {
    placeholder: intl.formatMessage(messages.select),
    style: { minWidth: 100 },
  };

  return (
    <div>
      <div {...getRootProps()}>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          { icon ? (
            <Box px={0.5} display="flex" alignItems="center">
              {icon}
            </Box>
          ) : null }
          { label ? (
            <Box px={0.5} display="flex" alignItems="center">
              {label}
            </Box>
          ) : null }
          { value.map((option, index) => (
            <React.Fragment key={getOptionLabel(option)}>
              { index > 0 ? switchAndOr : null }
              <Tag
                label={getOptionLabel(option)}
                readOnly={readOnly}
                {...getTagProps({ index })}
              />
            </React.Fragment>
          )) }
          { readOnly ? null : (
            <React.Fragment>
              <input
                className="custom-ac__input"
                {...getInputProps()}
                {...otherInputProps}
              />
              <PlusButton>
                <AddIcon fontSize="small" onClick={getInputProps().onMouseDown} />
              </PlusButton>
            </React.Fragment>
          )}
        </InputWrapper>
      </div>
      { groupedOptions.length > 0 ? (
        <Listbox {...getListboxProps()}>
          {groupedOptions.map((option, index) => (
            <li {...getOptionProps({ option, index })}>
              <span>{getOptionLabel(option)}</span>
              <CheckIcon fontSize="small" />
            </li>
          ))}
        </Listbox>
      ) : null }
    </div>
  );
};

CustomAutocomplete.propTypes = {

};

export default injectIntl(CustomAutocomplete);
