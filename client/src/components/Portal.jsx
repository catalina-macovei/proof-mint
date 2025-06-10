import { useEffect, useState } from 'react';
import { 
  FaFileAlt, 
  FaLock, 
  FaGlobe, 
  FaCheckCircle, 
  FaClipboardList, 
  FaUserShield 
} from 'react-icons/fa';

const Portal = () => {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedRole = sessionStorage.getItem('role');
    setRole(storedRole);
  }, []);

  if (!role) return null;

  // Menu items for User role
  const userMenu = [
    { icon: <FaFileAlt />, label: 'Apply for Issuing an Attestation' },
    { icon: <FaLock />, label: 'See Private Attestation' },
    { icon: <FaGlobe />, label: 'See Public Attestation' },
    { icon: <FaCheckCircle />, label: 'Verify Public Attestation' },
    { icon: <FaCheckCircle />, label: 'Verify Private Attestation' },
  ];

  // Menu items for Issuer role
  const issuerMenu = [
    { icon: <FaClipboardList />, label: 'See Applications for Issuing Attestation' },
    { icon: <FaLock />, label: 'See All Private Attestation' },
    { icon: <FaGlobe />, label: 'See All Public Attestation' },
    { icon: <FaCheckCircle />, label: 'Verify Public Attestation' },
    { icon: <FaCheckCircle />, label: 'Verify Private Attestation' },
  ];

  const menu = role === 'User' ? userMenu : issuerMenu;

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        {role === 'User' ? 'User Portal' : 'Issuer Portal'}
      </h2>

      <ul className="space-y-4">
        {menu.map(({ icon, label }, idx) => (
          <li
            key={idx}
            className="flex items-center space-x-3 p-3 rounded-md cursor-pointer transition bg-gray-50 hover:bg-blue-100"
          >
            <span className="text-blue-600 text-xl">{icon}</span>
            <span className="text-gray-700 font-medium">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portal;
