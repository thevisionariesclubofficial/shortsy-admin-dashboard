import React, { useEffect, useState } from 'react'
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
  CButton,
  CInputGroup,
  CFormInput,
  CPagination,
  CPaginationItem,
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilPeople, cilSearch, cilReload, cilChevronRight, cilChevronBottom } from '@coreui/icons'
import { fetchUsers, fetchRentals, fetchContent } from '../../services/api'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const [expandedRows, setExpandedRows] = useState({})
  const [allRentals, setAllRentals] = useState([])
  const [contentMap, setContentMap] = useState({})
  const usersPerPage = 10

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const [usersData, contentData, rentalsData] = await Promise.all([
        fetchUsers(),
        fetchContent(),
        fetchRentals()
      ])
      setUsers(usersData.users || [])
      setTotalUsers(usersData.users?.length || 0)
      
      // Create content map for quick lookup
      const map = {}
      if (contentData.data) {
        contentData.data.forEach(item => {
          map[item.id] = item
        })
      }
      setContentMap(map)
      
      // Store all rentals
      setAllRentals(rentalsData.rentals || [])
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (userId) => {
    setExpandedRows(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }))
  }
  
  const getUserRentals = (userId) => {
    return allRentals.filter(rental => rental.userId === userId)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.userId?.toLowerCase().includes(searchLower)
    )
  })

  // Paginate filtered users
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleString()
  }

  const getUserStatusBadge = (status) => {
    const statusMap = {
      CONFIRMED: 'success',
      UNCONFIRMED: 'warning',
      FORCE_CHANGE_PASSWORD: 'info',
      RESET_REQUIRED: 'danger',
    }
    return statusMap[status] || 'secondary'
  }

  const getPremiumBadge = (isPremium) => {
    return isPremium ? (
      <CBadge color="warning">Premium</CBadge>
    ) : (
      <CBadge color="secondary">Free</CBadge>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <CIcon icon={cilPeople} className="me-2" />
                <strong>Users Management</strong>
                <CBadge color="info" className="ms-2">
                  {totalUsers} Total
                </CBadge>
              </div>
              <CButton color="primary" size="sm" onClick={loadUsers} disabled={loading}>
                <CIcon icon={cilReload} className="me-1" />
                Refresh
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Search Bar */}
            <CInputGroup className="mb-3">
              <CFormInput
                placeholder="Search by email, name, or user ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1) // Reset to first page on search
                }}
              />
              <CButton type="button" color="primary" variant="outline">
                <CIcon icon={cilSearch} />
              </CButton>
            </CInputGroup>

            {/* Error Alert */}
            {error && (
              <CAlert color="danger" dismissible onClose={() => setError(null)}>
                {error}
              </CAlert>
            )}

            {/* Loading Spinner */}
            {loading && (
              <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-2">Loading users...</p>
              </div>
            )}

            {/* Users Table */}
            {!loading && !error && (
              <>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col" style={{ width: '50px' }}></CTableHeaderCell>
                      <CTableHeaderCell scope="col">#</CTableHeaderCell>
                      <CTableHeaderCell scope="col">User ID</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Display Name</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Premium</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Last Login</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {currentUsers.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan="9" className="text-center py-4">
                          {searchTerm ? 'No users found matching your search' : 'No users yet'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      currentUsers.map((user, index) => (
                        <React.Fragment key={user.userId || index}>
                          <CTableRow 
                            style={{ cursor: 'pointer' }}
                            onClick={() => toggleRow(user.userId)}
                          >
                            <CTableDataCell>
                              <CIcon 
                                icon={expandedRows[user.userId] ? cilChevronBottom : cilChevronRight} 
                                size="sm"
                              />
                            </CTableDataCell>
                            <CTableHeaderCell scope="row">
                              {indexOfFirstUser + index + 1}
                            </CTableHeaderCell>
                            <CTableDataCell>
                              <small className="text-muted">{user.userId}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CIcon icon={cilUser} className="me-2" />
                              {user.email}
                              {user.emailVerified && (
                                <CBadge color="success" className="ms-2" size="sm">
                                  Verified
                                </CBadge>
                              )}
                            </CTableDataCell>
                            <CTableDataCell>
                              {user.displayName || <span className="text-muted">Not set</span>}
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={getUserStatusBadge(user.status)}>
                                {user.status || 'Unknown'}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>{getPremiumBadge(user.isPremium)}</CTableDataCell>
                            <CTableDataCell>
                              <small>{formatDate(user.createdAt)}</small>
                            </CTableDataCell>
                            <CTableDataCell>
                              <small>{formatDate(user.lastLogin)}</small>
                            </CTableDataCell>
                          </CTableRow>
                          <CTableRow>
                            <CTableDataCell colSpan="9" className="p-0">
                              <CCollapse visible={expandedRows[user.userId]}>
                                <div className="p-3 bg-light">
                                  <h6 className="mb-3">Rentals</h6>
                                  {getUserRentals(user.userId).length > 0 ? (
                                    <CRow>
                                      {getUserRentals(user.userId).map((rental, idx) => {
                                        const content = contentMap[rental.contentId]
                                        return (
                                          <CCol xs={6} sm={4} md={3} lg={2} key={idx} className="mb-3">
                                            <CCard className="h-100" style={{ fontSize: '0.85rem' }}>
                                              <div style={{ position: 'relative', paddingTop: '120%', backgroundColor: '#e0e0e0' }}>
                                                {content?.thumbnail ? (
                                                  <img
                                                    src={content.thumbnail}
                                                    alt={content.title}
                                                    style={{
                                                      position: 'absolute',
                                                      top: 0,
                                                      left: 0,
                                                      width: '100%',
                                                      height: '100%',
                                                      objectFit: 'cover'
                                                    }}
                                                  />
                                                ) : (
                                                  <div style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    color: '#999'
                                                  }}>
                                                    No Image
                                                  </div>
                                                )}
                                              </div>
                                              <CCardBody className="p-2">
                                                <div className="mb-1 text-truncate" style={{ fontSize: '0.8rem' }} title={content?.title || rental.contentId}>
                                                  <strong>{content?.title || rental.contentId}</strong>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                  <small style={{ fontSize: '0.7rem' }}>
                                                    {new Date(rental.expiresAt) > new Date() ? (
                                                      <CBadge color="success" style={{ fontSize: '0.65rem' }}>Active</CBadge>
                                                    ) : (
                                                      <CBadge color="danger" style={{ fontSize: '0.65rem' }}>Expired</CBadge>
                                                    )}
                                                  </small>
                                                  <small style={{ fontSize: '0.7rem' }}>
                                                    ₹{rental.amountPaid || 0}
                                                  </small>
                                                </div>
                                                <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
                                                  Exp: {new Date(rental.expiresAt).toLocaleDateString()}
                                                </small>
                                              </CCardBody>
                                            </CCard>
                                          </CCol>
                                        )
                                      })}
                                    </CRow>
                                  ) : (
                                    <p className="text-muted mb-0">No rentals found for this user</p>
                                  )}
                                </div>
                              </CCollapse>
                            </CTableDataCell>
                          </CTableRow>
                        </React.Fragment>
                      ))
                    )}
                  </CTableBody>
                </CTable>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {indexOfFirstUser + 1} to{' '}
                      {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length}{' '}
                      users
                    </div>
                    <CPagination aria-label="Page navigation">
                      <CPaginationItem
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        Previous
                      </CPaginationItem>
                      {[...Array(totalPages)].map((_, i) => (
                        <CPaginationItem
                          key={i + 1}
                          active={currentPage === i + 1}
                          onClick={() => setCurrentPage(i + 1)}
                        >
                          {i + 1}
                        </CPaginationItem>
                      ))}
                      <CPaginationItem
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next
                      </CPaginationItem>
                    </CPagination>
                  </div>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Users
