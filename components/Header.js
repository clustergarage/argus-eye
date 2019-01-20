import React from 'react'
import {withRouter} from 'next/router'
import {connect} from 'react-redux'
import {Eye} from 'react-feather'

import ActiveLink from './ActiveLink'

import {mapState, mapDispatch} from '../reducers/watchers'

class Header extends React.Component {
  render() {
    return (
      <div>
        <h1>
          Argus&nbsp;
          <i className="logo"><Eye size={48} /></i>
        </h1>

        <div className="header">
          <ActiveLink prefetch href="/watchers">
            <a>
              Watchers&nbsp;
              <small><em>{this.props.watchers.length}</em></small>
            </a>
          </ActiveLink>
          <ActiveLink prefetch href="/">
            <a>Visual editor</a>
          </ActiveLink>
          <ActiveLink prefetch href="/export-config">
            <a>Export configuration</a>
          </ActiveLink>
        </div>

        <style jsx>{`
        h1 {
          margin-left: 2rem;
        }

        h1 i {
          vertical-align: sub;
          margin-top: 1rem;
        }
        `}</style>
      </div>
    )
  }
}

export default withRouter(connect(mapState, mapDispatch)(Header))
