/* global describe, expect, it */
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
  it('should show requests_related_count', () => {
    const cell = mountInTable(<DemandCell projectMedia={{ requests_related_count: 1 }} />);
    expect(cell.find('td').text()).toEqual('1');
  });
});
