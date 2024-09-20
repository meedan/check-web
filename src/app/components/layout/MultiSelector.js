import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Radio from '@material-ui/core/Radio';
import InfiniteScroll from 'react-infinite-scroller';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import SearchIcon from '../../icons/search.svg';
import styles from './MultiSelector.module.css';

class MultiSelector extends React.Component {
  constructor(props) {
    super(props);
    const defaultSelected = props.defaultAllSelected
      ? props.options.filter(o => o.value !== '').map(o => o.value)
      : props.defaultValue;

    const parents = props.options.filter(o => o.hasChildren).map(o => o.value);
    const selectedParents = props.selected.filter(p => parents.includes(p));
    const childrenOfSelectedParents = props.options.filter(o => selectedParents.includes(o.parent)).map(o => o.value);
    const selected = props.selected.length ? props.selected.concat(childrenOfSelectedParents) : defaultSelected;

    this.state = {
      selected: [...new Set(selected)], // Removes duplicate values
      filter: '',
    };
  }

  handleChange = (e) => {
    this.setState({ filter: e.target.value });
    if (this.props.onSearchChange) {
      this.props.onSearchChange(e.target.value);
    }
  };

  handleSelectCheckbox = (e, inputChecked) => {
    if (inputChecked) {
      this.addItem(e.target.id);
    } else {
      this.removeItem(e.target.id);
    }
  };

  handleSelectRadio = (e, inputChecked) => {
    let selected = null;
    if (inputChecked) {
      selected = e.target.id;
    } else {
      selected = null;
    }
    this.setState({ selected }, () => {
      if (this.props.onSelectChange) {
        this.props.onSelectChange(selected);
      }
    });
  };

  handleToggleAll = () => {
    if (this.isAllSelected()) {
      this.setState({ selected: [] });
    } else {
      this.setState({
        selected: this.props.options
          .filter(o => o.value !== '')
          .map(o => o.value),
      });
    }
  };

  handleReset = () => {
    this.setState({ selected: this.props.defaultValue });
  };

  addItem = (value) => {
    let selected = [...this.state.selected];
    selected.push(value);

    this.props.options.forEach((o) => {
      if (o.parent === value && !selected.includes(o.value)) {
        selected.push(o.value);
      }
    });

    const valueOption = this.props.options.find(o => o.value === value);

    if (valueOption.exclusive) {
      selected = [value];
    } else {
      this.props.options.forEach((o) => {
        if (o.exclusive) {
          const exclusiveIndex = selected.indexOf(o.value);
          if (exclusiveIndex > -1) selected.splice(exclusiveIndex, 1);
        }
      });
    }

    // add parent item if all children selected
    if (valueOption.parent) {
      const parentIndex = selected.indexOf(valueOption.parent);
      if (parentIndex === -1) {
        const childrenValues = this.props.options.filter(o => o.parent === valueOption.parent).map(o => o.value);
        const mixedSet = new Set([...selected, ...childrenValues]);
        if (mixedSet.size === selected.length) selected.push(valueOption.parent);
      }
    }

    this.setState({ selected }, () => {
      if (this.props.onSelectChange) {
        this.props.onSelectChange(selected);
      }
    });
  };

  removeItem = (value) => {
    const selected = [...this.state.selected];

    // Remove item
    const index = selected.indexOf(value);
    if (index > -1) selected.splice(index, 1);

    const valueOption = this.props.options.find(o => o.value === value);

    // If it's a parent remove all its children
    if (valueOption.hasChildren) {
      this.props.options.forEach((o) => {
        if (o.parent === value) {
          const childIndex = selected.indexOf(o.value);
          if (childIndex > -1) selected.splice(childIndex, 1);
        }
      });
    // If it's a child remove its parent
    } else if (valueOption.parent) {
      const parentIndex = selected.indexOf(valueOption.parent);
      if (parentIndex > -1) selected.splice(parentIndex, 1);
    }

    this.setState({ selected }, () => {
      if (this.props.onSelectChange) {
        this.props.onSelectChange(selected);
      }
    });
  };

  filter = (options) => {
    const { filter } = this.state;
    if (filter) {
      return options.filter(o => Object.values(o).join(' ').toLowerCase().includes(filter.toLowerCase()));
    }
    return options;
  };

  isAllSelected = () => {
    const filteredOptions = this.props.options.filter(o => o.value !== '');
    return (this.state.selected.length === filteredOptions.length);
  };

