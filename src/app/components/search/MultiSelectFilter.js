import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Popover from '@material-ui/core/Popover';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import MultiSelector from '../layout/MultiSelector';
import RemoveableWrapper from './RemoveableWrapper';
import MediasLoading from '../media/MediasLoading';
import AddIcon from '../../icons/add.svg';
import CloseIcon from '../../icons/clear.svg';
import ErrorOutlineIcon from '../../icons/error_outline.svg';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import styles from './search.module.css';

const OperatorToggle = ({ onClick, operator }) => (
  <ButtonMain
    onClick={onClick}
    disabled={!onClick}
    theme="text"
    size="small"
    variant="text"
    customStyle={{ color: 'var(--textPrimary' }}
    label={operator === 'and' ? <FormattedMessage id="search.and" defaultMessage="and" description="Logical operator to be applied when filtering by multiple tags" /> : <FormattedMessage id="search.or" defaultMessage="or" description="Logical operator to be applied when filtering by multiple tags" />}
  />
);

const Tag = ({
  label,
  onDelete,
  readOnly,
  ...props
}) => (
  <>
    {label ?
      <div
        className={cx(
          'multi-select-filter__tag',
          styles['filter-value'],
          {
            [styles['filter-value-removable']]: !readOnly,
          })
        }
        {...props}
      >
        <span>{label}</span>
        { readOnly ? null : (
          <Tooltip
            title={
              <FormattedMessage id="filter.removeFilterCondition" defaultMessage="Remove filter condition" description="Tooltip to tell the user they can add remove the argument to the filter they are interacting with" />
            }
            arrow
          >
            <span>
              <ButtonMain
                className="multi-select-filter__tag-remove"
                iconCenter={<CloseIcon />}
                onClick={onDelete}
                theme="brand"
                variant="contained"
                size="small"
              />
            </span>
          </Tooltip>
        )}
      </div>
      :
      <div className={cx('multi-select-filter__tag', styles['filter-value'], styles['filter-value-missing'])} {...props}>
        <span>
          <FormattedMessage id="filter.tag.deleted" defaultMessage="Property deleted" description="Message shown a placeholder when someone tries to filter a search by a property that the user has deleted" />
        </span>
        { readOnly ? null : (
          <CloseIcon className="multi-select-filter__tag-remove" onClick={onDelete} />
        )}
      </div>
    }
  </>
);

const MultiSelectFilter = ({
  error,
  allowSearch,
  extraInputs,
  hasMore,
  selected,
  icon,
  label,
  loading,
  options,
  onChange,
  onRemove,
  onScrollBottom,
  onSelectChange,
  onToggleOperator,
  operator,
  readOnly,
  single,
  onType,
  inputPlaceholder,
  oneOption,
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

  // On initial render, if we automatically pick one option and don't give the user a choice (for example, they select 'Media is unmatched' so we are only doing a query for that when selected), we assume that the options array as specified is the value we want.
  React.useEffect(() => {
    if (oneOption) {
      handleSelect(options.filter(o => o.value !== '').map(o => o.value));
    }
  }, []);

  return (
    <div className={cx('multi-select-filter', styles['filter-wrapper'], styles['filter-multiselect'])}>
      <RemoveableWrapper icon={icon} readOnly={readOnly} onRemove={onRemove} key={version}>
        {label &&
          <div className={styles['filter-label']}>
            {label}
          </div>
        }
        { !oneOption && selectedArray.map((value, index) => (
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
        { !oneOption && selectedArray.length > 0 && showSelect ? (
          <OperatorToggle
            onClick={onToggleOperator}
            operator={operator}
          />
        ) : null }
        { !oneOption && (selectedArray.length === 0 || showSelect) && !readOnly ? (
          <CustomSelectDropdown
            allowSearch={allowSearch}
            inputPlaceholder={inputPlaceholder}
            hasMore={hasMore}
            loading={loading}
            options={options}
            onScrollBottom={onScrollBottom}
            onSelectChange={onSelectChange}
            onSubmit={handleSelect}
            onType={onType}
            selected={selectedArray}
            single={single}
          />
        ) : null }
        { extraInputs }
        { !oneOption && !readOnly && !single ? (
          <Tooltip
            title={
              <FormattedMessage id="filter.addParameter" defaultMessage="Add filter condition" description="Tooltip to tell the user they can add another argument to the filter they are interacting with" />
            }
            arrow
          >
            <span>
              <ButtonMain
                iconCenter={<AddIcon />}
                theme="lightValidation"
                size="small"
                variant="contained"
                onClick={() => setShowSelect(true)}
              />
            </span>
          </Tooltip>
        ) : null }
      </RemoveableWrapper>
      { error ?
        <div className={styles['filter-error']}>
          <ErrorOutlineIcon />
          { error }
        </div> : null }
    </div>
  );
};

const CustomSelectDropdown = ({
  allowSearch,
  hasMore,
  loading,
  options,
  selected,
  single,
  onScrollBottom,
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
    <>
      <ButtonMain
        size="small"
        variant="contained"
        theme="text"
        className="custom-select-dropdown__select-button"
        iconRight={<KeyboardArrowDownIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        label={
          <FormattedMessage
            id="customAutocomplete.select"
            defaultMessage="Select"
            description="Verb. Label for generic dropdown component"
          />
        }
      />
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <FormattedMessage id="multiSelector.search" defaultMessage="Search…" description="Placeholder text for search input">
          {placeholder => (
            <MultiSelector
              allowSearch={allowSearch}
              hasMore={hasMore}
              inputPlaceholder={inputPlaceholder || placeholder}
              loadingIcon={loading && <MediasLoading theme="white" variant="inline" size="small" />}
              options={options}
              selected={selected}
              onSubmit={handleSubmit}
              single={single}
              onScrollBottom={onScrollBottom}
              onSelectChange={onSelectChange}
              onSearchChange={onType}
              notFoundLabel={!loading && inputPlaceholder ? (
                <FormattedMessage
                  id="multiSelectFilter.noResultsMatching"
                  defaultMessage="No results matching {keyword}."
                  description="Label displayed on filter component when no results are found"
                  values={{ keyword: inputPlaceholder }}
                />) : null
              }
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
    </>
  );
};

MultiSelectFilter.defaultProps = {
  error: null,
  allowSearch: true,
  extraInputs: null,
  loading: false,
  selected: [],
  onScrollBottom: null,
  onToggleOperator: null,
  readOnly: false,
  onRemove: null,
  onType: null,
  inputPlaceholder: null,
  oneOption: false,
};

MultiSelectFilter.propTypes = {
  error: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])),
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
  onRemove: PropTypes.func,
  selected: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]),
  onScrollBottom: PropTypes.func,
  onToggleOperator: PropTypes.func,
  readOnly: PropTypes.bool,
  onType: PropTypes.func,
  inputPlaceholder: PropTypes.string,
  oneOption: PropTypes.bool,
};

export default MultiSelectFilter;
