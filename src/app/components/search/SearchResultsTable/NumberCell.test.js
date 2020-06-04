/* global describe, expect, it */
import React from 'react';
import NumberCell from './NumberCell';
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

describe('<NumberCell>', () => {
  it('should show demand', () => {
    const cell = mountInTable(<NumberCell value={1} />);
    expect(cell.find('td').text()).toEqual('1');
  });

  it('should format numbers', () => {
    const cell = mountInTable(<NumberCell value={1234} />);
    expect(cell.find('td').text()).toEqual('1,234');
  });

  it('should display 0', () => {
    const cell = mountInTable(<NumberCell value={0} />);
    expect(cell.html()).toMatch(/>0</);
    expect(cell.find('td').text()).toEqual('0');
  });

  it('should hide null', () => {
    const cell = mountInTable(<NumberCell value={null} />);
    expect(cell.find('td').text()).toEqual('');
  });
});
