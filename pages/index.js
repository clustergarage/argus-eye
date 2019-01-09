import React from 'react'
import {connect} from 'react-redux'
import {Eye} from 'react-feather'

import Layout from '../components/Layout'
import Search from '../components/Search'
import FileTree from '../components/FileTree'
import WatcherOptions from '../components/WatcherOptions'
import {
  mapState as mapSearchState,
  mapDispatch as mapSearchDispatch,
} from '../reducers/search'
import {
  mapState as mapTreeState,
  mapDispatch as mapTreeDispatch,
} from '../reducers/file-tree'
import {
  mapState as mapConfigState,
  mapDispatch as mapConfigDispatch,
} from '../reducers/object-config'

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isRecursive: this.props.selectedSubject !== null && this.props.subjects[this.props.selectedSubject].recursive || false,
    }

    this.onSelectorSubmit = this.onSelectorSubmit.bind(this)
    this.onLoadRootDirectory = this.onLoadRootDirectory.bind(this)
    this.onRecursiveChange = this.onRecursiveChange.bind(this)
    this.onIgnoreClick = this.onIgnoreClick.bind(this)
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

  onRecursiveChange(subject) {
    this.props.toggleRecursive(subject)
    this.setState({isRecursive: subject.recursive})
  }

  onIgnoreClick(path) {
    if (this.props.isVisible[path]) {
      this.props.toggleVisibility(path)
    }
  }

  getSelectedSubject() {
    return this.props.subjects[this.props.selectedSubject]
  }

  render() {
    return (
      <Layout>
        <div className="container">
          <div className="row">
            <h1>
              Argus
              <i><Eye size={48} /></i>
            </h1>
          </div>

          <div className="row">
            <div className="column">
              <Search onSelectorSubmit={this.onSelectorSubmit}
                onLoadRootDirectory={this.onLoadRootDirectory} />
            </div>
          </div>

          <div className="row tool-container">
            <div className="column file-viewer">
              {this.props.directory &&
                <h2>
                  File Viewer&nbsp;
                  <small>(PID: {this.props.directory.split('/')[2]})</small>
                </h2>}
                <FileTree directory={this.props.directory}
                  subject={this.getSelectedSubject()} 
                  recursive={this.state.isRecursive}
                  onIgnoreClick={this.onIgnoreClick} />
            </div>
            {this.props.selectedSubject !== null &&
              <div className="column column-33 watcher-options">
                <h3>Watcher Options</h3>
                <WatcherOptions subject={this.getSelectedSubject()}
                  recursive={this.state.isRecursive}
                  onRecursiveChange={this.onRecursiveChange} />
              </div>}
          </div>
        </div>

        <style jsx>{`
          h1 i {
            vertical-align: sub;
            margin: 1rem 0 0 1rem;
          }

          .tool-container {
            margin-top: 4rem;
          }

          .file-viewer h2 small {
            font: 1.75rem "Ubuntu Mono", monospace;
          }

          .watcher-options {
          }
        `}</style>
      </Layout>
    )
  }
}

// @TODO: de-uglify this

const mapState = state => (Object.assign({},
  mapSearchState(state),
  mapTreeState(state),
  mapConfigState(state)))

const mapDispatch = dispatch => (Object.assign({},
  mapSearchDispatch(dispatch),
  mapTreeDispatch(dispatch),
  mapConfigDispatch(dispatch)))

export default connect(mapState, mapDispatch)(Index)
