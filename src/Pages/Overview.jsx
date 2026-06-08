import React, { useState, useEffect } from 'react';
import { fetchAllOrdersApi, getAllUsersApi } from '../API/api';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Eye,
  Users as UsersIcon,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import './Overview.css';

const monthData = [
  { name: 'Jan', pageViews: 110, sessions: 80 },
  { name: 'Feb', pageViews: 60, sessions: 85 },
  { name: 'Mar', pageViews: 150, sessions: 100 },
  { name: 'Apr', pageViews: 45, sessions: 90 },
  { name: 'May', pageViews: 60, sessions: 85 },
  { name: 'Jun', pageViews: 50, sessions: 70 },
  { name: 'Jul', pageViews: 35, sessions: 80 },
  { name: 'Aug', pageViews: 100, sessions: 95 },
  { name: 'Sep', pageViews: 90, sessions: 80 },
  { name: 'Oct', pageViews: 70, sessions: 85 },
  { name: 'Nov', pageViews: 120, sessions: 100 },
  { name: 'Dec', pageViews: 45, sessions: 80 },
];

const weekData = [
  { name: 'Mon', pageViews: 35, sessions: 30 },
  { name: 'Tue', pageViews: 90, sessions: 60 },
  { name: 'Wed', pageViews: 45, sessions: 40 },
  { name: 'Thu', pageViews: 80, sessions: 55 },
  { name: 'Fri', pageViews: 70, sessions: 50 },
  { name: 'Sat', pageViews: 30, sessions: 25 },
  { name: 'Sun', pageViews: 95, sessions: 70 },
];

const incomeData = [
  { name: 'Mo', income: 48 },
  { name: 'Tu', income: 82 },
  { name: 'We', income: 55 },
  { name: 'Th', income: 32 },
  { name: 'Fr', income: 48 },
  { name: 'Sa', income: 40 },
  { name: 'Su', income: 65 },
];

const recentOrders = [
  { trackingNo: '13256498', name: 'Keyboard', totalOrder: 125, status: 'Rejected', amount: '$70,999' },
  { trackingNo: '13286564', name: 'Computer Accessories', totalOrder: 100, status: 'Approved', amount: '$83,348' },
  { trackingNo: '13306782', name: 'Wireless Mouse', totalOrder: 45, status: 'Approved', amount: '$12,450' },
  { trackingNo: '13409281', name: 'Gaming Monitor', totalOrder: 80, status: 'Pending', amount: '$42,000' },
  { trackingNo: '13429873', name: 'Ergonomic Chair', totalOrder: 20, status: 'Approved', amount: '$15,900' },
];

