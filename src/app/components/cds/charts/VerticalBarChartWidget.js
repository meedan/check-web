import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import styles from './VerticalBarChartWidget.module.css';

const VerticalBarChartWidget = ({
  data,
  height,
  title,
  width,
}) => {
  const colors = [
    'var(--color-blue-54)',
    'var(--color-orange-54)',
    'var(--color-green-50)',
    'var(--color-purple-61)',
    'var(--color-yellow-47)',
    'var(--color-pink-53)',
    'var(--color-gray-42)',
  ];

  const coloredData = data.map((d, i) => ({
    ...d,
    fill: d.color || colors[i % colors.length],
  }));

  const spacingHeight = 48;

  const dataHeight = data.length * 36;
  const dataSum = data.reduce((acc, d) => acc + d.value, 0);

  const CustomTick = ({ payload, x, y }) => (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={6}
        fill="var(--color-gray-15)"
        fontSize="14px"
        textAnchor="end"
        x={0}
        y={0}
      >
        <tspan fontWeight="bold">{data[payload.index].value}</tspan>
        {` ${payload.value}`}
      </text>
    </g>
  );

  return (
    <div
      className={styles.verticalBarChartWidgetWrapper}
      style={{
        height: height || dataHeight + spacingHeight,
        width,
      }}
    >
      <div className={styles.verticalBarChartWidgetTitle}>
        {`${title} [${dataSum}]`}
      </div>
      <ResponsiveContainer>
        <BarChart
          data={coloredData}
          layout="vertical"
          margin={{ left: 80 }}
        >
          <Bar dataKey="value" radius={[0, 10, 10, 0]} />
          <XAxis
            axisLine={false}
            hide
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="name"
            tick={<CustomTick />}
            tickLine={false}
            type="category"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

VerticalBarChartWidget.defaultProps = {
  height: null,
  width: '100%',
};

VerticalBarChartWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    value: PropTypes.number,
  })).isRequired,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default VerticalBarChartWidget;
