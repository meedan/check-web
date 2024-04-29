import React from 'react';
import FactCheckCell from './FactCheckCell';
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

const projectMedia = {
  feed_columns_values: {
    fact_check_title: 'Fact-check title',
    fact_check_summary: 'Fact-check summary',
    fact_check_url: 'https://fact.check/url',
  },
};

const projectMediaBlank = {
  feed_columns_values: {
    fact_check_title: null,
    fact_check_summary: '',
    fact_check_url: undefined,
  },
};

describe('<FactCheckCell>', () => {
  it('should render title', () => {
    const cell = mountInTable(<FactCheckCell projectMedia={projectMedia} />);
    expect(cell.find('span').text()).toEqual('Fact-check title');
  });

  it('should render description', () => {
    const cell = mountInTable(<FactCheckCell projectMedia={projectMedia} />);
    expect(cell.find('.fact-check-cell__description').text()).toEqual('Fact-check summary');
  });

  it('should link to fact-check', () => {
    const cell = mountInTable(<FactCheckCell projectMedia={projectMedia} />);
    expect(cell.find('a').length).toEqual(1);
  });

  it('should not link to fact-check', () => {
    projectMedia.feed_columns_values.fact_check_url = null;
    const cell = mountInTable(<FactCheckCell projectMedia={projectMedia} />);
    expect(cell.find('a').length).toEqual(0);
  });

  it('should render a "-" instead of blank', () => {
    projectMedia.feed_columns_values.fact_check_url = null;
    const cell = mountInTable(<FactCheckCell projectMedia={projectMediaBlank} />);
    expect(cell.text()).toEqual('-');
  });
});
