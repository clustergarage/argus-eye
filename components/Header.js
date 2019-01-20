import React, {Children} from 'react'
import Link from 'next/link'
import {withRouter} from 'next/router'
import {connect} from 'react-redux'
import {Eye} from 'react-feather'

import {mapState, mapDispatch} from '../reducers/watchers'

const ActiveLink = withRouter(({router, children, as, href, ...props}) => (
   <Link href={href} as={as} {...props}>
    {React.cloneElement(Children.only(children), {
      className: (router.asPath === href || router.asPath === as) ? `active` : null
    })}
  </Link>
));

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

export default connect(mapState, mapDispatch)(Header)
