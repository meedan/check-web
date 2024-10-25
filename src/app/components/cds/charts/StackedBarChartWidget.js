import React from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styles from './StackedBarChartWidget.module.css';

const StackedBarChartWidget = ({
  data,
  height,
  intl,
  title,
  width,
}) => {
  if (!data) return null;

  const colors = [
    'var(--color-blue-54)',
    'var(--color-orange-54)',
    'var(--color-green-50)',
    'var(--color-purple-61)',
    'var(--color-yellow-47)',
    'var(--color-pink-53)',
    'var(--color-gray-42)',
  ];

  const dataSum = data.reduce((acc, d) => (d.name === 'empty' ? acc : acc + d.value), 0);

  if (dataSum === 0 && !data.some(d => d.name === 'empty')) {
    data.push({ name: 'empty', value: 1 });
  }

  const coloredData = data.map((d, i) => ({
    ...d,
    fill: d.name === 'empty' ? 'var(--color-gray-88)' : (d.color || colors[i % colors.length]),
  }));

  const barChartData = { name: 'Data' };

  coloredData.forEach((d) => {
    barChartData[d.name] = d.value;
  });

  const getBarRadius = (i, length) => {
    if (length === 1 || dataSum === 0) return [50, 50, 50, 50];
    if (i === 0) return [50, 0, 0, 50];
    if (i === length - 1) return [0, 50, 50, 0];
    return [0, 0, 0, 0];
  };

  const [mouseOverBar, setMouseOverBar] = React.useState(null);

  const CustomTooltip = ({ active, payload }) => {
    if (
      mouseOverBar === 'empty' ||
      !mouseOverBar ||
      !active ||
      !payload ||
      !payload.length
    ) return null;

    const value = payload[0].payload[mouseOverBar];

    return (
      <div
        style={{
          backgroundColor: 'var(--color-white-100)',
          border: 'solid 1px var(--color-purple-61)',
          borderRadius: '4px',
          color: 'var(--color-gray-15)',
          padding: '4px 8px',
        }}
      >
        <strong>{intl?.formatNumber(value) || value}</strong>{` ${mouseOverBar}`}
      </div>
    );
  };

  return (
    <div
      className={styles.stackedBarChartWidgetWrapper}
      style={{ height, width }}
    >
      <div className={styles.stackedBarChartWidgetTitle}>
        {`${title} [${intl?.formatNumber(dataSum) || dataSum}]`}
      </div>
      <ResponsiveContainer height={48}>
        <BarChart
          data={[barChartData]}
          layout="vertical"
        >
          { coloredData.map((d, i) => (
            <Bar
              barSize={16}
              dataKey={d.name}
              fill={d.fill}
              key={d.name}
              radius={getBarRadius(i, coloredData.length)}
              stackId={1}
              onMouseEnter={() => setMouseOverBar(d.name)}
              onMouseLeave={() => setMouseOverBar(null)}
            />
          ))}
          <XAxis domain={[0, dataSum]} hide type="number" />
          <YAxis dataKey="name" hide type="category" />
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
            isAnimationActive={false}
          />
        </BarChart>
        <div className={styles.legend}>
          { coloredData.filter(d => d.name !== 'empty').map(d => (
            <div className={styles.legendItem} key={d.name}>
              <strong>{intl?.formatNumber(d.value) || d.value}</strong>{` ${d.name}`}
            </div>
          ))}
        </div>
      </ResponsiveContainer>
    </div>
  );
};

StackedBarChartWidget.defaultProps = {
  data: [],
  height: 144,
  width: '100%',
};

StackedBarChartWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number,
  })),
  height: PropTypes.number,
  title: PropTypes.string.isRequired,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export { StackedBarChartWidget }; // eslint-disable-line import/no-unused-modules

export default injectIntl(StackedBarChartWidget);
