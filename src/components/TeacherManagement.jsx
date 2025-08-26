import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'

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
        navigate('/admin/login')
        return
      }

      const response = await fetch('http://localhost:5000/api/admin/teachers', {
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
        navigate('/admin/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async data => {
    try {
      const token = localStorage.getItem('adminToken')
      const url = editingTeacher
        ? `http://localhost:5000/api/admin/teachers/${editingTeacher._id}`
        : 'http://localhost:5000/api/admin/teachers'

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
        `http://localhost:5000/api/admin/teachers/${teacherId}/toggle-status`,
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
      `⚠️ DELETE TEACHER CONFIRMATION ⚠️\n\n` +
      `Teacher: ${teacherName}\n\n` +
      `This will PERMANENTLY delete:\n` +
      `• Teacher account and profile\n` +
      `• All login credentials\n` +
      `• Associated data and history\n\n` +
      `❌ This action CANNOT be undone!\n\n` +
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
        `http://localhost:5000/api/admin/teachers/${teacherId}`,
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
        alert(`✅ Success!\n\n${result.message}`)
        fetchTeachers()
      } else {
        const error = await response.json()
        alert(`❌ Deletion Failed!\n\n${error.message}`)
      }
    } catch (error) {
      console.error('Delete teacher error:', error)
      alert(
        '❌ Network Error!\n\nFailed to delete teacher. Please check your connection and try again.'
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
      `⚠️ BULK DELETE CONFIRMATION ⚠️\n\n` +
      `You are about to delete ${selectedTeachers.size} teacher(s):\n` +
      `${selectedTeacherNames.map(name => `• ${name}`).join('\n')}\n\n` +
      `This will PERMANENTLY delete ALL selected teachers!\n\n` +
      `❌ This action CANNOT be undone!\n\n` +
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
            `http://localhost:5000/api/admin/teachers/${teacherId}`,
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
      let resultMessage = `✅ Bulk deletion completed!\n\n`
      resultMessage += `Successfully deleted: ${successCount} teacher(s)\n`

      if (failedTeachers.length > 0) {
        resultMessage += `\n❌ Failed to delete:\n${failedTeachers.join('\n')}`
      }

      alert(resultMessage)

      // Reset selection and refresh list
      setSelectedTeachers(new Set())
      fetchTeachers()
    } catch (error) {
      console.error('Bulk delete error:', error)
      alert('❌ Bulk deletion failed! Please try again.')
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
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-lg'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-6'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>
                Teacher Management
              </h1>
              <p className='text-gray-600'>
                Manage teachers and their permissions
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => navigate('/admin/dashboard')}
                className='bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition duration-200'
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200'
              >
                Add New Teacher
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        {/* Create/Edit Teacher Form */}
        {showCreateForm && (
          <div className='fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50'>
            <div className='relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white'>
              <div className='mt-3'>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      {...register('fullName', {
                        required: 'Full name is required',
                      })}
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.fullName && (
                      <p className='text-red-600 text-sm'>
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Email Address
                      <span className='text-xs text-gray-500 ml-1'>
                        (any domain accepted)
                      </span>
                    </label>
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
                      placeholder='teacher@gmail.com, teacher@yahoo.com, etc.'
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100'
                    />
                    {errors.email && (
                      <p className='text-red-600 text-sm'>
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Employee ID
                    </label>
                    <input
                      type='text'
                      {...register('employeeId', {
                        required: 'Employee ID is required',
                      })}
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    />
                    {errors.employeeId && (
                      <p className='text-red-600 text-sm'>
                        {errors.employeeId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Designation
                    </label>
                    <select
                      {...register('designation', {
                        required: 'Designation is required',
                      })}
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value=''>Select Designation</option>
                      <option value='Professor'>Professor</option>
                      <option value='Associate Professor'>
                        Associate Professor
                      </option>
                      <option value='Assistant Professor'>
                        Assistant Professor
                      </option>
                      <option value='HOD'>HOD</option>
                      <option value='Principal'>Principal</option>
                      <option value='Vice Principal'>Vice Principal</option>
                    </select>
                    {errors.designation && (
                      <p className='text-red-600 text-sm'>
                        {errors.designation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Department
                    </label>
                    <select
                      {...register('department', {
                        required: 'Department is required',
                      })}
                      className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value=''>Select Department</option>
                      <option value='Computer Science and Engineering'>
                        Computer Science and Engineering
                      </option>
                      <option value='Information Technology'>
                        Information Technology
                      </option>
                      <option value='Electronics and Communication Engineering'>
                        Electronics and Communication Engineering
                      </option>
                      <option value='Electrical and Electronics Engineering'>
                        Electrical and Electronics Engineering
                      </option>
                      <option value='Mechanical Engineering'>
                        Mechanical Engineering
                      </option>
                      <option value='Civil Engineering'>
                        Civil Engineering
                      </option>
                      <option value='Chemical Engineering'>
                        Chemical Engineering
                      </option>
                      <option value='Biotechnology'>Biotechnology</option>
                      <option value='Biomedical Engineering'>
                        Biomedical Engineering
                      </option>
                    </select>
                    {errors.department && (
                      <p className='text-red-600 text-sm'>
                        {errors.department.message}
                      </p>
                    )}
                  </div>

                  {!editingTeacher && (
                    <>
                      <div>
                        <label className='block text-sm font-medium text-gray-700'>
                          Password (Optional)
                          <span className='text-xs text-gray-500 ml-1'>
                            Leave empty for auto-generated password
                          </span>
                        </label>
                        <input
                          type='password'
                          {...register('password', {
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                          className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                          placeholder='Enter custom password or leave empty'
                        />
                        {errors.password && (
                          <p className='text-red-600 text-sm'>
                            {errors.password.message}
                          </p>
                        )}
                      </div>

                      <div className='flex items-center'>
                        <input
                          type='checkbox'
                          {...register('sendInvite')}
                          defaultChecked={true}
                          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                        />
                        <label className='ml-2 block text-sm text-gray-700'>
                          Send invitation email to teacher
                          <span className='text-xs text-gray-500 block'>
                            Uncheck if you plan to share credentials manually
                          </span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className='flex space-x-4 pt-4'>
                    <button
                      type='submit'
                      className='flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200'
                    >
                      {editingTeacher ? 'Update Teacher' : 'Create Teacher'}
                    </button>
                    <button
                      type='button'
                      onClick={cancelEdit}
                      className='flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-200'
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Teachers List */}
        <div className='bg-white shadow-md rounded-lg'>
          <div className='px-6 py-4 border-b border-gray-200 flex justify-between items-center'>
            <h3 className='text-lg font-medium text-gray-900'>
              All Teachers ({teachers.length})
            </h3>
            {selectedTeachers.size > 0 && (
              <button
                onClick={bulkDeleteTeachers}
                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center space-x-2'
              >
                <span>🗑️</span>
                <span>Delete Selected ({selectedTeachers.size})</span>
              </button>
            )}
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    <input
                      type='checkbox'
                      checked={
                        selectedTeachers.size === teachers.length &&
                        teachers.length > 0
                      }
                      onChange={handleSelectAll}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Teacher
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Contact
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Department
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Approval Stats
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {teachers.map(teacher => (
                  <tr
                    key={teacher._id}
                    className={
                      selectedTeachers.has(teacher._id) ? 'bg-blue-50' : ''
                    }
                  >
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <input
                        type='checkbox'
                        checked={selectedTeachers.has(teacher._id)}
                        onChange={() => handleSelectTeacher(teacher._id)}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {teacher.profile.fullName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {teacher.profile.designation}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ID: {teacher.profile.employeeId}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        {teacher.email}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {teacher.profile.department}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div className='text-sm text-gray-900'>
                        Total: {teacher.approvalStats?.totalRequests || 0}
                      </div>
                      <div className='text-xs text-green-600'>
                        ✓ {teacher.approvalStats?.approved || 0}
                      </div>
                      <div className='text-xs text-red-600'>
                        ✗ {teacher.approvalStats?.rejected || 0}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          teacher.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {teacher.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => startEdit(teacher)}
                          className='text-blue-600 hover:text-blue-900'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleTeacherStatus(teacher._id)}
                          className={`${
                            teacher.isActive
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {teacher.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/teachers/${teacher._id}/performance`
                            )
                          }
                          className='text-purple-600 hover:text-purple-900'
                        >
                          Performance
                        </button>
                        <button
                          onClick={() =>
                            deleteTeacher(teacher._id, teacher.profile.fullName)
                          }
                          className='text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1 rounded transition-all duration-200'
                          title='⚠️ Delete teacher permanently (cannot be undone)'
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teachers.length === 0 && (
              <div className='text-center py-8'>
                <p className='text-gray-500'>
                  No teachers found. Add some teachers to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TeacherManagement
