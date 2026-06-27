import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminModeration from './AdminModeration';
import AdminCategories from './AdminCategories';
import AdminAnnouncements from './AdminAnnouncements';
import AdminReports from './AdminReports';
import AdminAudit from './AdminAudit';

// Maps the sidebar `section` key to the matching admin view.
export default function AdminPanel({ section }) {
  switch (section) {
    case 'admin_users':      return <AdminUsers />;
    case 'admin_demandes':   return <AdminModeration resource="demandes" />;
    case 'admin_offres':     return <AdminModeration resource="offres" />;
    case 'admin_avis':       return <AdminModeration resource="avis" />;
    case 'admin_categories': return <AdminCategories />;
    case 'admin_announce':   return <AdminAnnouncements />;
    case 'admin_reports':    return <AdminReports />;
    case 'admin_audit':      return <AdminAudit />;
    case 'overview':
    default:                 return <AdminOverview />;
  }
}
