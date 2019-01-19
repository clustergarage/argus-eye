import React from 'react'
import {connect} from 'react-redux'

import Layout from '../components/Layout'
import Search from '../components/Search'
import FileTree from '../components/FileTree'
import WatcherOptions from '../components/WatcherOptions'
import {mapState as mapSearchState, mapDispatch as mapSearchDispatch} from '../reducers/search'
import {mapState as mapTreeState, mapDispatch as mapTreeDispatch} from '../reducers/file-tree'
import {mapState as mapConfigState, mapDispatch as mapConfigDispatch} from '../reducers/object-config'

class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: this.props.name || '',
      namespace: this.props.namespace || '',
      spec: this.getSubjectState(this.props.selectedSubject),
      isLoading: false,
    }

    this.handleNameChange = this.handleNameChange.bind(this)
    this.handleNamespaceChange = this.handleNamespaceChange.bind(this)
    this.onSelectorSubmit = this.onSelectorSubmit.bind(this)
    this.onLoadRootDirectory = this.onLoadRootDirectory.bind(this)
    this.onCreateSubjectClick = this.onCreateSubjectClick.bind(this)
    this.onSelectSubjectClick = this.onSelectSubjectClick.bind(this)
    this.onIgnoreClick = this.onIgnoreClick.bind(this)
    this.onRecursiveChange = this.onRecursiveChange.bind(this)
    this.onMaxDepthChange = this.onMaxDepthChange.bind(this)
    this.onOnlyDirChange = this.onOnlyDirChange.bind(this)
    this.onFollowMoveChange = this.onFollowMoveChange.bind(this)
    this.onTagsChange = this.onTagsChange.bind(this)
  }

  handleNameChange(event) {
     this.setState({name: event.target.value})
    this.props.dispatchSetName(event.target.value)
  }

  handleNamespaceChange(event) {
     this.setState({namespace: event.target.value})
    this.props.dispatchSetNamespace(event.target.value)
  }

  onSelectorSubmit(selector) {
    this.props.dispatchSetSelector(selector)
    this.props.dispatchClearSearchState()
  }

  onLoadRootDirectory(cid, directory) {
    this.setState({isLoading: true})
    // @TODO: confirm with the user before clearing config state especially
    this.props.dispatchClearConfigState()

    this.props.dispatchSetRootDirectory(cid, directory)
    this.createAndSelectSubject()
    this.setState({isLoading: false})
  }

  onCreateSubjectClick() {
    this.createAndSelectSubject()
  }

  createAndSelectSubject() {
    const len = this.props.spec.subjects.length
    this.props.dispatchCreateSubject()
    this.selectSubject(len)
  }

  onSelectSubjectClick(index) {
    this.selectSubject(index)
  }

  selectSubject(index) {
    this.props.dispatchSelectSubject(index)
    this.setState({spec: this.getSubjectState(index)})
  }

  getSubjectState(index) {
    const subject = this.props.spec.subjects[index] || {}
    const tags = Object.keys(subject.tags || {})
      .map(tag => `${tag}=${subject.tags[tag]}`)
      .join(',')
    return {
      recursive: subject.recursive || false,
      maxDepth: subject.maxDepth || '',
      onlyDir: subject.onlyDir || false,
      followMove: subject.followMove || false,
      tags: tags,
    }
  }

  onIgnoreClick(path) {
    if (this.props.isVisible[path]) {
      this.props.toggleVisibility(path)
    }
  }

  onRecursiveChange(subject) {
    this.props.toggleRecursive(subject)
    this.setState({spec: {...this.state.spec, recursive: subject.recursive}})
  }

  onMaxDepthChange(subject, value) {
    this.props.dispatchSetMaxDepth(subject, value)
    this.setState({spec: {...this.state.spec, maxDepth: value}})
  }

  onOnlyDirChange(subject) {
    this.props.toggleOnlyDir(subject)
    this.setState({spec: {...this.state.spec, onlyDir: subject.onlyDir}})
  }

  onFollowMoveChange(subject) {
    this.props.toggleFollowMove(subject)
    this.setState({spec: {...this.state.spec, followMove: subject.followMove}})
  }

  onTagsChange(tags) {
    this.setState({spec: {...this.state.spec, tags}})
  }

  getSelectedSubject() {
    return this.props.spec.subjects[this.props.selectedSubject]
  }

  render() {
    return (
      <Layout>
        <div className="container">
          <div className="row">
            <div className="column">
              <label>
                Name
                <input type="text"
                  value={this.state.name}
                  onChange={this.handleNameChange}
                  placeholder="mywatcher" />
              </label>
            </div>
            <div className="column">
              <label>
                Namespace
                <input type="text"
                  value={this.state.namespace}
                  onChange={this.handleNamespaceChange}
                  placeholder="mynamespace" />
              </label>
            </div>
          </div>
          <div className="row">
            <div className="column">
              <Search onSelectorSubmit={this.onSelectorSubmit}
                onLoadRootDirectory={this.onLoadRootDirectory} />
            </div>
          </div>

          {!this.state.isLoading &&
          <div className="row tool-container">
            {this.props.directory &&
            <div className="column file-viewer">
              <h2>
                File Viewer&nbsp;
                <small>(PID: {this.props.directory.split('/')[2]})</small>
              </h2>
              <FileTree directory={this.props.directory}
                subject={this.getSelectedSubject()}
                recursive={this.state.spec.recursive}
                maxDepth={this.state.spec.maxDepth}
                onIgnoreClick={this.onIgnoreClick} />
            </div>}
            {this.props.selectedSubject !== null &&
            <div className="column column-33">
              <div>
                <div className="watcher-subjects">
                  <h3>Watcher Subjects</h3>
                  {this.props.spec.subjects.map((subject, index) => (
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
                    recursive={this.state.spec.recursive}
                    maxDepth={this.state.spec.maxDepth}
                    onlyDir={this.state.spec.onlyDir}
                    followMove={this.state.spec.followMove}
                    tags={this.state.spec.tags}
                    onRecursiveChange={this.onRecursiveChange}
                    onMaxDepthChange={this.onMaxDepthChange}
                    onOnlyDirChange={this.onOnlyDirChange}
                    onFollowMoveChange={this.onFollowMoveChange}
                    onTagsChange={this.onTagsChange} />
                </div>
              </div>
            </div>}
          </div>}
        </div>

        <style jsx>{`
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
          padding: 1rem;
          margin-bottom: 1rem;
          cursor: pointer;
        }

        .watcher-subjects .subject.active {
          color: #000;
          border-width: 3px;
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

const mapState = state => (Object.assign({},
  mapSearchState(state),
  mapTreeState(state),
  mapConfigState(state)))

const mapDispatch = dispatch => (Object.assign({},
  mapSearchDispatch(dispatch),
  mapTreeDispatch(dispatch),
  mapConfigDispatch(dispatch)))

export default connect(mapState, mapDispatch)(Index)
