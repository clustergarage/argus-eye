import Header from './Header'

import 'milligram/dist/milligram.css'
import '../styles/style.css'

const layoutStyle = {
  margin: 20,
  //padding: 20,
  //border: '1px solid #ddd',
}

const Layout = (props) => (
  <div style={layoutStyle}>
    {/*<Header />*/}
    {props.children}
  </div>
)

export default Layout
