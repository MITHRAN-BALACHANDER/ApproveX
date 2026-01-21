import { useState } from 'react'
import { Mail, User, MessageSquare, Send } from 'lucide-react'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission here
    alert('Message sent! (This is just a demo)')
  }

  return (
    <div className='max-w-2xl mx-auto py-8 px-4'>
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-primary hover:scale-110 transition-transform duration-300" />
        <h1 className='text-3xl font-bold text-foreground'>Contact Us</h1>
      </div>

      <div className='bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all duration-300'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='text-sm font-medium text-foreground mb-1 flex items-center gap-2'
            >
              <User className="w-4 h-4 text-muted-foreground" /> Name
            </label>
            <input
              type='text'
              id='name'
              name='name'
              value={formData.name}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all duration-200'
              placeholder="Your Name"
            />
          </div>

          <div>
            <label
              htmlFor='email'
              className='text-sm font-medium text-foreground mb-1 flex items-center gap-2'
            >
              <Mail className="w-4 h-4 text-muted-foreground" /> Email
            </label>
            <input
              type='email'
              id='email'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
              className='w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground transition-all duration-200'
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor='message'
              className='text-sm font-medium text-foreground mb-1 flex items-center gap-2'
            >
              <MessageSquare className="w-4 h-4 text-muted-foreground" /> Message
            </label>
            <textarea
              id='message'
              name='message'
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              className='w-full px-3 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground resize-none transition-all duration-200'
              placeholder="How can we help you?"
            />
          </div>

          <button
            type='submit'
            className='group w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
          >
            <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" /> Send Message
          </button>
        </form>
      </div>
    </div>
  )
}

export default Contact
