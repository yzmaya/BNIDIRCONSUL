import { useState } from 'react'
import FileUpload from './components/FileUpload'
import Dashboard from './components/Dashboard'

export default function App() {
  const [data, setData] = useState(null)

  if (!data) {
    return <FileUpload onParsed={setData} />
  }

  return <Dashboard data={data} onReset={() => setData(null)} />
}
