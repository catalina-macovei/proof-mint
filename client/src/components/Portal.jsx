import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { 
  FaFileAlt, 
  FaLock, 
  FaGlobe, 
  FaCheckCircle, 
  FaClipboardList
} from 'react-icons/fa';

const Portal = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  if (!role) return null;

  const userMenu = [
    { icon: <FaFileAlt />, label: 'Apply for an Attestation', path: '/apply' },
    { icon: <FaClipboardList />, label: 'My Applications', path: '/student-applications' },
    { icon: <FaLock />, label: 'See Private Attestation', path: '/view-private-licenses' },
    { icon: <FaGlobe />, label: 'See Public Attestation', path: '/view-public-licenses' },
    { icon: <FaCheckCircle />, label: 'Verify Public Attestation', path: '/verify-license' },
    { icon: <FaCheckCircle />, label: 'Verify Private Attestation', path: '/verify-private-license' },
  ];

  const issuerMenu = [
    { icon: <FaClipboardList />, label: 'See All Applications', path: '/faculty-applications' },
    { icon: <FaFileAlt />, label: 'Issue Public Attestation', path: '/issue-license' },
    { icon: <FaLock />, label: 'Issue Private Attestation', path: '/issue-private-license' },
    { icon: <FaGlobe />, label: 'See All Public Attestation', path: '/view-public-licenses' },
    { icon: <FaLock />, label: 'See All Private Attestation', path: '/view-private-licenses' },
    { icon: <FaCheckCircle />, label: 'Verify Public Attestation', path: '/verify-license' },
    { icon: <FaCheckCircle />, label: 'Verify Private Attestation', path: '/verify-private-license' },
  ];

  const menu = role === 'User' ? userMenu : issuerMenu;

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
        {role === 'User' ? 'User Portal' : 'Issuer Portal'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {menu.map(({ icon, label, path }, idx) => (
          <NavLink
            key={idx}
            to={path}
            className="flex items-center space-x-4 p-6 bg-gray-50 rounded-lg shadow-md cursor-pointer transform transition-transform duration-300 hover:scale-105 hover:shadow-xl text-decoration-none"
          >
            <div className="text-blue-600 text-4xl">
              {icon}
            </div>
            <div className="text-gray-800 text-lg font-semibold">
              {label}
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Portal;
