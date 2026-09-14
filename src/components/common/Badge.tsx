import React from 'react';
import { ReportStatus, UnitType, UserRole } from '../../types';
import { REPORT_STATUSES, USER_ROLES, UNIT_TYPES } from '../../lib/constants';
import { Clock, CheckCircle2, AlertCircle, FileEdit, HelpCircle } from 'lucide-react';

interface ReportBadgeProps {
  status: ReportStatus | 'unsubmitted';
  showIcon?: boolean;
  className?: string;
}

export const ReportBadge: React.FC<ReportBadgeProps> = ({ status, showIcon = true, className = '' }) => {
  if (status === 'unsubmitted') {
    return (
      <span className={`status-badge badge-unsubmitted ${className}`}>
        {showIcon && <HelpCircle className="w-3.5 h-3.5" />}
        <span>لم يرفع بعد</span>
      </span>
    );
  }

  const info = REPORT_STATUSES[status] || {
    label: status,
    badgeClass: 'badge-unsubmitted',
    iconName: 'FileEdit'
  };

  const renderIcon = () => {
    switch (status) {
      case 'draft':
        return <FileEdit className="w-3.5 h-3.5" />;
      case 'submitted':
        return <Clock className="w-3.5 h-3.5" />;
      case 'returned':
        return <AlertCircle className="w-3.5 h-3.5" />;
      case 'closed':
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  return (
    <span className={`status-badge ${info.badgeClass} ${className}`}>
      {showIcon && renderIcon()}
      <span>{info.label}</span>
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole; className?: string }> = ({ role, className = '' }) => {
  const info = USER_ROLES[role] || { label: role, color: 'text-slate-700', bg: 'bg-slate-100' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${info.bg} ${info.color} ${className}`}>
      {info.label}
    </span>
  );
};

export const UnitTypeBadge: React.FC<{ type: UnitType; className?: string }> = ({ type, className = '' }) => {
  const info = UNIT_TYPES[type] || { label: type };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 ${className}`}>
      {info.label}
    </span>
  );
};
