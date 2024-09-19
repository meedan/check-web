import React from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

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

  // TODO:
  // - Title spacing 16px
  // - Customize and style Y-axis labels (number [body-2 bold], name [body-2 regular])
  // - White background container, padding 16px
  // - Min width 250px

  return (
    <div style={{ height, width }}>
      <div className="typography-subtitle2">
        {title}
      </div>
      <ResponsiveContainer>
        <BarChart data={coloredData} layout="vertical">
          <Bar dataKey="value" radius={[0, 50, 50, 0]} />
          <XAxis
            axisLine={false}
            hide
            type="number"
          />
          <YAxis
            axisLine={false}
            dataKey="name"
            tickLine={false}
            type="category"
          />
          <Tooltip />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

VerticalBarChartWidget.defaultProps = {
  height: 200,
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
