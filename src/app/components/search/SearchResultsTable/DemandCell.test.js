import React from 'react';
import DemandCell from './DemandCell';
import { mountWithIntlProvider } from '../../../../../test/unit/helpers/intl-test';

function mountInTable(value) {
  const tree = mountWithIntlProvider((
    <table>
      <tbody>
        <tr>
          {value}
        </tr>
      </tbody>
    </table>
  ));
  return tree.find('tr>*');
}

describe('<DemandCell>', () => {
  it('should show demand', () => {
    const cell = mountInTable(<DemandCell projectMedia={{ list_columns_values: { demand: 1 } }} />);
    expect(cell.find('td').text()).toEqual('1');
  });
});
