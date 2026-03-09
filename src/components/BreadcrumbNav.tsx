import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

const BreadcrumbNav: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const breadcrumbMap: Record<string, string> = {
    'admin': 'Admin Dashboard',
    'employee-dashboard': 'Employee Dashboard',
    'customer-dashboard': 'Customer Dashboard',
    'inventory': 'Inventory',
    'sales': 'Sales',
    'purchases': 'Purchases',
    'customers': 'Customers',
    'service': 'Service',
    'invoices': 'Invoices',
    'reports': 'Reports',
    'settings': 'Settings',
    'admin-users': 'User Management',
    'admin-settings': 'System Settings',
    'low-stock-alerts': 'Low Stock Alerts',
    'customer-orders': 'Customer Orders',
    'customer-services': 'Customer Services',
    'rewards': 'Rewards',
    'support': 'Support',
    'performance': 'Performance',
    'schedule': 'Schedule',
    'track': 'Track Orders'
  };

  const breadcrumbs: BreadcrumbItem[] = [];
  
  let currentPath = '';
  pathnames.forEach((pathname, index) => {
    currentPath += `/${pathname}`;
    const label = breadcrumbMap[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);
    breadcrumbs.push({ label, path: currentPath });
  });

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on the home page
  }

  return (
    <nav className="mb-6" aria-label="breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.path}>
            <li>
              <ChevronRight className="w-4 h-4" />
            </li>
            <li>
              {index === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-medium">{breadcrumb.label}</span>
              ) : (
                <Link 
                  to={breadcrumb.path} 
                  className="hover:text-foreground transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
};

export default BreadcrumbNav;