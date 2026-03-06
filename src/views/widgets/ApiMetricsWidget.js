import React, { useEffect, useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CProgress,
  CButtonGroup,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload } from '@coreui/icons'
import { CChartLine } from '@coreui/react-chartjs'
import { fetchApiMetrics } from '../../services/api'

const ApiMetricsWidget = ({ refreshInterval = 3600000 }) => { // Default: 1 hour
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    successRequests: 0,
    successRate: 0,
    errors: { '4xx': 0, '5xx': 0, total: 0 },
    averageLatency: 0,
  })
  const [period, setPeriod] = useState('24h')
  const [loading, setLoading] = useState(true)

  const loadMetrics = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchApiMetrics(period)
      setMetrics(data)
    } catch (error) {
      console.error('Failed to load API metrics:', error)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadMetrics()

    // Refresh metrics at the specified interval
    const interval = setInterval(loadMetrics, refreshInterval)
    return () => clearInterval(interval)
  }, [loadMetrics, refreshInterval])

  const handleRefresh = () => {
    loadMetrics()
  }

  const getSuccessRateColor = (rate) => {
    if (rate >= 95) return 'success'
    if (rate >= 90) return 'warning'
    return 'danger'
  }

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <strong>API Performance Metrics</strong>
          <div className="d-flex gap-2">
            <CButton
              color="outline-secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              title="Refresh metrics"
            >
              <CIcon icon={cilReload} size="sm" />
            </CButton>
            <CButtonGroup size="sm">
            <CButton
              color="outline-primary"
              active={period === '1h'}
              onClick={() => setPeriod('1h')}
            >
              1H
            </CButton>
            <CButton
              color="outline-primary"
              active={period === '24h'}
              onClick={() => setPeriod('24h')}
            >
              24H
            </CButton>
            <CButton
              color="outline-primary"
              active={period === '7d'}
              onClick={() => setPeriod('7d')}
            >
              7D
            </CButton>
            <CButton
              color="outline-primary"
              active={period === '30d'}
              onClick={() => setPeriod('30d')}
            >
              30D
            </CButton>
          </CButtonGroup>
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        {loading ? (
          <div className="text-center">Loading metrics...</div>
        ) : (
          <CRow>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-info py-1 px-3">
                <div className="text-body-secondary text-truncate small">Total Requests</div>
                <div className="fs-5 fw-semibold">{metrics.totalRequests.toLocaleString()}</div>
              </div>
            </CCol>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-success py-1 px-3">
                <div className="text-body-secondary text-truncate small">Success Rate</div>
                <div className="fs-5 fw-semibold">
                  {metrics.successRate.toFixed(1)}%
                  <CProgress
                    color={getSuccessRateColor(metrics.successRate)}
                    value={metrics.successRate}
                    className="mt-1"
                    style={{ height: '4px' }}
                  />
                </div>
              </div>
            </CCol>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-warning py-1 px-3">
                <div className="text-body-secondary text-truncate small">4xx Errors</div>
                <div className="fs-5 fw-semibold">{metrics.errors['4xx'].toLocaleString()}</div>
              </div>
            </CCol>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-danger py-1 px-3">
                <div className="text-body-secondary text-truncate small">5xx Errors</div>
                <div className="fs-5 fw-semibold">{metrics.errors['5xx'].toLocaleString()}</div>
              </div>
            </CCol>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-primary py-1 px-3">
                <div className="text-body-secondary text-truncate small">Success Requests</div>
                <div className="fs-5 fw-semibold">{metrics.successRequests.toLocaleString()}</div>
              </div>
            </CCol>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-secondary py-1 px-3">
                <div className="text-body-secondary text-truncate small">Avg Latency</div>
                <div className="fs-5 fw-semibold">{metrics.averageLatency}ms</div>
              </div>
            </CCol>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-dark py-1 px-3">
                <div className="text-body-secondary text-truncate small">Total Errors</div>
                <div className="fs-5 fw-semibold">{metrics.errors.total.toLocaleString()}</div>
              </div>
            </CCol>
            <CCol xs={12} md={6} lg={3} className="mb-3">
              <div className="border-start border-start-4 border-start-info py-1 px-3">
                <div className="text-body-secondary text-truncate small">Error Rate</div>
                <div className="fs-5 fw-semibold">
                  {metrics.totalRequests > 0
                    ? ((metrics.errors.total / metrics.totalRequests) * 100).toFixed(2)
                    : 0}
                  %
                </div>
              </div>
            </CCol>
          </CRow>
        )}
      </CCardBody>
    </CCard>
  )
}

ApiMetricsWidget.propTypes = {
  refreshInterval: PropTypes.number, // Refresh interval in milliseconds
}

export default ApiMetricsWidget
