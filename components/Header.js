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
        <style global jsx>{`
        .header {
          border-bottom: 2px solid #d9e2ec;
          margin-bottom: 4rem;
        }

        .header a {
          display: inline-block;
          font-size: 1.5rem;
          margin-bottom: -2px;
          padding: 1rem 2rem;
        }

        .header a:hover {
        }

        .header a.active {
          border: 2px solid #d9e2ec;
          border-bottom: 2px solid #fff;
          border-radius: 0.6rem 0.6rem 0 0;
        }

        .header a:first-child {
          margin-left: 2rem;
        }

        .header a small em {
          color: #000;
          background-color: #c1fef6;
          font-weight: bold;
          font-style: normal;
          padding: 0.2rem 0.6rem;
          border-radius: 50%;
        }
        `}</style>
      </div>
    )
  }
}

export default withRouter(connect(mapState, mapDispatch)(Header))
