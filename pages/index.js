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
    this.state = this.getSubjectState(this.props.selectedSubject)

    this.onSelectorSubmit = this.onSelectorSubmit.bind(this)
    this.onLoadRootDirectory = this.onLoadRootDirectory.bind(this)
    this.onCreateSubjectClick = this.onCreateSubjectClick.bind(this)
    this.onSelectSubjectClick = this.onSelectSubjectClick.bind(this)
    this.onIgnoreClick = this.onIgnoreClick.bind(this)
    this.onRecursiveChange = this.onRecursiveChange.bind(this)
    this.onMaxDepthChange = this.onMaxDepthChange.bind(this)
    this.onOnlyDirChange = this.onOnlyDirChange.bind(this)
    this.onFollowMoveChange = this.onFollowMoveChange.bind(this)
  }

  onSelectorSubmit(selector) {
    this.props.dispatchSetSelector && this.props.dispatchSetSelector(selector)
  }

  onLoadRootDirectory(cid, directory) {
    this.props.dispatchSetRootDirectory(cid, directory)
    this.createAndSelectSubject()
  }

  onCreateSubjectClick() {
    this.createAndSelectSubject()
  }

  createAndSelectSubject() {
    const len = this.props.subjects.length
    this.props.dispatchCreateSubject()
    this.selectSubject(len)
  }

  onSelectSubjectClick(index) {
    this.selectSubject(index)
  }

  selectSubject(index) {
    this.props.dispatchSelectSubject(index)
    this.setState(this.getSubjectState(index))
  }

  getSubjectState(index) {
    const subject = this.props.subjects[index] || {}
    return {
      recursive: subject.recursive || false,
      maxDepth: subject.maxDepth || '',
      onlyDir: subject.onlyDir || false,
      followMove: subject.followMove || false,
    }
  }

  onIgnoreClick(path) {
    if (this.props.isVisible[path]) {
      this.props.toggleVisibility(path)
    }
  }

  onRecursiveChange(subject) {
    this.props.toggleRecursive(subject)
    this.setState({recursive: subject.recursive})
  }

  onMaxDepthChange(subject, value) {
    this.props.dispatchSetMaxDepth(subject, value)
    this.setState({maxDepth: value})
  }

  onOnlyDirChange(subject) {
    this.props.toggleOnlyDir(subject)
    this.setState({onlyDir: subject.onlyDir})
  }

  onFollowMoveChange(subject) {
    this.props.toggleFollowMove(subject)
    this.setState({followMove: subject.followMove})
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
              <i className="logo"><Eye size={48} /></i>
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
                recursive={this.state.recursive}
                maxDepth={this.state.maxDepth}
                onIgnoreClick={this.onIgnoreClick} />
            </div>
            <div className="column column-33">
              {this.props.selectedSubject !== null &&
              <div>
                <div className="watcher-subjects">
                  <h3>Watcher Subjects</h3>
                  {this.props.subjects.map((subject, index) => (
                  <div key={index}
                    onClick={() => this.onSelectSubjectClick(index)}
                    className={`subject ${this.props.selectedSubject === index ? 'active' : ''}`}>
                    <div className="title">
                      Subject {index}
                    </div>
                    <small>
                      paths = {subject.paths.length};
                      events = {subject.events.length};
                      recursive = {subject.recursive ? 'Y' : 'N'}
                    </small>
                  </div>
                  ))}
                  <button type="button"
                    onClick={this.onCreateSubjectClick}
                    className="button button-small create-subject">
                    Create subject
                  </button>
                </div>
                <div className="watcher-options">
                  <h3>Watcher Options</h3>
                  <WatcherOptions subject={this.getSelectedSubject()}
                    recursive={this.state.recursive}
                    maxDepth={this.state.maxDepth}
                    onlyDir={this.state.onlyDir}
                    followMove={this.state.followMove}
                    onRecursiveChange={this.onRecursiveChange}
                    onMaxDepthChange={this.onMaxDepthChange}
                    onOnlyDirChange={this.onOnlyDirChange}
                    onFollowMoveChange={this.onFollowMoveChange} />
                </div>
              </div>}
            </div>
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

        .watcher-subjects {
          margin-bottom: 3rem;
        }

        .watcher-subjects .subject {
          border: 1px solid #c6f7e2;
          border-radius: 0.6rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          cursor: pointer;
        }

        .watcher-subjects .subject.active {
          color: #000;
          border-width: 2px;
          background-color: #effcf6;
        }

        .watcher-subjects .title {
          font-size: 1.5rem;
        }

        .watcher-subjects .subject small {
          font: 1.2rem "Ubuntu Mono", monospace;
        }

        .watcher-subjects .button {
          color: #000;
          background-color: #c6f7e2;
          border-color: #c6f7e2;
        }

        .watcher-subjects .button:hover {
          color: #fff;
          background-color: #606c76;
          border-color: #606c76;
        }

        .watcher-subjects .button.create-subject {
          font-size: 0.8rem;
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