  render() {
    const {
      hasMore,
      onDismiss,
      onScrollBottom,
      onSubmit,
    } = this.props;

    const options = this.filter(this.props.options);
    const disableReset = (
      (this.props.single && this.state.selected === this.props.defaultValue) ||
      (!this.props.single && JSON.stringify(this.state.selected.sort()) === JSON.stringify(this.props.defaultValue.sort()))
    );

    return (
      <div className={styles['multiselector-wrapper']}>
        <div className={styles['multiselector-controls']}>
          { this.props.allowSearch &&
            <>
              <TextField
                className={cx('int-multiselector__search--input', styles['multiselector-search-input'])}
                iconLeft={<SearchIcon />}
                placeholder={this.props.inputPlaceholder}
                onChange={this.handleChange}
              />
              { this.props.actionButton }
            </>
          }
          { this.props.allowToggleAll &&
            <div className={styles['multiselector-reset']}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.isAllSelected()}
                    id="multiselector__select-all"
                    onChange={this.handleToggleAll}
                  />
                }
                label={this.props.toggleAllLabel}
              />
              { this.props.resetLabel &&
                <ButtonMain
                  className="int-multiselector__button--reset"
                  disabled={disableReset}
                  label={this.props.resetLabel}
                  onClick={this.handleReset}
                />
              }
            </div>
          }
        </div>
        { this.props.loadingIcon &&
          <div className={styles['multiselector-scroller-loader']}>
            { this.props.loadingIcon }
          </div>
        }
        <div className={styles['multiselector-scroller']}>
          <InfiniteScroll
            hasMore={hasMore}
            initialLoad={false}
            loadMore={onScrollBottom}
            threshold={32}
            useWindow={false}
          >
            <FormGroup>
              {
                options.map((o, index) => {
                  if (o.value === '' && o.label === '') {
                    return (
                      <hr key={`multiselector-divider-${index.toString()}`} />
                    );
                  }
                  if (o.value === '') {
                    return (
                      <span className={styles['list-item-category']} key={`multiselector-header-${index.toString()}`}>
                        {o.label}
                      </span>
                    );
                  }
                  const icons = {};
                  if (o.icon) icons.icon = o.icon;
                  if (o.checkedIcon) icons.checkedIcon = o.checkedIcon;

                  return (
                    <FormControlLabel
                      className={o.parent ? styles['list-item-child'] : ''}
                      control={this.props.single ?
                        <Radio
                          checked={this.state.selected === o.value}
                          id={o.value}
                          onChange={this.handleSelectRadio}
                          {...icons}
                        /> :
                        <Checkbox
                          checked={this.state.selected.indexOf(o.value) > -1}
                          id={o.value}
                          onChange={this.handleSelectCheckbox}
                          {...icons}
                        />
                      }
                      key={`multiselector-option-${index.toString()}`}
                      label={<span style={{ color: o.color }}>{o.label}</span>}
                    />
                  );
                })
              }
              { options.length < 1 &&
                <div className={styles['not-found']}>
                  { this.props.notFoundLabel }
                </div>
              }
            </FormGroup>
          </InfiniteScroll>
        </div>
        { this.props.children }
        <div className={styles['multiselector-footer']}>
          { onDismiss && this.props.cancelLabel &&
            <ButtonMain
              className="int-multiselector__button--cancel"
              label={this.props.cancelLabel}
              size="default"
              theme="text"
              variant="text"
              onClick={onDismiss}
            />
          }
          <ButtonMain
            className="int-multiselector__button--save"
            label={this.props.submitLabel}
            size="default"
            theme="info"
            variant="contained"
            onClick={() => onSubmit(this.state.selected)}
          />
        </div>
      </div>
    );
  }
}

MultiSelector.defaultProps = {
  actionButton: null,
  allowSearch: false,
  allowToggleAll: false,
  cancelLabel: '',
  children: null,
  defaultAllSelected: false,
  defaultValue: [],
  disableReset: false,
  inputPlaceholder: null,
  loadingIcon: null,
  notFoundLabel: '',
  onDismiss: null,
  onScrollBottom: () => {},
  onSearchChange: null,
  onSelectChange: null,
  toggleAllLabel: null,
  resetLabel: null,
};

MultiSelector.propTypes = {
  actionButton: PropTypes.node,
  allowSearch: PropTypes.bool,
  allowToggleAll: PropTypes.bool,
  cancelLabel: PropTypes.node,
  children: PropTypes.node,
  defaultAllSelected: PropTypes.bool,
  defaultValue: PropTypes.array,
  disableReset: PropTypes.bool,
  inputPlaceholder: PropTypes.string,
  loadingIcon: PropTypes.node,
  notFoundLabel: PropTypes.node,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string,
    parent: PropTypes.string,
  })).isRequired,
  resetLabel: PropTypes.node,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  submitLabel: PropTypes.node.isRequired,
  toggleAllLabel: PropTypes.node,
  onDismiss: PropTypes.func,
  onScrollBottom: PropTypes.func,
  onSearchChange: PropTypes.func,
  onSelectChange: PropTypes.func,
  onSubmit: PropTypes.func.isRequired,
};

export default MultiSelector;
