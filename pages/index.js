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
import {
  mapState as mapConfigState,
  mapDispatch as mapConfigDispatch,
} from '../reducers/object-config'

class Index extends React.Component {
  constructor(props) {
    super(props)

    this.onSelectorSubmit = this.onSelectorSubmit.bind(this)
    this.onLoadRootDirectory = this.onLoadRootDirectory.bind(this)
  }

  onSelectorSubmit(selector) {
    this.props.dispatchSetSelector && this.props.dispatchSetSelector(selector)
  }

  onLoadRootDirectory(cid, directory) {
    this.props.dispatchSetRootDirectory(cid, directory)

    // @TODO: make this a user action
    this.props.dispatchCreateSubject()
    this.props.dispatchSelectSubject(this.props.subjects.length - 1)
  }

  render() {
    return (
      <Layout>
        <h1>
          Argus
          <i><Eye size={48} /></i>
        </h1>

        <Search onSelectorSubmit={this.onSelectorSubmit}
          onLoadRootDirectory={this.onLoadRootDirectory} />

        <div className="file-viewer">
          {this.props.directory &&
            <h2>
              File Viewer&nbsp;
              <small>(PID: {this.props.directory.split('/')[2]})</small>
            </h2>}
            <FileTree directory={this.props.directory}
              subject={this.props.selectedSubject} />
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

// @TODO: de-uglify this

const mapState = state => (Object.assign({},
  mapSearchState(state),
  mapConfigState(state)))

const mapDispatch = dispatch => (Object.assign({},
  mapSearchDispatch(dispatch),
  mapConfigDispatch(dispatch)))

export default connect(mapState, mapDispatch)(Index)
