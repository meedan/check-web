import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { MultiSelector } from '@meedan/check-ui';
import RemoveableWrapper from './RemoveableWrapper';
import SelectButton from './SelectButton';
import CircularProgress from '../CircularProgress';
import AddIcon from '../../icons/add.svg';
import CloseIcon from '../../icons/clear.svg';

const NoHoverButton = withStyles({
  root: {
    borderRadius: 0,
    borderLeft: '2px solid var(--otherWhite)',
    borderRight: '2px solid var(--otherWhite)',
    height: '36px',
    minWidth: 0,
    margin: 0,
    '&:hover': {
      background: 'transparent',
    },
  },
  disabled: {
    color: 'var(--textPrimary) !important',
  },
})(Button);

const OperatorToggle = ({ onClick, operator }) => (
  <NoHoverButton
    onClick={onClick}
    disabled={!onClick}
    color="primary"
    disableRipple
  >
    { operator === 'and' ?
      <FormattedMessage id="search.and" defaultMessage="and" description="Logical operator to be applied when filtering by multiple tags" /> :
      <FormattedMessage id="search.or" defaultMessage="or" description="Logical operator to be applied when filtering by multiple tags" />
    }
  </NoHoverButton>
);

const useTagStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    height: '24px',
    margin: '2px',
    lineHeight: '22px',
    color: 'var(--otherWhite)',
    backgroundColor: 'var(--brandMain)',
    borderRadius: '4px',
    boxSizing: 'content-box',
    padding: '0 8px 0 8px',
    outline: 0,
    overflow: 'hidden',
    '& :focus': {
      borderColor: 'var(--brandAccent)',
      backgroundColor: 'var(--brandAccent)',
    },
    '& span': {
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
  },
  missingProperty: {
    backgroundColor: 'var(--errorMain)',
  },
});

const Tag = ({
  label,
  onDelete,
  readOnly,
  ...props
}) => {
  const classes = useTagStyles();
  return label ? (
    <div className={`multi-select-filter__tag ${classes.root}`} {...props}>
      <span>{label}</span>
      { readOnly ? null : (
        <CloseIcon className="multi-select-filter__tag-remove" onClick={onDelete} />
      )}
    </div>
  ) : (
    <div className={`multi-select-filter__tag ${classes.root} ${classes.missingProperty}`} {...props}>
      <span>
        <FormattedMessage id="filter.tag.deleted" defaultMessage="Property deleted" description="Message shown a placeholder when someone tries to filter a search by a property that the user has deleted" />
      </span>
      { readOnly ? null : (
        <CloseIcon className="multi-select-filter__tag-remove" onClick={onDelete} />
      )}
    </div>
  );
};

const usePlusButtonStyles = makeStyles({
  root: {
    height: '36px',
    paddingLeft: '4px',
    borderLeft: '2px solid var(--otherWhite)',
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
  allowSearch,
  extraInputs,
  selected,
  icon,
  label,
  loading,
  options,
  onChange,
  onRemove,
  onSelectChange,
  onToggleOperator,
  operator,
  readOnly,
  single,
  onType,
  inputPlaceholder,
}) => {
  const [showSelect, setShowSelect] = React.useState(false);
  const [version, setVersion] = React.useState(0);

  const selectedArray = Array.isArray(selected) ? selected : [selected];

  const getLabelForValue = (value) => {
    const option = options.find(o => String(o.value) === String(value));
    return option ? option.label : '';
  };

  const handleTagDelete = (value) => {
    const newValue = [...selectedArray.filter(o => o !== value)];
    onChange(newValue);
  };

  const handleSelect = (value) => {
    setShowSelect(false);
    setVersion(version + 1); // Force refresh of wrapper component
    onChange(value);
  };

  return (
    <div>
      <div className="multi-select-filter">
        <RemoveableWrapper icon={icon} readOnly={readOnly} onRemove={onRemove} key={version}>
          <Box px={0.5} height={4.5} display="flex" alignItems="center" whiteSpace="nowrap">
            {label}
          </Box>
          { selectedArray.map((value, index) => (
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
          { selectedArray.length > 0 && showSelect ? (
            <OperatorToggle
              onClick={onToggleOperator}
              operator={operator}
            />
          ) : null }
          { (selectedArray.length === 0 || showSelect) && !readOnly ? (
            <CustomSelectDropdown
              allowSearch={allowSearch}
              loading={loading}
              options={options}
              selected={selectedArray}
              onSubmit={handleSelect}
              single={single}
              onSelectChange={onSelectChange}
              onType={onType}
              inputPlaceholder={inputPlaceholder}
            />
          ) : null }
          { extraInputs }
          { !readOnly && !single ? (
            <PlusButton>
              <AddIcon fontSize="small" onClick={() => setShowSelect(true)} />
            </PlusButton>
          ) : null }
        </RemoveableWrapper>
      </div>
    </div>
  );
};

const CustomSelectDropdown = ({
  allowSearch,
  loading,
  options,
  selected,
  single,
  onSubmit,
  onSelectChange,
  onType,
  inputPlaceholder,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSubmit = (value) => {
    setAnchorEl(null);
    onSubmit(value);
  };

  return (
    <Box mx={0.5}>
      <SelectButton onClick={e => setAnchorEl(e.currentTarget)} />
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <FormattedMessage id="multiSelector.search" defaultMessage="Search…" description="Placeholder text for search input">
          {placeholder => (
            <MultiSelector
              allowSearch={allowSearch}
              inputPlaceholder={inputPlaceholder || placeholder}
              loadingIcon={loading && <CircularProgress />}
              options={options}
              selected={selected}
              onSubmit={handleSubmit}
              single={single}
              onSelectChange={onSelectChange}
              onSearchChange={onType}
              submitLabel={
                <FormattedMessage
                  id="customAutocomplete.done"
                  defaultMessage="Done"
                  description="Label for closing dropdown when user is done selecting tags"
                />
              }
            />
          )}
        </FormattedMessage>
      </Popover>
    </Box>
  );
};

MultiSelectFilter.defaultProps = {
  allowSearch: true,
  extraInputs: null,
  loading: false,
  selected: [],
  onToggleOperator: null,
  readOnly: false,
  onType: null,
  inputPlaceholder: null,
};

MultiSelectFilter.propTypes = {
  allowSearch: PropTypes.bool,
  extraInputs: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])).isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.element.isRequired,
  loading: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  selected: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]),
  onToggleOperator: PropTypes.func,
  readOnly: PropTypes.bool,
  onType: PropTypes.func,
  inputPlaceholder: PropTypes.string,
};

export default MultiSelectFilter;
