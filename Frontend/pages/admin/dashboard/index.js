import React from "react";
import { connect } from "react-redux";
import { Row, Col, Progress } from "reactstrap";
import dynamic from 'next/dynamic';
import { withRouter } from "next/router";
import axios from "axios";
const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

import SimpleLine from './widget';
import Head from 'next/head';
import HomePageWidget from "../widgets/HomePageWidget";

import s from "./Dashboard.module.scss";
import formatCurrency from "utils/formatCurrency";

const STATUS_COLORS = {
  pending: "secondary",
  confirmed: "info",
  processing: "warning",
  shipping: "primary",
  delivered: "success",
  cancelled: "danger",
};

const DONUT_COLORS = ["#745FF9", "#E74A4B", "#FF943B", "#5EC992", "#4392D5"];

class Index extends React.Component {

    state = {
      stats: null,
      loading: true,
    };

  componentDidMount() {
    typeof window !== 'undefined' && window.addEventListener("resize", this.forceUpdate);
    this.fetchStats();
  }

  forceUpdate = () => {
    return this.setState({});
  }

  fetchStats = () => {
    axios
      .get("/dashboard/stats", { params: { days: 14 } })
      .then((res) => this.setState({ stats: res.data, loading: false }))
      .catch(() => this.setState({ loading: false }));
  };

  formatMoney = (value) => formatCurrency(value);

  render() {
    const { stats, loading } = this.state;
    const revenueTrend = (stats && stats.revenueTrend) || [];
    const ordersByStatus = (stats && stats.ordersByStatus) || {};
    const topProducts = (stats && stats.topProducts) || [];
    const totalOrdersForStatus = Object.values(ordersByStatus).reduce((a, b) => a + b, 0);

    const revenueChartOptions = {
      chart: { height: 350, type: "area", toolbar: { show: false } },
      colors: ["#7E72F2"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 3 },
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05 } },
      grid: { borderColor: 'rgba(196, 196, 196, 0.2)' },
      xaxis: {
        categories: revenueTrend.map((d) => d.date && d.date.slice(5)),
        labels: { style: { colors: revenueTrend.map(() => "rgba(18, 4, 0, .5)"), fontWeight: 300 } },
      },
      yaxis: { labels: { formatter: (v) => formatCurrency(v) } },
      tooltip: { y: { formatter: (v) => formatCurrency(v) } },
    };
    const revenueChartSeries = [{ name: "Revenue", data: revenueTrend.map((d) => Number(d.revenue) || 0) }];

    const donutOptions = {
      chart: { type: 'donut' },
      colors: DONUT_COLORS,
      labels: topProducts.map((p) => p.productName),
      stroke: { show: false, width: 0 },
      plotOptions: { pie: { donut: { size: '45%' } } },
      dataLabels: { dropShadow: { enabled: false } },
      legend: { show: false },
      responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
    };

      return (
        <>
        <Head>
          <title>Ecommerce dashboard</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta charSet="utf-8" />
        </Head>
        <div className={s.root}>
          <h1 className="page-title">
            Welcome,{" "}
            {this.props.currentUser
              ? this.props.currentUser.firstName || "User"
              : "User"}
            ! <br />
            <small>
              <small>
                Your role is{" "}
                {this.props.currentUser && this.props.currentUser.role}
              </small>
            </small>
          </h1>
          <Row>
            <Col lg={3}>
              <SimpleLine
                color="#5EC992"
                title={stats ? this.formatMoney(stats.totalRevenue) : "..."}
                subtitle="Total Revenue"
                trend={revenueTrend.map((d) => Number(d.revenue) || 0)}
              />
            </Col>
            <Col lg={3}>
              <SimpleLine
                color="#4392D5"
                title={stats ? stats.totalOrders : "..."}
                subtitle="Total Orders"
                trend={revenueTrend.map((d) => Number(d.orderCount) || 0)}
              />
            </Col>
            <Col lg={3}>
              <div className={s.dashboardWidgetWrapper}>
                <h4 className={s.widgetTitle}>{stats ? stats.totalProducts : "..."}</h4>
                <span className={s.widgetSubtitle}>Active Products</span>
              </div>
            </Col>
            <Col lg={3}>
              <div className={s.dashboardWidgetWrapper}>
                <h4 className={s.widgetTitle}>{stats ? stats.totalCustomers : "..."}</h4>
                <span className={s.widgetSubtitle}>Total Customers</span>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className={s.dashboardWidgetWrapper}>
                <h3 className={s.widgetMainTitle} style={{ paddingLeft: 25 }}>Revenue (last 14 days)</h3>
                {!loading && (
                  <ApexChart
                    className="sparkline-chart"
                    series={revenueChartSeries}
                    options={revenueChartOptions}
                    type={"area"}
                    height={"350px"}
                  />
                )}
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={6} xs={12}>
              <div className={`${s.widgetPadding} ${s.dashboardWidgetWrapper}`}>
                <h3 className={s.widgetMainTitle}>Orders by Status</h3>
                {Object.keys(ordersByStatus).length === 0 ? (
                  <p className={"text-muted mt-3"}>No orders yet.</p>
                ) : (
                  Object.entries(ordersByStatus).map(([status, count]) => {
                    const pct = totalOrdersForStatus > 0 ? Math.round((count / totalOrdersForStatus) * 100) : 0;
                    return (
                      <div className={s.progressItemWrap} key={status}>
                        <div className={s.flexItem} style={{ marginTop: 20 }}>
                          <div className={s.leftSide}>
                            <h6 className={"text-capitalize"}>{status}</h6>
                            <span>{pct}%</span>
                          </div>
                          <div className={s.rightSide}>
                            <h6>{count}</h6>
                          </div>
                        </div>
                        <Progress
                          value={pct}
                          color={STATUS_COLORS[status] || "primary"}
                          className={"progress-xs"}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </Col>
            <Col md={6} xs={12}>
            <div className={`${s.widgetPadding} ${s.dashboardWidgetWrapper}`}>
              <h3 className={s.widgetMainTitle}>Top Products by Revenue</h3>
              {topProducts.length === 0 ? (
                <p className={"text-muted mt-3"}>No sales yet.</p>
              ) : (
                <>
                  {!loading && (
                    <ApexChart
                      className="sparkline-chart"
                      type={"donut"}
                      height={180}
                      series={topProducts.map((p) => Number(p.revenue) || 0)}
                      options={donutOptions}
                    />
                  )}
                  {topProducts.map((p, idx) => (
                    <Col sm={12} key={p.productId}>
                      <div className={s.pieElements} style={{ position: "relative", paddingLeft: 20 }}>
                        <h5 className={"mt-2 mb-1"}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              borderRadius: "50%",
                              backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length],
                              marginRight: 8,
                            }}
                          />
                          {p.productName}
                        </h5>
                        <p className={s.piePercent}>{this.formatMoney(p.revenue)} ({p.quantitySold} sold)</p>
                      </div>
                    </Col>
                  ))}
                </>
              )}
            </div>
            </Col>
          </Row>
          <Row>
            <Col lg={9}>
              <HomePageWidget />
            </Col>
          </Row>
        </div>
        </>
    )
  }
}

function mapStateToProps(store) {
  return {
    currentUser: store.auth.currentUser,
    loadingInit: store.auth.loadingInit,
  };
}

export async function getServerSideProps(context) {
  return {
    props: {  },
  };
}

export default connect(mapStateToProps)(withRouter(Index));
