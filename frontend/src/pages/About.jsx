import { Sparkles, Lightbulb, Users, Target, Code2, Database, Rocket, Zap, CheckCircle, Search, Terminal, Code } from 'lucide-react'

function About() {
  return (
    <div className='max-w-4xl mx-auto py-8 px-4'>
      <h1 className='text-4xl font-bold text-foreground mb-6'>
        About This Template
      </h1>

      <div className='bg-primary/10 rounded-xl p-6 mb-6 border border-primary/20 hover:shadow-md transition-all duration-300'>
        <div className="flex items-center gap-3 mb-3">
          <Rocket className="w-6 h-6 text-primary hover:scale-110 transition-transform duration-300" />
          <h2 className='text-2xl font-semibold text-foreground'>
             Created with React & Tailwind
          </h2>
        </div>
        <p className='text-muted-foreground text-lg'>
          A modern, production-ready React template with the latest tools and
          best practices.
        </p>
      </div>

      <div className='bg-card rounded-xl shadow-sm border border-border p-6 mb-6 hover:shadow-md hover:border-primary/30 transition-all duration-300'>
        <h2 className='text-xl font-semibold mb-4 text-foreground flex items-center gap-2'>
          <Zap className="w-5 h-5 text-yellow-500" /> What&apos;s Included
        </h2>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>React 19</span>
                <p className='text-sm text-muted-foreground'>
                  Latest React with concurrent features
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>Vite 7.1+</span>
                <p className='text-sm text-muted-foreground'>
                  Lightning fast development and builds
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>React Router 6.27+</span>
                <p className='text-sm text-muted-foreground'>
                  Modern client-side routing
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>Tailwind CSS 4.1+</span>
                <p className='text-sm text-muted-foreground'>
                  Utility-first CSS with Vite plugin
                </p>
              </div>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>ESLint 9.33+</span>
                <p className='text-sm text-muted-foreground'>Advanced code linting</p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>Prettier 3.3+</span>
                <p className='text-sm text-muted-foreground'>
                  Automatic code formatting
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>SWC Compiler</span>
                <p className='text-sm text-muted-foreground'>
                  Super-fast JavaScript compilation
                </p>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <CheckCircle className='text-green-500 w-5 h-5 mt-0.5' />
              <div>
                <span className='font-medium text-foreground'>Responsive Design</span>
                <p className='text-sm text-muted-foreground'>Mobile-first approach</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-card rounded-xl shadow-sm border border-border p-6 mb-6 hover:shadow-md hover:border-primary/30 transition-all duration-300'>
        <h2 className='text-xl font-semibold mb-4 text-foreground flex items-center gap-2'>
          <Terminal className="w-5 h-5 text-blue-500" /> Development Tools
        </h2>
        <div className='grid md:grid-cols-3 gap-4'>
          <div className='group text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 hover:bg-blue-500/20 transition-all duration-300 hover:-translate-y-1 cursor-default'>
            <div className='flex justify-center mb-2'>
              <Zap className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className='font-semibold text-foreground'>
              Hot Module Replacement
            </h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Instant updates during development
            </p>
          </div>
          <div className='group text-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20 hover:bg-green-500/20 transition-all duration-300 hover:-translate-y-1 cursor-default'>
            <div className='flex justify-center mb-2'>
              <Search className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className='font-semibold text-foreground'>Code Quality</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              ESLint + Prettier integration
            </p>
          </div>
          <div className='group text-center p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 hover:bg-purple-500/20 transition-all duration-300 hover:-translate-y-1 cursor-default'>
            <div className='flex justify-center mb-2'>
              <Rocket className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className='font-semibold text-foreground'>Production Ready</h3>
            <p className='text-sm text-muted-foreground mt-1'>
              Optimized builds and tree-shaking
            </p>
          </div>
        </div>
      </div>

      <div className='bg-card rounded-xl shadow-sm border border-border p-6 hover:shadow-md hover:border-primary/30 transition-all duration-300'>
        <h2 className='text-xl font-semibold mb-4 text-foreground flex items-center gap-2'>
          <Code className="w-5 h-5 text-orange-500 hover:scale-110 transition-transform duration-300" /> Getting Started
        </h2>
        <div className='bg-muted text-muted-foreground p-4 rounded-2xl font-mono text-sm mb-4 border border-border'>
          <p className='mb-2 text-foreground/50'># Install dependencies</p>
          <p className='text-foreground mb-3'>npm install</p>
          <p className='mb-2 text-foreground/50'># Start development server</p>
          <p className='text-foreground mb-3'>npm run dev</p>
          <p className='mb-2 text-foreground/50'># Format code</p>
          <p className='text-foreground mb-3'>npm run format</p>
          <p className='mb-2 text-foreground/50'># Build for production</p>
          <p className='text-foreground'>npm run build</p>
        </div>
        <div className='bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded'>
          <p className='text-blue-700 dark:text-blue-300'>
            💡 <strong>Tip:</strong> Your development server will start at{' '}
            <code className='bg-blue-500/20 px-2 py-1 rounded text-sm'>
              http://localhost:5173
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
