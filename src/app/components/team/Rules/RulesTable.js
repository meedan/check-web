import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SettingsHeader from '../SettingsHeader';
import RulesTableToolbar from './RulesTableToolbar';
import RulesTableHead from './RulesTableHead';
import settingsStyles from '../Settings.module.css';

export default function RulesTable(props) {
  const { rules } = props;
  const rows = rules.map((rule, index) => ({
    name: rule.name,
    updated_at: rule.updated_at,
    actions: rule.actions,
    index,
  }));

  const [selected, setSelected] = React.useState([]);
  const [orderBy, setOrderBy] = React.useState('updated_at');
  const [order, setOrder] = React.useState('asc');

  const handleChange = (event, index) => {
    const newSelected = selected.slice(0);
    if (event.target.checked) {
      newSelected.push(index);
    } else {
      const selectedIndex = selected.indexOf(index);
      newSelected.splice(selectedIndex, 1);
    }
    setSelected(newSelected);
    event.stopPropagation();
  };

  const handleNewRule = () => {
    props.onAddRule();
  };

  const handleClick = (index) => {
    props.onClickRule(index);
  };

  const handleDelete = () => {
    props.onDeleteRules(selected.slice(0));
    setSelected([]);
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const isSelected = index => selected.indexOf(index) !== -1;

  const sortedRows = rows.sort((a, b) => {
    if (orderBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (orderBy === 'updated_at') {
      return a.updated_at > b.updated_at ? -1 : 1;
    }
    return 1;
  });
  if (order === 'desc') {
    sortedRows.reverse();
  }

  return (
    <React.Fragment>
      <SettingsHeader
        title={
          <FormattedMessage
            id="rulesTableToolbar.title"
            defaultMessage="Rules [{rulesCount}]"
            description="Title area for the rules admin section of the settings page"
            values={{ rulesCount: rows.length }}
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/4842057-automation-and-filtering-rules"
        actionButton={
          <ButtonMain
            size="default"
            theme="brand"
            variant="contained"
            className="rules__new-rule"
            onClick={handleNewRule}
            label={
              <FormattedMessage id="rulesTableToolbar.add" defaultMessage="New rule" description="Button label for creating a new rule" />
            }
          />
        }
      />
      <div className={settingsStyles['setting-details-wrapper']}>
        <div className={settingsStyles['setting-content-container']}>
          <RulesTableToolbar
            numSelected={selected.length}
            onDeleteRules={handleDelete}
          />
          <Table size="medium" id="rules-table">
            <RulesTableHead
              order={order}
              orderBy={orderBy}
              onSort={handleSort}
            />
            <TableBody>
              {sortedRows.filter(r => !/add_tag/.test(JSON.stringify(r.actions))).map((row) => {
                const { name, index } = row;
                const isItemSelected = isSelected(index);
                const labelId = `rules-table-checkbox-${index}`;
                const date = new Date(row.updated_at * 1000);

                return (
                  <TableRow
                    hover
                    onClick={() => { handleClick(index); }}
                    key={row.index}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onClick={(event) => { handleChange(event, index); }}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      {name}
                    </TableCell>
                    <TableCell>
                      <time dateTime={date.toISOString()}>
                        <FormattedRelative value={date} />
                      </time>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </React.Fragment>
  );
}

RulesTable.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  onClickRule: PropTypes.func.isRequired,
  onAddRule: PropTypes.func.isRequired,
  onDeleteRules: PropTypes.func.isRequired,
};
