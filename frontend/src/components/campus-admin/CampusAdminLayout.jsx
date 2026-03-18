import CampusAdminSidebar from './CampusAdminSidebar'
import Navbar from '../Navbar'

function CampusAdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <CampusAdminSidebar />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default CampusAdminLayout
