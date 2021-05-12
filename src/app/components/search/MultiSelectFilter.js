import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import styled from 'styled-components';
import MultiSelector from '../layout/MultiSelector';
import { checkBlue, opaqueBlack54 } from '../../styles/js/shared';

const NoHoverButton = withStyles({
  root: {
    borderRadius: 0,
    borderLeft: '2px solid white',
    borderRight: '2px solid white',
    height: '36px',
    minWidth: 0,
    margin: 0,
    '&:hover': {
      background: 'transparent',
    },
  },
  text: {
    color: opaqueBlack54,
  },
})(Button);

const OperatorToggle = ({ onClick, operator }) => (
  <NoHoverButton
    onClick={onClick}
    disabled={!onClick}
    disableRipple
  >
    { operator === 'and' ?
      <FormattedMessage id="search.and" defaultMessage="And" description="Logical operator to be applied when filtering by multiple tags" /> :
      <FormattedMessage id="search.or" defaultMessage="Or" description="Logical operator to be applied when filtering by multiple tags" />
    }
  </NoHoverButton>
);

// FIXME: Get rid of styled-components
// Based on example from material-ui doc: https://material-ui.com/components/autocomplete/#useautocomplete
const InputWrapper = styled('div')`
  height: 36px;
  background-color: #eee;
  border-radius: 4px;
  padding-right: 4px;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;

  &.focused {
    background-color: #ccc;
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
    padding: '0 8px 0 8px',
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
  readOnly,
  ...props
}) => {
  const classes = useTagStyles();
  return (
    <div className={`multi-select-filter__tag ${classes.root}`} {...props}>
      <span>{label}</span>
      { readOnly ? null : (
        <CloseIcon className="multi-select-filter__tag-remove" onClick={onDelete} />
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

const MultiSelectFilter = ({
  selected = [],
  icon,
  label,
  options,
  onChange,
  onToggleOperator,
  operator,
  readOnly,
}) => {
  const [showSelect, setShowSelect] = React.useState(false);

  const getLabelForValue = (value) => {
    const option = options.find(o => o.value === value);
    return option ? option.label : '';
  };

  const handleTagDelete = (value) => {
    const newValue = [...selected.filter(o => o !== value)];
    onChange(newValue);
  };

  const handleSelect = (value) => {
    setShowSelect(false);
    onChange(value);
  };

  return (
    <div>
      <div className="multi-select-filter">
        <InputWrapper>
          { icon ? (
            <Box px={0.5} display="flex" alignItems="center">
              {icon}
            </Box>
          ) : null }
          { label ? (
            <Box px={0.5} display="flex" alignItems="center" whiteSpace="nowrap">
              {label}
            </Box>
          ) : null }
          { selected.map((value, index) => (
            <React.Fragment key={getLabelForValue(value)}>
              { index > 0 ? (
                <OperatorToggle
                  onClick={onToggleOperator}
                  operator={operator}
                />
              ) : null }
              <Tag
                label={getLabelForValue(value)}
                onDelete={() => handleTagDelete(value)}
                readOnly={readOnly}
              />
            </React.Fragment>
          )) }
          { selected.length > 0 && showSelect ? (
            <OperatorToggle
              onClick={onToggleOperator}
              operator={operator}
            />
          ) : null }
          { (selected.length === 0 || showSelect) && !readOnly ? (
            <CustomSelectDropdown
              options={options}
              selected={selected}
              onSubmit={handleSelect}
            />
          ) : null}
          { readOnly ? null : (
            <PlusButton>
              <AddIcon fontSize="small" onClick={() => setShowSelect(true)} />
            </PlusButton>
          )}
        </InputWrapper>
      </div>
    </div>
  );
};

const SelectButton = withStyles({
  root: {
    backgroundColor: '#ddd',
    padding: '0 8px',
    fontWeight: 'normal',
  },
  text: {
    color: '#777',
    textTransform: 'none',
  },
})(Button);

const CustomSelectDropdown = ({
  options,
  selected,
  onSubmit,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleSubmit = (value) => {
    setAnchorEl(null);
    onSubmit(value);
  };

  return (
    <Box mx={0.5}>
      <SelectButton
        className="custom-select-dropdown__select-button"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
      >
        <FormattedMessage
          id="customAutocomplete.select"
          defaultMessage="Select"
          description="Verb. Label for generic dropdown component"
        />
      </SelectButton>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MultiSelector
          allowSearch
          options={options}
          selected={selected}
          onSubmit={handleSubmit}
          submitLabel={
            <FormattedMessage
              id="customAutocomplete.done"
              defaultMessage="Done"
              description="Label for closing dropdown when user is done selecting tags"
            />
          }
        />
      </Popover>
    </Box>
  );
};


MultiSelectFilter.defaultProps = {
  icon: null,
  selected: [],
  onToggleOperator: null,
  readOnly: false,
};

MultiSelectFilter.propTypes = {
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])).isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.element,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])),
  onToggleOperator: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default MultiSelectFilter;
