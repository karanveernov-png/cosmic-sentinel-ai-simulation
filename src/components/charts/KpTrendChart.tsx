import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatRelativeTime } from '../../utils/time';

interface KpTrendChartProps {
  data: { timestamp: string; kpIndex: number }[];
}

export function KpTrendChart({ data }: KpTrendChartProps) {
  const chartData = data.map((d) => ({ ...d, label: formatRelativeTime(d.timestamp) }));

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="#dce2e3" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: '#87959c', fontSize: 10 }}
          axisLine={{ stroke: '#dce2e3' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[0, 9]}
          tick={{ fill: '#87959c', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: '#ffffff',
            border: '1px solid #c3cccd',
            borderRadius: 6,
            fontSize: 11,
            boxShadow: '0 4px 16px rgba(24, 59, 82, 0.12)',
          }}
          labelStyle={{ color: '#647580' }}
          itemStyle={{ color: '#233746' }}
          formatter={(value) => [typeof value === 'number' ? value.toFixed(1) : String(value), 'Kp Index']}
        />
        <Line type="monotone" dataKey="kpIndex" stroke="#2f716e" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
