import { HelpCircle, Calendar, FileText, Clock } from 'lucide-react'

const IssueCards = () => {
  const issues = [
    {
      title: 'Attendance Marking',
      description:
        'Having trouble marking your attendance? Follow these steps to resolve it.',
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
      border: 'border-primary/20'
    },
    {
      title: 'Shift Scheduling',
      description: 'Need help with your duty schedule? Get support here.',
      icon: Calendar,
      color: 'text-secondary-foreground',
      bg: 'bg-secondary',
      border: 'border-secondary/20'
    },
    {
      title: 'Leave Requests',
      description:
        'Want to apply for leave while on duty? Learn about the process.',
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20'
    },
    {
      title: 'Attendance & Reports',
      description:
        'Issues with submitting Attendance reports? Find troubleshooting steps.',
      icon: HelpCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20'
    },
  ]

  return (
    <div className='mt-10'>
      <h2 className='text-2xl font-bold mb-4 text-foreground'>
        On-Duty Issues
      </h2>
      <p className='mb-8 text-muted-foreground'>
        Click on any card below for quick assistance with common on-duty
        concerns:
      </p>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
        {issues.map((issue, index) => (
          <div
            key={index}
            className={`bg-card rounded-xl p-5 shadow-sm border ${issue.border} cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md group`}
          >
            <div className={`h-10 w-10 rounded-lg ${issue.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <issue.icon className={`w-5 h-5 ${issue.color}`} />
            </div>
            <h3 className='text-lg font-semibold mb-2 text-foreground'>
              {issue.title}
            </h3>
            <p className='text-sm text-muted-foreground'>{issue.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IssueCards
