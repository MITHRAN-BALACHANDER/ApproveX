# Student On Duty Request System

A full-stack MERN application for managing student on-duty requests with file uploads and status tracking.

## Features

- **Frontend**: React with Tailwind CSS
- **Backend**: Express.js with MongoDB
- **File Upload**: Support for PDF and document uploads
- **Form Validation**: Client and server-side validation
- **Status Tracking**: Real-time request status updates
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- React 19.1.1
- Tailwind CSS 4.1.12
- React Router DOM
- React Hook Form
- Axios
- Font Awesome

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Multer (file uploads)

## Backend production notes

- Ensure `.env` contains:
   - PORT=5000
   - CLIENT_ORIGIN=https://your-frontend-host.com
   - MONGODB_URI=...
   - JWT_SECRET=strong-secret
   - EMAIL_USER / EMAIL_PASS if email features are used
- CORS is restricted via CLIENT_ORIGIN (wildcard in dev). Helmet and a basic rate limiter are enabled.
- Express Validator
- CORS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd odprovider
   ```

2. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `backend` directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/odprovider
   PORT=5000
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

5. **Start MongoDB**
   
   Make sure MongoDB is running on your system.

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the Frontend Development Server**
   ```bash
   # In the root directory
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## API Endpoints

### Duty Requests
- `GET /api/duty-requests` - Get all duty requests
- `GET /api/duty-requests/:id` - Get duty request by ID
- `POST /api/duty-requests` - Create new duty request (with file upload)
- `PUT /api/duty-requests/:id/status` - Update request status
- `DELETE /api/duty-requests/:id` - Delete duty request

## Form Fields

The duty request form includes:
- Full Name
- Student ID
- University Email
- Location
- Reason for Duty (Event/Exam/Medical/Official/Other)
- Date of Duty
- Event PDF (Schedule/Notice)
- Event Certificate
- Additional Details

## File Upload

- **Event PDF**: PDF files only, max 5MB
- **Event Certificate**: PDF, DOC, or DOCX files, max 5MB
- Files are stored in the `backend/uploads/` directory

## Status Types

- **Pending**: Newly submitted requests
- **In Progress**: Requests being reviewed
- **Resolved**: Approved requests
- **Rejected**: Declined requests

## Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Backend
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
```

## License

This project is licensed under the MIT License.
