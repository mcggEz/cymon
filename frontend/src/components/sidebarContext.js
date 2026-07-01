import { createContext, useContext } from 'react'

// Lets the page headers (PageHeader / StaffHeader) drive the sidebar owned by
// the layout: open the mobile drawer, and collapse/expand on desktop. Defaults
// to no-ops so headers work standalone.
export const SidebarContext = createContext({
  openSidebar: () => {},
  collapsed: false,
  toggleCollapsed: () => {},
})

export const useSidebar = () => useContext(SidebarContext)
