import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Company, StatusCode } from '@/types/database'

interface CompanyState {
  companies: Company[]
  selectedCompany: Company | null
  filter: {
    status?: StatusCode
    phase?: string
    searchQuery?: string
  }
  
  // Actions
  setCompanies: (companies: Company[]) => void
  updateCompany: (id: string, updates: Partial<Company>) => void
  selectCompany: (company: Company | null) => void
  updateCompanyStatus: (id: string, newStatus: StatusCode) => void
  setFilter: (filter: CompanyState['filter']) => void
  
  // Computed
  getFilteredCompanies: () => Company[]
}

export const useCompanyStore = create<CompanyState>()(
  immer((set, get) => ({
    companies: [],
    selectedCompany: null,
    filter: {},
    
    setCompanies: (companies) =>
      set((state) => {
        state.companies = companies
      }),
    
    updateCompany: (id, updates) =>
      set((state) => {
        const index = state.companies.findIndex((c) => c.id === id)
        if (index !== -1) {
          state.companies[index] = { ...state.companies[index], ...updates }
        }
      }),
    
    selectCompany: (company) =>
      set((state) => {
        state.selectedCompany = company
      }),
    
    updateCompanyStatus: (id, newStatus) =>
      set((state) => {
        const index = state.companies.findIndex((c) => c.id === id)
        if (index !== -1) {
          state.companies[index].current_status = newStatus
          state.companies[index].status_changed_at = new Date().toISOString()
        }
      }),
    
    setFilter: (filter) =>
      set((state) => {
        state.filter = filter
      }),
    
    getFilteredCompanies: () => {
      const { companies, filter } = get()
      
      return companies.filter((company) => {
        if (filter.status && company.current_status !== filter.status) {
          return false
        }
        
        if (filter.phase && company.phase !== filter.phase) {
          return false
        }
        
        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase()
          return (
            company.name.toLowerCase().includes(query) ||
            company.code?.toLowerCase().includes(query) ||
            company.contact_person?.toLowerCase().includes(query)
          )
        }
        
        return true
      })
    },
  }))
)