const Overview = () => {
  const [timeRange, setTimeRange] = useState('Month');
  const [orders, setOrders] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          fetchAllOrdersApi().catch(e => { console.error('Orders fetch failed', e); return { data: [] }; }),
          getAllUsersApi().catch(e => { console.error('Users fetch failed', e); return { data: [] }; })
        ]);
        
        const fetchedOrders = ordersRes.data || [];
        setOrders(fetchedOrders.slice(0, 5));
        setOrdersCount(fetchedOrders.length);
        
        const fetchedUsers = usersRes.data || [];
        setUsersCount(fetchedUsers.length);

        const totalSales = fetchedOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);
        setSalesTotal(totalSales);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      }
    };
    fetchDashboardData();
  }, []);

  const chartData = timeRange === 'Month' ? monthData : weekData;

  return (
    <div className="overview-page animate-fade-in">
      <div className="overview-header">
        <h1>Dashboard</h1>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Page Views</span>
          <div className="metric-value-row">
            <span className="metric-number">4,42,236</span>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> 59.3%
            </span>
          </div>
          <p className="metric-description">
            You made an extra <span className="highlight-text">35,000</span> this year
          </p>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Users</span>
          <div className="metric-value-row">
            <span className="metric-number">{usersCount.toLocaleString()}</span>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> 12.5%
            </span>
          </div>
          <p className="metric-description">
            Active registered users
          </p>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Order</span>
          <div className="metric-value-row">
            <span className="metric-number">{ordersCount.toLocaleString()}</span>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> 8.4%
            </span>
          </div>
          <p className="metric-description">
            Orders placed on the platform
          </p>
        </div>

        <div className="metric-card">
          <span className="metric-label">Total Sales</span>
          <div className="metric-value-row">
            <span className="metric-number">Rs.{salesTotal.toLocaleString()}</span>
            <span className="trend-badge positive">
              <TrendingUp size={12} /> 15.2%
            </span>
          </div>
          <p className="metric-description">
            You made an extra <span className="highlight-text">$20,395</span> this year
          </p>
        </div>
      </div>

      {/* Charts & Table Layout */}
      <div className="dashboard-grid">
        {/* Left Column (Visitor & Orders) */}
        <div className="grid-left-col">
          {/* Unique Visitor Chart Card */}
          <div className="dashboard-card visitor-card">
            <div className="card-header">
              <h2>Unique Visitor</h2>
              <div className="time-toggle-group">
                <button
                  className={`toggle-btn ${timeRange === 'Month' ? 'active' : ''}`}
                  onClick={() => setTimeRange('Month')}
                >
                  Month
                </button>
                <button
                  className={`toggle-btn ${timeRange === 'Week' ? 'active' : ''}`}
                  onClick={() => setTimeRange('Week')}
                >
                  Week
                </button>
              </div>
            </div>

            <div className="chart-container">
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-cyan)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="var(--accent-cyan)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: 'var(--text-primary)', fontSize: 12 }}>
                        {value === 'pageViews' ? 'Page views' : 'Sessions'}
                      </span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="pageViews"
                    stroke="var(--accent-primary)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorViews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--accent-cyan)"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorSessions)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="dashboard-card orders-card">
            <div className="card-header">
              <h2>Recent Orders</h2>
            </div>
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>TRACKING NO.</th>
                    <th>PRODUCT NAME</th>
                    <th className="text-right">TOTAL ORDER</th>
                    <th>STATUS</th>
                    <th className="text-right">TOTAL AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? orders.map((order, idx) => (
                    <tr key={order._id || idx}>
                      <td className="tracking-no">{order.trackingNumber || 'N/A'}</td>
                      <td className="product-name">{order.items && order.items.length > 0 ? order.items[0].name + (order.items.length > 1 ? ` +${order.items.length - 1} more` : '') : 'N/A'}</td>
                      <td className="text-right">{order.items ? order.items.reduce((acc, curr) => acc + curr.quantity, 0) : 0}</td>
                      <td>
                        <span className={`status-badge ${order.status ? order.status.toLowerCase() : 'pending'}`}>
                          <span className="dot" />
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="text-right amount-col">Rs.{(order.grandTotal || 0).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (Income & Analytics) */}
        <div className="grid-right-col">
          {/* Income Overview Card */}
          <div className="dashboard-card income-card">
            <div className="card-header flex-col align-start gap-4">
              <h2 className="subtitle">Income Overview</h2>
              <span className="income-sub-title">This Week Statistics</span>
              <span className="income-amount">$7,650</span>
            </div>

            <div className="chart-container bar-chart-container">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={incomeData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: 'var(--glass-bg)', opacity: 0.5 }}
                    contentStyle={{
                      background: 'var(--card-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Bar
                    dataKey="income"
                    fill="var(--accent-cyan)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Analytics Report Card */}
          <div className="dashboard-card analytics-card">
            <div className="card-header">
              <h2>Analytics Report</h2>
            </div>
            <div className="analytics-list">
              <div className="analytics-item">
                <span className="analytics-label">Company Finance Growth</span>
                <span className="analytics-val positive">+45.14%</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Company Expenses Ratio</span>
                <span className="analytics-val negative">0.58%</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Business Risk Cases</span>
                <span className="analytics-val highlight-val">Low</span>
              </div>
              <div className="analytics-item">
                <span className="analytics-label">Operational Efficiency</span>
                <span className="analytics-val positive">92.4%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
