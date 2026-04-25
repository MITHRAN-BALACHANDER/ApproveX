import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  FileText,
  Clock,
  Lock,
  LogOut,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import ChangePassword from './ChangePassword'
import config from '../config/config'

import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        navigate('/admin/login')
        return
      }

      const response = await fetch(`${config.api.admin}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Dashboard error:', error)
      if (error.message.includes('401')) {
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    navigate('/admin/login')
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'approved':
        return 'default'
      case 'rejected':
        return 'destructive'
      case 'under_review':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex flex-col items-center space-y-4'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
          <p className='text-sm text-muted-foreground'>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background font-sans'>
      {/* Header */}
      <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto px-4 md:px-8'>
          <div className='flex h-16 items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Shield className='h-6 w-6 text-primary' />
              <div>
                <h1 className='text-lg font-bold leading-none tracking-tight'>
                  Admin Dashboard
                </h1>
                <p className='text-xs text-muted-foreground'>OD Provider System</p>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowChangePassword(true)}
                className='hidden md:flex'
              >
                <Lock className='mr-2 h-4 w-4' />
                Password
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/admin/teachers')}
              >
                <Users className='mr-2 h-4 w-4' />
                Teachers
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => navigate('/admin/approval-history')}
                className='text-green-600 hover:text-green-700'
              >
                <FileText className='mr-2 h-4 w-4' />
                History
              </Button>
              <Button
                variant='destructive'
                size='sm'
                onClick={handleLogout}
              >
                <LogOut className='mr-2 h-4 w-4' />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className='container mx-auto p-4 md:p-8 space-y-8'>
        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Students</CardTitle>
              <GraduationCap className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats?.totalStudents || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Teachers</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats?.totalTeachers || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Requests</CardTitle>
              <FileText className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats?.totalRequests || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Pending Requests</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {dashboardData?.stats?.pendingRequests || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid gap-4 md:grid-cols-1 lg:grid-cols-7'>
          {/* Recent Requests */}
          <Card className='lg:col-span-4'>
            <CardHeader>
              <CardTitle>Recent OD Requests</CardTitle>
              <CardDescription>
                Latest on-duty requests submitted by students.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.recentRequests?.map(request => (
                    <TableRow key={request._id}>
                      <TableCell>
                        <div className='font-medium'>{request.studentInfo.fullName}</div>
                        <div className='text-xs text-muted-foreground'>{request.studentInfo.registerNumber}</div>
                      </TableCell>
                      <TableCell>{request.eventDetails?.eventTitle}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.overallStatus)} className='capitalize flex w-fit items-center gap-1'>
                          {request.overallStatus === 'approved' && <CheckCircle className='w-3 h-3' />}
                          {request.overallStatus === 'rejected' && <XCircle className='w-3 h-3' />}
                          {request.overallStatus === 'under_review' && <Clock className='w-3 h-3' />}
                          {request.overallStatus.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right text-muted-foreground'>
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Teacher Performance */}
          <Card className='lg:col-span-3'>
            <CardHeader>
              <CardTitle>Approval Statistics</CardTitle>
              <CardDescription>
                Overview of teacher approval performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead className='text-center'>Total</TableHead>
                    <TableHead className='text-center'>Apprv</TableHead>
                    <TableHead className='text-center'>Pend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData?.teacherStats?.map(teacher => (
                    <TableRow key={teacher._id}>
                      <TableCell>
                        <div className='font-medium'>{teacher.fullName}</div>
                        <div className='text-xs text-muted-foreground truncate max-w-[120px]'>{teacher.designation}</div>
                      </TableCell>
                      <TableCell className='text-center font-medium'>
                        {teacher.approvalStats?.totalRequests || 0}
                      </TableCell>
                      <TableCell className='text-center text-green-600 font-medium'>
                        {teacher.approvalStats?.approved || 0}
                      </TableCell>
                      <TableCell className='text-center text-yellow-600 font-medium'>
                        {teacher.approvalStats?.pending || 0}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <ChangePassword
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        userToken={localStorage.getItem('adminToken')}
        userRole='admin'
      />
    </div>
  )
}

export default AdminDashboard
