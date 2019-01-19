import Header from './Header'

import 'milligram/dist/milligram.css'
import '../styles/style.css'

const Layout = (props) => (
  <div className="layout">
    {<Header />}
    {props.children}

    <style jsx>{`
    .layout {
      margin: 2rem;
    }
    `}</style>
  </div>
)

export default Layout
