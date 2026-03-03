import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CBadge,
  CSpinner,
  CAlert,
} from '@coreui/react'
import { fetchOrders } from '../../services/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetchOrders()
      console.log('Orders response:', response)
      setOrders(response.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '₹0'
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'success', label: 'Completed' },
      pending: { color: 'warning', label: 'Pending' },
      failed: { color: 'danger', label: 'Failed' },
      refunded: { color: 'info', label: 'Refunded' },
    }

    const config = statusConfig[status?.toLowerCase()] || { color: 'secondary', label: status || 'Unknown' }
    return <CBadge color={config.color}>{config.label}</CBadge>
  }

  const getContentTypeBadge = (type) => {
    const typeConfig = {
      'vertical-series': { color: 'primary', label: 'Series' },
      'short-film': { color: 'info', label: 'Short Film' },
    }

    const config = typeConfig[type] || { color: 'secondary', label: type || 'Unknown' }
    return <CBadge color={config.color}>{config.label}</CBadge>
  }

  if (loading) {
    return (
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardBody className="text-center">
              <CSpinner color="primary" />
              <div className="mt-2">Loading orders...</div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Orders Management</strong>
            <small className="ms-2">All orders with payment and content details</small>
          </CCardHeader>
          <CCardBody>
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

            {orders.length === 0 ? (
              <CAlert color="info">No orders found</CAlert>
            ) : (
              <div className="table-responsive">
                <CTable hover bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">Order ID</CTableHeaderCell>
                      <CTableHeaderCell scope="col">User</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Content</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Type</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Amount</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Payment ID</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {orders.map((order) => (
                      <CTableRow key={order.orderId}>
                        <CTableDataCell>
                          <small className="text-muted">{order.orderId.substring(0, 8)}...</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div>
                            <strong>{order.userName}</strong>
                          </div>
                          <small className="text-muted">{order.userEmail}</small>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="d-flex align-items-center">
                            {order.contentThumbnail && (
                              <img
                                src={order.contentThumbnail}
                                alt={order.contentTitle}
                                style={{
                                  width: '50px',
                                  height: '75px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  marginRight: '10px',
                                }}
                              />
                            )}
                            <div>
                              <div>{order.contentTitle}</div>
                              <small className="text-muted">{order.contentId.substring(0, 8)}...</small>
                            </div>
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {getContentTypeBadge(order.contentType)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <strong>{formatCurrency(order.amountINR)}</strong>
                        </CTableDataCell>
                        <CTableDataCell>
                          {getStatusBadge(order.status)}
                        </CTableDataCell>
                        <CTableDataCell>
                          {order.gatewayPaymentId ? (
                            <small className="text-muted">{order.gatewayPaymentId}</small>
                          ) : (
                            <small className="text-muted">—</small>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <small>{formatDate(order.createdAt)}</small>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )}

            <div className="mt-3 text-muted">
              <small>Total orders: {orders.length}</small>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Orders
