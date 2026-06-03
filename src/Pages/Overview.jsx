import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Users as UsersIcon, 
  ShoppingBag, 
  DollarSign, 
  Eye 
} from 'lucide-react';
import './Overview.css';

const data = [
  { name: 'Jan', revenue: 20 },
  { name: 'Feb', revenue: 85 },
  { name: 'Mar', revenue: 90 },
  { name: 'Apr', revenue: 45 },
  { name: 'May', revenue: 45 },
  { name: 'Jun', revenue: 80 },
  { name: 'Jul', revenue: 35 },
  { name: 'Aug', revenue: 18 },
  { name: 'Sep', revenue: 85 },
  { name: 'Oct', revenue: 98 },
  { name: 'Nov', revenue: 78 },
  { name: 'Dec', revenue: 65 },
];

const topPerformers = [
  { id: 1, name: 'Sonic Bass Pro', sub: 'ID: #s-2900', rank: 1, sold: '1.2K' },
  { id: 2, name: 'Velocity Runner', sub: 'ID: #s-2890', rank: 2, sold: '980' },
  { id: 3, name: 'Zenith Watch', sub: 'ID: #s-2720', rank: 3, sold: '420' },
];

const StatCard = ({ title, value, percentage, icon, color, trendUp }) => (
  <div className="stat-card glass-card">
    <div className="stat-card-header">
      <div className="stat-icon" style={{ backgroundColor: `${color}20`, color: color }}>
        {icon}
      </div>
    </div>
    <div className="stat-card-body">
      <span className="stat-title">{title}</span>
      <h2 className="stat-value">{value}</h2>
    </div>
    <div className="stat-card-footer">
      <span className={`stat-trend ${trendUp ? 'up' : 'down'}`}>
        <TrendingUp size={14} style={{ transform: trendUp ? 'none' : 'rotate(180deg)' }} />
        {percentage}%
      </span>
    </div>
  </div>
);

const Overview = () => {
  return (
    <div className="overview-page animate-fade-in">
      <div className="page-header">
        <h1>Overview</h1>
        <p className="text-secondary">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="TOTAL REVENUE" 
          value="$128.4K" 
          percentage="15.3" 
          icon={<DollarSign size={20} />} 
          color="var(--accent-cyan)" 
          trendUp={true}
        />
        <StatCard 
          title="TOTAL ORDERS" 
          value="3,240" 
          percentage="2.4" 
          icon={<ShoppingBag size={20} />} 
          color="var(--accent-pink)" 
          trendUp={true}
        />
        <StatCard 
          title="VISITS" 
          value="84.2K" 
          percentage="8.1" 
          icon={<Eye size={20} />} 
          color="var(--accent-yellow)" 
          trendUp={true}
        />
        <StatCard 
          title="NET PROFIT" 
          value="$42.8K" 
          percentage="3.3" 
          icon={<TrendingUp size={20} />} 
          color="var(--accent-purple)" 
          trendUp={true}
        />
      </div>

      <div className="analytics-grid">
        <div className="analytics-card glass-card chart-section">
          <div className="card-header">
            <h2>REVENUE ANALYTICS</h2>
            <div className="chart-filter">
              <span>This year</span>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--accent-cyan)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card glass-card performers-section">
          <div className="card-header">
            <h2>TOP PERFORMERS</h2>
            <p className="text-muted">By units sold this month.</p>
          </div>
          <div className="performers-list">
            {topPerformers.map((item) => (
              <div key={item.id} className="performer-item">
                <div className="performer-info">
                  <span className="performer-name">{item.name}</span>
                  <span className="performer-id">{item.sub}</span>
                </div>
                <div className="performer-rank">
                  <span className="rank-num">{item.rank}</span>
                </div>
                <div className="performer-stats">
                  <span className="sold-count">{item.sold}</span>
                  <span className="sold-label">SOLD</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-orders glass-card">
        <div className="card-header">
          <h2>RECENT ORDERS</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>ORDER ID</th>
              <th>PRODUCT</th>
              <th>DATE</th>
              <th>CUSTOMER</th>
              <th>AMOUNT</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#7821</td>
              <td>Sonic Bass Pro</td>
              <td>October 24, 2025</td>
              <td>Jane Cooper</td>
              <td>$149.00</td>
              <td><span className="status-badge completed">Completed</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Overview;
