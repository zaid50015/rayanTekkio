import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirect to role-specific dashboard
  if (user.role === 'manager') {
    return <Navigate to="/manager" replace />
  } else {
    return <Navigate to="/employee" replace />
  }
}

