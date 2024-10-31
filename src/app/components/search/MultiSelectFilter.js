import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Popover from '@material-ui/core/Popover';
import cx from 'classnames/bind';
import RemoveableWrapper from './RemoveableWrapper';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import MultiSelector from '../layout/MultiSelector';
import Loader from '../cds/loading/Loader';
import AddIcon from '../../icons/add.svg';
import CloseIcon from '../../icons/clear.svg';
import ErrorOutlineIcon from '../../icons/error_outline.svg';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import styles from './search.module.css';

const OperatorToggle = ({ onClick, operator }) => (
  <ButtonMain
    className="int-multi-select-filter__button--operator-toggle"
    customStyle={{ color: 'var(--color-gray-15' }}
    disabled={!onClick}
    label={operator === 'and' ? <FormattedMessage defaultMessage="and" description="Logical operator to be applied when filtering by multiple tags" id="search.and" /> : <FormattedMessage defaultMessage="or" description="Logical operator to be applied when filtering by multiple tags" id="search.or" />}
    size="small"
    theme="text"
    variant="text"
    onClick={onClick}
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
            arrow
            title={
              <FormattedMessage defaultMessage="Remove filter condition" description="Tooltip to tell the user they can add remove the argument to the filter they are interacting with" id="filter.removeFilterCondition" />
            }
          >
            <span>
              <ButtonMain
                className="int-multi-select-filter__button--tag-remove"
                iconCenter={<CloseIcon />}
                size="small"
                theme="info"
                variant="contained"
                onClick={onDelete}
              />
            </span>
          </Tooltip>
        )}
      </div>
      :
      <div className={cx('multi-select-filter__tag', styles['filter-value'], styles['filter-value-missing'])} {...props}>
        <span>
          <FormattedMessage defaultMessage="Property deleted" description="Message shown a placeholder when someone tries to filter a search by a property that the user has deleted" id="filter.tag.deleted" />
        </span>
        { readOnly ? null : (
          <CloseIcon className="int-multi-select-filter__icon--tag-remove-missing" onClick={onDelete} />
        )}
      </div>
    }
  </>
);

const MultiSelectFilter = ({
  allowSearch,
  error,
  extraInputs,
  hasMore,
  icon,
  inputPlaceholder,
  label,
  loading,
  onChange,
  onRemove,
  onScrollBottom,
  onSelectChange,
  onToggleOperator,
  onType,
  oneOption,
  operator,
  options,
  readOnly,
  selected,
  single,
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
      <RemoveableWrapper icon={icon} key={version} readOnly={readOnly} onRemove={onRemove}>
        {label &&
          <div className={styles['filter-label']}>
            {label}
          </div>
        }
        { !oneOption && selectedArray.map((value, index) => (
          <React.Fragment key={getLabelForValue(value)}>
            { index > 0 ? (
              <OperatorToggle
                operator={operator}
                onClick={onToggleOperator}
              />
            ) : null }
            <Tag
              label={getLabelForValue(value)}
              readOnly={readOnly}
              onDelete={() => handleTagDelete(value)}
            />
          </React.Fragment>
        )) }
        { !oneOption && selectedArray.length > 0 && showSelect ? (
          <OperatorToggle
            operator={operator}
            onClick={onToggleOperator}
          />
        ) : null }
        { !oneOption && (selectedArray.length === 0 || showSelect) && !readOnly ? (
          <CustomSelectDropdown
            allowSearch={allowSearch}
            hasMore={hasMore}
            inputPlaceholder={inputPlaceholder}
            loading={loading}
            options={options}
            selected={selectedArray}
            single={single}
            onScrollBottom={onScrollBottom}
            onSelectChange={onSelectChange}
            onSubmit={handleSelect}
            onType={onType}
          />
        ) : null }
        { extraInputs }
        { !oneOption && !readOnly && !single ? (
          <Tooltip
            arrow
            title={
              <FormattedMessage defaultMessage="Add filter condition" description="Tooltip to tell the user they can add another argument to the filter they are interacting with" id="filter.addParameter" />
            }
          >
            <span>
              <ButtonMain
                className="int-multi-select-filter__button--add-filter-condition"
                iconCenter={<AddIcon />}
                size="small"
                theme="lightValidation"
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
  inputPlaceholder,
  loading,
  onScrollBottom,
  onSelectChange,
  onSubmit,
  onType,
  options,
  selected,
  single,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSubmit = (value) => {
    setAnchorEl(null);
    onSubmit(value);
  };

  return (
    <>
      <ButtonMain
        className="int-multi-select-filter__button--select-dropdown"
        iconRight={<KeyboardArrowDownIcon />}
        label={
          <FormattedMessage
            defaultMessage="Select"
            description="Verb. Label for generic dropdown component"
            id="customAutocomplete.select"
          />
        }
        size="small"
        theme="text"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <FormattedMessage defaultMessage="Search…" description="Placeholder text for search input" id="multiSelector.search">
          {placeholder => (
            <MultiSelector
              allowSearch={allowSearch}
              hasMore={hasMore}
              inputPlaceholder={inputPlaceholder || placeholder}
              loadingIcon={loading && <Loader size="small" theme="grey" variant="inline" />}
              notFoundLabel={!loading && inputPlaceholder ? (
                <FormattedMessage
                  defaultMessage="No results matching {keyword}."
                  description="Label displayed on filter component when no results are found"
                  id="multiSelectFilter.noResultsMatching"
                  values={{ keyword: inputPlaceholder }}
                />) : null
              }
              options={options}
              selected={selected}
              single={single}
              submitLabel={
                <FormattedMessage
                  defaultMessage="Done"
                  description="Label for closing dropdown when user is done selecting tags"
                  id="customAutocomplete.done"
                />
              }
              onScrollBottom={onScrollBottom}
              onSearchChange={onType}
              onSelectChange={onSelectChange}
              onSubmit={handleSubmit}
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
  onChange: () => {},
  onRemove: null,
  onType: null,
  inputPlaceholder: null,
  oneOption: false,
};

MultiSelectFilter.propTypes = {
  allowSearch: PropTypes.bool,
  error: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])),
  extraInputs: PropTypes.node,
  icon: PropTypes.element.isRequired,
  inputPlaceholder: PropTypes.string,
  label: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  oneOption: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])).isRequired,
  readOnly: PropTypes.bool,
  selected: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]),
  onChange: PropTypes.func,
  onRemove: PropTypes.func,
  onScrollBottom: PropTypes.func,
  onToggleOperator: PropTypes.func,
  onType: PropTypes.func,
};

export default MultiSelectFilter;
