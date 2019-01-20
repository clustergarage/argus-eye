import React from 'react'
import Header from './Header'
import {connect} from 'react-redux'

import 'milligram/dist/milligram.css'
import '../styles/style.css'

class Layout extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="layout">
        {<Header watchers={this.props.watchers} />}
        {this.props.children}

        <style jsx>{`
        .layout {
          margin: 2rem;
        }
        `}</style>
      </div>
    )
  }
}

export default connect()(Layout)
