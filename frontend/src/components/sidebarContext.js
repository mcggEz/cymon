import { createContext, useContext } from 'react'

// Lets the page headers (PageHeader / StaffHeader) open the mobile sidebar
// drawer owned by the layout. Defaults to a no-op so headers work standalone.
export const SidebarContext = createContext({ openSidebar: () => {} })

export const useSidebar = () => useContext(SidebarContext)
