import { Dashboard } from '../../src/routes/dashboard/Dashboard.page'
import dynamic from 'next/dynamic'

export default dynamic(() => Promise.resolve(Dashboard), { ssr: false })
