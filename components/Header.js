import React from 'react'
import Link from 'next/link'
import {withRouter} from 'next/router'
import {connect} from 'react-redux'
import {Eye} from 'react-feather'

import ActiveLink from './ActiveLink'

import {mapState as mapSearchState, mapDispatch as mapSearchDispatch} from '../reducers/search'
import {mapState as mapConfigState, mapDispatch as mapConfigDispatch} from '../reducers/object-config'
import {mapState as mapWatchersState, mapDispatch as mapWatchersDispatch} from '../reducers/watchers'

class Header extends React.Component {
  constructor(props) {
    super(props)

    this.handleStopEditingClick = this.handleStopEditingClick.bind(this)
  }

  handleStopEditingClick() {
    this.props.dispatchSetEditing(null)
    this.props.dispatchClearSearchState()
    this.props.dispatchClearConfigState()
    this.props.dispatchSetLabelSelector('')
  }

  render() {
    return (
      <div>
        <h1>
          Argus&nbsp;
          <i className="logo"><Eye size={48} /></i>
        </h1>

        <div className="header">
          <ActiveLink href="/watchers"
            as="/watchers"
            prefetch>
            <a>
              Watchers&nbsp;
              <small><em>{this.props.watchers.length}</em></small>
            </a>
          </ActiveLink>
          <ActiveLink href="/index"
            as="/"
            prefetch>
            <a>Visual editor</a>
          </ActiveLink>
          <ActiveLink href="/export-config"
            as="/export-config"
            prefetch>
            <a>Export configuration</a>
          </ActiveLink>
        </div>

        {this.props.editing !== null &&
        <div className="editing">
          <button className="button button-small"
            onClick={this.handleStopEditingClick}>
            stop editing
          </button>
          <h5>
            Editing <b>{this.props.metadata.namespace} /&nbsp;
            <a>{this.props.metadata.name}</a></b>
          </h5>
          <div>
            You are editing an existing watcher.
            Once you are done making changes,&nbsp;
            <Link href="/export-config">
              <a>export or apply changes</a>
            </Link> in the cluster.
          </div>
        </div>}

        <style jsx>{`
        h1 {
          margin-left: 2rem;
        }

        h1 i {
          vertical-align: sub;
          margin-top: 1rem;
        }

        .editing {
          position: relative;
          font-size: 1.4rem;
          background-color: #effcf6;
          margin-bottom: 3rem;
          padding: 2rem 3rem 2.5rem;
          border-radius: 1rem;
        }

        .editing h5 {
          margin-bottom: 1rem;
        }

        .editing .button {
          position: absolute;
          top: 1rem;
          right: 3rem;
          color: #000;
          background-color: #c6f7e2;
          border-color: #c6f7e2;
          margin-top: 1rem;
        }

        .editing .button:hover {
          color: #fff;
          background-color: #606c76;
          border-color: #606c76;
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

const mapState = state => (Object.assign({},
  mapSearchState(state),
  mapConfigState(state),
  mapWatchersState(state)))

const mapDispatch = dispatch => (Object.assign({},
  mapSearchDispatch(dispatch),
  mapConfigDispatch(dispatch),
  mapWatchersDispatch(dispatch)))

export default withRouter(connect(mapState, mapDispatch)(Header))
