import { useEffect, useState } from 'react';

const Portal = () => {
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem('role');
    setIsStudent(role === 'User');
  }, []);

  if (!isStudent) return null;

  return (
    <div className="student-portal">
      <h2>Student Portal</h2>
      <ul>
        <li>📚 View Courses</li>
        <li>📊 Check Grades</li>
        <li>📝 Update Profile</li>
        <li>🚪 Log Out</li>
      </ul>
    </div>
  );
};

export default Portal;
