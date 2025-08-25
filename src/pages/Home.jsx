function Home() {
  return (
    <div className='max-w-4xl mx-auto'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          Welcome to React Vite Template
        </h1>
        <p className='text-xl text-gray-600 mb-8'>
          A modern React application with Vite, React Router, and Tailwind CSS
        </p>

        <div className='grid md:grid-cols-3 gap-6 mt-12'>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className='text-blue-500 text-3xl mb-4'>⚡</div>
            <h3 className='text-lg font-semibold mb-2'>Lightning Fast</h3>
            <p className='text-gray-600'>
              Powered by Vite for instant hot module replacement and blazing
              fast builds.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className='text-green-500 text-3xl mb-4'>🎨</div>
            <h3 className='text-lg font-semibold mb-2'>Beautiful UI</h3>
            <p className='text-gray-600'>
              Pre-configured with Tailwind CSS for rapid UI development.
            </p>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <div className='text-purple-500 text-3xl mb-4'>🛠️</div>
            <h3 className='text-lg font-semibold mb-2'>Ready to Use</h3>
            <p className='text-gray-600'>
              Includes React Router for navigation and a complete project
              structure.
            </p>
          </div>
        </div>

        <div className='mt-12'>
          <button className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors'>
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
