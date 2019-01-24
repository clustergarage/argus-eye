import React from 'react'
import Header from './Header'

import 'milligram/dist/milligram.css'
import '../styles/style.css'

class Layout extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="layout">
        <div className="container">
          <div className="row">
            <div className="column">
              {<Header />}
              {this.props.children}
            </div>
          </div>
        </div>

        <style jsx>{`
        .layout {
          margin: 2rem;
        }
        `}</style>
      </div>
    )
  }
}

export default Layout
