function About() {
  return (
    <div className='max-w-4xl mx-auto'>
      <h1 className='text-4xl font-bold text-gray-900 mb-6'>
        About This Template
      </h1>

      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-6'>
        <h2 className='text-2xl font-semibold text-gray-800 mb-3'>
          🚀 Created with Create React Tailwind App Router
        </h2>
        <p className='text-gray-600 text-lg'>
          A modern, production-ready React template with the latest tools and
          best practices.
        </p>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>⚡ What&apos;s Included</h2>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='space-y-3'>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>React 19</span>
                <p className='text-sm text-gray-600'>
                  Latest React with concurrent features
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>Vite 7.1+</span>
                <p className='text-sm text-gray-600'>
                  Lightning fast development and builds
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>React Router 6.27+</span>
                <p className='text-sm text-gray-600'>
                  Modern client-side routing
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>Tailwind CSS 4.1+</span>
                <p className='text-sm text-gray-600'>
                  Utility-first CSS with Vite plugin
                </p>
              </div>
            </div>
          </div>
          <div className='space-y-3'>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>ESLint 9.33+</span>
                <p className='text-sm text-gray-600'>Advanced code linting</p>
              </div>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>Prettier 3.3+</span>
                <p className='text-sm text-gray-600'>
                  Automatic code formatting
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>SWC Compiler</span>
                <p className='text-sm text-gray-600'>
                  Super-fast JavaScript compilation
                </p>
              </div>
            </div>
            <div className='flex items-center'>
              <span className='text-green-500 mr-3 text-lg'>✓</span>
              <div>
                <span className='font-medium'>Responsive Design</span>
                <p className='text-sm text-gray-600'>Mobile-first approach</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>🛠️ Development Tools</h2>
        <div className='grid md:grid-cols-3 gap-4'>
          <div className='text-center p-4 bg-blue-50 rounded-lg'>
            <div className='text-2xl mb-2'>⚡</div>
            <h3 className='font-semibold text-gray-800'>
              Hot Module Replacement
            </h3>
            <p className='text-sm text-gray-600 mt-1'>
              Instant updates during development
            </p>
          </div>
          <div className='text-center p-4 bg-green-50 rounded-lg'>
            <div className='text-2xl mb-2'>🔍</div>
            <h3 className='font-semibold text-gray-800'>Code Quality</h3>
            <p className='text-sm text-gray-600 mt-1'>
              ESLint + Prettier integration
            </p>
          </div>
          <div className='text-center p-4 bg-purple-50 rounded-lg'>
            <div className='text-2xl mb-2'>🚀</div>
            <h3 className='font-semibold text-gray-800'>Production Ready</h3>
            <p className='text-sm text-gray-600 mt-1'>
              Optimized builds and tree-shaking
            </p>
          </div>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-xl font-semibold mb-4'>🚀 Getting Started</h2>
        <div className='bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm mb-4'>
          <p className='mb-2'># Install dependencies</p>
          <p className='text-white mb-3'>npm install</p>
          <p className='mb-2'># Start development server</p>
          <p className='text-white mb-3'>npm run dev</p>
          <p className='mb-2'># Format code</p>
          <p className='text-white mb-3'>npm run format</p>
          <p className='mb-2'># Build for production</p>
          <p className='text-white'>npm run build</p>
        </div>
        <div className='bg-blue-50 border-l-4 border-blue-400 p-4 rounded'>
          <p className='text-blue-800'>
            💡 <strong>Tip:</strong> Your development server will start at{' '}
            <code className='bg-blue-100 px-2 py-1 rounded text-sm'>
              http://localhost:5173
            </code>
          </p>
        </div>
      </div>
    </div>
  )
}

export default About
