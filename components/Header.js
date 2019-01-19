import Link from 'next/link'
import {Eye} from 'react-feather'

const Header = () => (
  <div>
    <h1>
      Argus
      <i className="logo"><Eye size={48} /></i>
    </h1>

    <div className="header">
      <Link href="/">
        <a>Visual editor</a>
      </Link>
      <Link href="/object-config">
        <a>Export configuration</a>
      </Link>
    </div>

    <style jsx>{`
    h1 i {
      vertical-align: sub;
      margin: 1rem 0 0 1rem;
    }

    .header {
      margin-bottom: 3rem;
    }

    .header a {
      margin-right: 3rem;
    }
    `}</style>
  </div>
)

export default Header
