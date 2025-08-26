const IssueCards = () => {
  const issues = [
    {
      title: 'Attendance Marking',
      description:
        'Having trouble marking your attendance? Follow these steps to resolve it.',
      borderColor: 'var(--color-primary)',
    },
    {
      title: 'Shift Scheduling',
      description: 'Need help with your duty schedule ? Get support here.',
      borderColor: 'var(--color-secondary)',
    },
    {
      title: 'Leave Requests',
      description:
        'Want to apply for leave while on duty? Learn about the process.',
      borderColor: '#fb5607',
    },
    {
      title: 'Attendance & Reports',
      description:
        'Issues with submitting Attendance reports? Find troubleshooting steps.',
      borderColor: '#ffbe0b',
    },
  ]

  return (
    <div className='mt-10'>
      <h2
        className='text-2xl font-bold mb-4'
        style={{ color: 'var(--color-dark)' }}
      >
        On-Duty Issues
      </h2>
      <p className='mb-8 text-gray-600'>
        Click on any card below for quick assistance with common on-duty
        concerns:
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
        {issues.map((issue, index) => (
          <div
            key={index}
            className='bg-white rounded-xl p-5 shadow-lg cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl'
            style={{ borderLeft: `5px solid ${issue.borderColor}` }}
          >
            <h3
              className='text-xl font-semibold mb-3'
              style={{ color: 'var(--color-dark)' }}
            >
              {issue.title}
            </h3>
            <p className='text-sm text-gray-600'>{issue.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IssueCards
