import React, {Children} from 'react'
import Link from 'next/link'
import {withRouter} from 'next/router'

const ActiveLink = withRouter(({router, children, as, href, ...props}) => (
   <Link href={href} as={as} {...props}>
    {React.cloneElement(Children.only(children), {
      className: (router.asPath === href || router.asPath === as) ? `active` : null
    })}
  </Link>
))

export default withRouter(ActiveLink)
