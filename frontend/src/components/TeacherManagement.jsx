import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Shield, 
  Mail, 
  Phone, 
  Building, 
  Briefcase,
  ArrowLeft
} from 'lucide-react'
import config from '../config/config'

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [selectedTeachers, setSelectedTeachers] = useState(new Set())
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch(config.api.admin.teachers, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTeachers(data.teachers)
      } else {
        throw new Error('Failed to fetch teachers')
      }
    } catch (error) {
      console.error('Fetch teachers error:', error)
      if (error.message.includes('401')) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async data => {
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingTeacher
        ? `${config.api.admin.teachers}/${editingTeacher._id}`
        : config.api.admin.teachers

      const method = editingTeacher ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()

        // Enhanced success message for teacher creation
        if (!editingTeacher) {
          let successMessage = result.message
          if (data.password) {
            successMessage +=
              '\n\nCustom password has been set for the teacher.'
            if (!data.sendInvite) {
              successMessage += '\nPlease share the login credentials manually.'
            }
          } else if (result.tempPassword) {
            successMessage += `\n\nTemporary password: ${result.tempPassword}`
            successMessage += '\nPlease share this password with the teacher.'
          }
          alert(successMessage)
        } else {
          alert(result.message)
        }

        fetchTeachers()
        setShowCreateForm(false)
        setEditingTeacher(null)
        reset()
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Operation failed. Please try again.')
    }
  }

  const toggleTeacherStatus = async teacherId => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${config.api.admin.teachers}/${teacherId}/toggle-status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        fetchTeachers()
      } else {
        const error = await response.json()
        alert(error.message)
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      alert('Failed to update teacher status.')
    }
  }

  const deleteTeacher = async (teacherId, teacherName) => {
    // Enhanced confirmation dialog
    const confirmMessage =
      `DELETE TEACHER CONFIRMATION\n\n` +
      `Teacher: ${teacherName}\n\n` +
      `This will PERMANENTLY delete:\n` +
      `• Teacher account and profile\n` +
      `• All login credentials\n` +
      `• Associated data and history\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Note: Deletion will be blocked if teacher has pending approvals.\n\n` +
      `Type "DELETE" to confirm:`

    const userInput = prompt(confirmMessage)

    if (userInput !== 'DELETE') {
      if (userInput !== null) {
        // User didn't cancel, but entered wrong text
        alert('Deletion cancelled. You must type "DELETE" exactly to confirm.')
      }
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(
        `${config.api.admin.teachers}/${teacherId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.ok) {
        const result = await response.json()
        alert(`Success!\n\n${result.message}`)
        fetchTeachers()
      } else {
        const error = await response.json()
        alert(`Deletion Failed!\n\n${error.message}`)
      }
    } catch (error) {
      console.error('Delete teacher error:', error)
      alert(
        'Network Error!\n\nFailed to delete teacher. Please check your connection and try again.'
      )
    }
  }

  const handleSelectTeacher = teacherId => {
    const newSelected = new Set(selectedTeachers)
    if (newSelected.has(teacherId)) {
      newSelected.delete(teacherId)
    } else {
      newSelected.add(teacherId)
    }
    setSelectedTeachers(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedTeachers.size === teachers.length) {
      setSelectedTeachers(new Set())
    } else {
      setSelectedTeachers(new Set(teachers.map(t => t._id)))
    }
  }

  const bulkDeleteTeachers = async () => {
    if (selectedTeachers.size === 0) {
      alert('Please select teachers to delete.')
      return
    }

    const selectedTeacherNames = teachers
      .filter(t => selectedTeachers.has(t._id))
      .map(t => t.profile.fullName)

    const confirmMessage =
      `BULK DELETE CONFIRMATION\n\n` +
      `You are about to delete ${selectedTeachers.size} teacher(s):\n` +
      `${selectedTeacherNames.map(name => `• ${name}`).join('\n')}\n\n` +
      `This will PERMANENTLY delete ALL selected teachers!\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Type "DELETE ALL" to confirm:`

    const userInput = prompt(confirmMessage)

    if (userInput !== 'DELETE ALL') {
      if (userInput !== null) {
        alert(
          'Bulk deletion cancelled. You must type "DELETE ALL" exactly to confirm.'
        )
      }
      return
    }

    try {
      const token = localStorage.getItem('adminToken')
      let successCount = 0
      let failedTeachers = []

      // Delete teachers one by one
      for (const teacherId of selectedTeachers) {
        try {
          const response = await fetch(
            `${config.api.admin.teachers}/${teacherId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          )

          if (response.ok) {
            successCount++
          } else {
            const error = await response.json()
            const teacher = teachers.find(t => t._id === teacherId)
            failedTeachers.push(`${teacher.profile.fullName}: ${error.message}`)
          }
        } catch (error) {
          const teacher = teachers.find(t => t._id === teacherId)
          failedTeachers.push(`${teacher.profile.fullName}: Network error`)
        }
      }

      // Show results
      let resultMessage = `Bulk deletion completed!\n\n`
      resultMessage += `Successfully deleted: ${successCount} teacher(s)\n`

      if (failedTeachers.length > 0) {
        resultMessage += `\nFailed to delete:\n${failedTeachers.join('\n')}`
      }

      alert(resultMessage)

      // Reset selection and refresh list
      setSelectedTeachers(new Set())
      fetchTeachers()
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('Bulk deletion failed! Please try again.')
    }
  }

  const startEdit = teacher => {
    setEditingTeacher(teacher)
    reset({
      fullName: teacher.profile.fullName,
      email: teacher.email,
      employeeId: teacher.profile.employeeId,
      designation: teacher.profile.designation,
      department: teacher.profile.department,
    })
    setShowCreateForm(true)
  }

  const cancelEdit = () => {
    setEditingTeacher(null)
    setShowCreateForm(false)
    reset()
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background text-foreground font-sans'>
      {/* Header */}
      <header className='bg-card border-b border-border sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="text-muted-foreground" />
              </button>
              <div>
                <h1 className='text-xl font-bold text-foreground tracking-tight'>
                  Teacher Management
                </h1>
                <p className='text-sm text-muted-foreground'>
                  Manage faculty members and permissions
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className='flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors shadow-sm'
            >
              <UserPlus size={18} />
              <span className="hidden sm:inline">Add Teacher</span>
            </button>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        {/* Create/Edit Teacher Form Modal */}
        {showCreateForm && (
          <div className='fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-card border border-border w-full max-w-lg shadow-lg rounded-xl overflow-hidden'>
              <div className='px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30'>
                <h3 className='text-lg font-semibold text-foreground'>
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
                <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                  <XCircle size={20} />
                </button>
              </div>
              
              <div className='p-6 max-h-[80vh] overflow-y-auto'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-1'>
                      Full Name
                    </label>
                    <div className="relative">
                      <UserPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type='text'
                        {...register('fullName', {
                          required: 'Full name is required',
                        })}
                        className='pl-9 block w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    {errors.fullName && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-foreground mb-1'>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type='email'
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          },
                        })}
                        disabled={editingTeacher}
                        placeholder='teacher@college.edu'
                        className='pl-9 block w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors disabled:opacity-50'
                      />
                    </div>
                    {errors.email && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className='block text-sm font-medium text-foreground mb-1'>
                        Employee ID
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type='text'
                          {...register('employeeId', {
                            required: 'ID is required',
                          })}
                          className='pl-9 block w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                          placeholder="EMP001"
                        />
                      </div>
                      {errors.employeeId && (
                        <p className='text-destructive text-xs mt-1'>
                          {errors.employeeId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-foreground mb-1'>
                        Designation
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <select
                          {...register('designation', {
                            required: 'Required',
                          })}
                          className='pl-9 block w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors appearance-none'
                        >
                          <option value=''>Select</option>
                          <option value='Professor'>Professor</option>
                          <option value='Associate Professor'>Associate Prof.</option>
                          <option value='Assistant Professor'>Assistant Prof.</option>
                          <option value='HOD'>HOD</option>
                          <option value='Principal'>Principal</option>
                        </select>
                      </div>
                      {errors.designation && (
                        <p className='text-destructive text-xs mt-1'>
                          {errors.designation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-foreground mb-1'>
                      Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <select
                        {...register('department', {
                          required: 'Department is required',
                        })}
                        className='pl-9 block w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors appearance-none'
                      >
                        <option value=''>Select Department</option>
                        <option value='Computer Science and Engineering'>CSE</option>
                        <option value='Information Technology'>IT</option>
                        <option value='Electronics and Communication Engineering'>ECE</option>
                        <option value='Electrical and Electronics Engineering'>EEE</option>
                        <option value='Mechanical Engineering'>MECH</option>
                        <option value='Civil Engineering'>CIVIL</option>
                      </select>
                    </div>
                    {errors.department && (
                      <p className='text-destructive text-xs mt-1'>
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  {!editingTeacher && (
                    <div className="pt-2 border-t border-border mt-2">
                      <div className="mb-3">
                        <label className='block text-sm font-medium text-foreground mb-1'>
                          Password (Optional)
                        </label>
                        <input
                          type='password'
                          {...register('password', {
                            minLength: {
                              value: 6,
                              message: 'Min 6 chars',
                            },
                          })}
                          className='block w-full bg-background border border-input rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-input transition-colors'
                          placeholder='Leave empty for auto-generated'
                        />
                        {errors.password && (
                          <p className='text-destructive text-xs mt-1'>
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          {...register('sendInvite')}
                          defaultChecked={true}
                          className='h-4 w-4 rounded border-input text-primary focus:ring-primary'
                        />
                        <label className='text-sm text-muted-foreground'>
                          Send invitation email with credentials
                        </label>
                      </div>
                    </div>
                  )}

                  <div className='flex gap-3 pt-4'>
                    <button
                      type='button'
                      onClick={cancelEdit}
                      className='flex-1 px-4 py-2 border border-input bg-background hover:bg-muted text-foreground rounded-md text-sm font-medium transition-colors'
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors shadow-sm'
                    >
                      {editingTeacher ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Teachers List */}
        <div className='bg-card border border-border rounded-xl shadow-sm overflow-hidden'>
          <div className='px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30'>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-muted-foreground" />
              <h3 className='text-sm font-medium text-foreground'>
                All Teachers ({teachers.length})
              </h3>
            </div>
            {selectedTeachers.size > 0 && (
              <button
                onClick={bulkDeleteTeachers}
                className='bg-destructive text-destructive-foreground px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm hover:bg-destructive/90'
              >
                <Trash2 size={14} />
                <span>Delete ({selectedTeachers.size})</span>
              </button>
            )}
          </div>
          
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-border'>
              <thead className='bg-muted/50'>
                <tr>
                  <th className='px-6 py-3 text-left'>
                    <input
                      type='checkbox'
                      checked={
                        selectedTeachers.size === teachers.length &&
                        teachers.length > 0
                      }
                      onChange={handleSelectAll}
                      className='h-4 w-4 rounded border-input text-primary focus:ring-primary'
                    />
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Teacher
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Contact
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Department
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Stats
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-card divide-y divide-border'>
                {teachers.map(teacher => (
                  <tr
                    key={teacher._id}
                    className={`hover:bg-muted/30 transition-colors ${
                      selectedTeachers.has(teacher._id) ? 'bg-muted/50' : ''
                    }`}
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <input
                        type='checkbox'
                        checked={selectedTeachers.has(teacher._id)}
                        onChange={() => handleSelectTeacher(teacher._id)}
                        className='h-4 w-4 rounded border-input text-primary focus:ring-primary'
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <span className="text-xs font-bold">
                            {teacher.profile.fullName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className='text-sm font-medium text-foreground'>
                            {teacher.profile.fullName}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {teacher.profile.designation} • {teacher.profile.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-foreground flex items-center gap-1.5'>
                        <Mail size={12} className="text-muted-foreground" />
                        {teacher.email}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-muted-foreground'>
                      {teacher.profile.department}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className="flex items-center gap-3">
                        <div className='text-xs text-green-600 flex items-center gap-1'>
                          <CheckCircle size={12} /> {teacher.approvalStats?.approved || 0}
                        </div>
                        <div className='text-xs text-red-600 flex items-center gap-1'>
                          <XCircle size={12} /> {teacher.approvalStats?.rejected || 0}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                          teacher.isActive
                            ? 'bg-green-500/10 text-green-600'
                            : 'bg-red-500/10 text-red-600'
                        }`}
                      >
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end items-center gap-2'>
                        <button
                          onClick={() => startEdit(teacher)}
                          className='p-1 text-muted-foreground hover:text-primary transition-colors'
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => toggleTeacherStatus(teacher._id)}
                          className={`p-1 transition-colors ${
                            teacher.isActive
                              ? 'text-muted-foreground hover:text-destructive'
                              : 'text-muted-foreground hover:text-green-600'
                          }`}
                          title={teacher.isActive ? "Deactivate" : "Activate"}
                        >
                          {teacher.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() =>
                            deleteTeacher(teacher._id, teacher.profile.fullName)
                          }
                          className='p-1 text-muted-foreground hover:text-destructive transition-colors'
                          title='Delete'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teachers.length === 0 && (
              <div className='text-center py-12'>
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserPlus size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No teachers found</h3>
                <p className='text-muted-foreground mt-1'>
                  Get started by adding your first teacher.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className='mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors'
                >
                  <UserPlus size={16} />
                  Add Teacher
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TeacherManagement
