import React from 'react';
import Box from '@material-ui/core/Box';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import { checkBlue } from '../../styles/js/shared';

// FIXME: Get rid of styled-components
// Based on example from material-ui doc: https://material-ui.com/components/autocomplete/#useautocomplete
const InputWrapper = styled('div')`
  height: 36px;
  background-color: #ddd;
  border-radius: 4px;
  padding: 1px;
  margin-right: 8px;
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
    height: 30px;
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

const Tag = styled(({
  label,
  onDelete,
  className,
  ...props
}) => (
  <div className={`custom-ac__tag ${className}`} {...props}>
    <span>{label}</span>
    <CloseIcon onClick={onDelete} />
  </div>
))`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 2px;
  line-height: 22px;
  background-color: #eee;
  border: 1px solid #e8e8e8;
  border-radius: 2px;
  box-sizing: content-box;
  padding: 0 4px 0 10px;
  outline: 0;
  overflow: hidden;

  &:focus {
    border-color: #40a9ff;
    background-color: #e6f7ff;
  }

  & span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  & svg {
    font-size: 12px;
    cursor: pointer;
    padding: 4px;
    width: 24px;
    height: 24px;
  }
`;

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

export default function CustomizedHook({
  defaultValue,
  icon,
  getOptionLabel,
  getOptionSelected,
  label,
  options,
  onChange,
  append,
}) {
  const {
    getRootProps,
    getInputProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    value,
    focused,
    setAnchorEl,
  } = useAutocomplete({
    defaultValue,
    multiple: true,
    options: options || [],
    onChange,
    getOptionLabel,
    getOptionSelected,
  });

  const otherInputProps = value.length ? {} : {
    placeholder: label,
    style: { minWidth: 100 },
  };

  return (
    <div>
      <div {...getRootProps()}>
        <InputWrapper ref={setAnchorEl} className={focused ? 'focused' : ''}>
          { icon ? (
            <Box px={0.5}>
              {icon}
            </Box>
          ) : null }
          { value.map((option, index) => (
            <Tag label={getOptionLabel(option)} {...getTagProps({ index })} />
          )) }
          <input {...getInputProps()} {...otherInputProps} />
          { append }
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
}
