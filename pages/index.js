import React from 'react'
import {connect} from 'react-redux'
import {Eye} from 'react-feather'

import Layout from '../components/Layout'
import FileTree from '../components/FileTree'
import Search from '../components/Search'
import {
  mapState as mapSearchState,
  mapDispatch as mapSearchDispatch,
} from '../reducers/search'

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      directory: this.props.directory || '',
    }

    this.onLoadRootDirectory = this.onLoadRootDirectory.bind(this)
  }

  onLoadRootDirectory(cid, directory) {
    this.setState({directory})
    this.props.dispatchLoadRootDirectory(cid, directory)
  }

  render() {
    return (
      <Layout>
        <h1>
          Argus
          <i><Eye size={48} /></i>
        </h1>

        <Search onLoadRootDirectory={this.onLoadRootDirectory} />

        <div className="file-viewer">
          {this.state.directory &&
            <h2>
              File Viewer&nbsp;
              <small>(PID: {this.state.directory.split('/')[2]})</small>
            </h2>}
          <FileTree directory={this.state.directory} />
        </div>

        <style jsx>{`
          h1 i {
            vertical-align: sub;
            margin: 1rem 0 0 1rem;
          }

          .file-viewer {
            margin-top: 4rem;
          }

          .file-viewer h2 small {
            font: 1.75rem "Ubuntu Mono", monospace;
          }
        `}</style>
      </Layout>
    )
  }
}

export default connect(mapSearchState, mapSearchDispatch)(Index)
